import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Title,
  TextInput,
  Select,
  Textarea,
  NumberInput,
  Button,
  LoadingOverlay,
  Divider,
  Grid,
  Table,
  ActionIcon,
  ScrollArea,
  Badge,
  Checkbox,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';
import '@mantine/dates/styles.css';
import { validateRequired } from '../utils/validators';

/**
 * SaleForm Component
 * Form for creating/editing sale transactions with dynamic line items.
 * Implements FR-SALE-001 through FR-SALE-055.
 *
 * Columns match original system:
 * سٹاک | مچھلی | ریٹ فی من | ریٹ فی کلوگرام | گابک | وزن کلوگرام | برف | کرایہ | ٹوٹل رقم | نقدی | وصولی | Delete
 *
 * @param {Object} editSale - Sale object to edit (null for new)
 * @param {function} onSaved - Callback after successful save
 * @param {function} onCancel - Callback to cancel/close form
 */
function SaleForm({ editSale, onSaved, onCancel }) {
  // Form state
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [itemsList, setItemsList] = useState([]);

  // Header fields
  const [saleNumber, setSaleNumber] = useState('00000');
  const [saleDate, setSaleDate] = useState(new Date());
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [details, setDetails] = useState('');

  // Line items
  const [lineItems, setLineItems] = useState([createEmptyLineItem()]);

  function createEmptyLineItem() {
    return {
      id: Date.now() + Math.random(),
      item_id: null,
      customer_id: null,
      is_stock: false,
      rate_per_maund: 0,
      rate: 0,
      weight: 0,
      fare_charges: 0,
      ice_charges: 0,
      cash_amount: 0,
      receipt_amount: 0,
      notes: '',
    };
  }

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersRes, suppliersRes, itemsRes, nextNumRes] = await Promise.all([
          window.api.customers.getAll(),
          window.api.suppliers.getAll(),
          window.api.items.getAll(),
          !editSale ? window.api.sales.getNextNumber() : Promise.resolve(null),
        ]);

        if (customersRes.success) {
          setCustomers(
            customersRes.data.map((c) => ({
              value: String(c.id),
              label: c.name + (c.name_english ? ` (${c.name_english})` : ''),
            }))
          );
        }

        if (suppliersRes.success) {
          setSuppliers(
            suppliersRes.data.map((s) => ({
              value: String(s.id),
              label: s.name + (s.name_english ? ` (${s.name_english})` : ''),
            }))
          );
        }

        if (itemsRes.success) {
          setItemsList(itemsRes.data);
        }

        if (nextNumRes?.success) {
          setSaleNumber(nextNumRes.data);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load form data',
          color: 'red',
        });
      }
    };
    loadData();
  }, [editSale]);

  // Load existing sale for editing
  useEffect(() => {
    if (editSale) {
      setSaleNumber(editSale.sale_number);
      setSaleDate(new Date(editSale.sale_date));
      setSelectedSupplier(editSale.supplier_id ? String(editSale.supplier_id) : null);
      setVehicleNumber(editSale.vehicle_number || '');
      setDetails(editSale.details || '');
      if (editSale.items && editSale.items.length > 0) {
        setLineItems(
          editSale.items.map((item) => ({
            id: item.id,
            item_id: String(item.item_id),
            customer_id: item.customer_id ? String(item.customer_id) : null,
            is_stock: !!item.is_stock,
            rate_per_maund: item.rate_per_maund || 0,
            rate: item.rate || 0,
            weight: item.weight || 0,
            fare_charges: item.fare_charges || 0,
            ice_charges: item.ice_charges || 0,
            cash_amount: item.cash_amount || 0,
            receipt_amount: item.receipt_amount || 0,
            notes: item.notes || '',
          }))
        );
      }
    }
  }, [editSale]);

  // Items dropdown options
  const itemOptions = useMemo(
    () =>
      itemsList.map((item) => ({
        value: String(item.id),
        label: item.name + (item.name_english ? ` (${item.name_english})` : ''),
      })),
    [itemsList]
  );

  // Update line item - with auto-calculation for dual rate
  const updateLineItem = useCallback((id, field, value) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updates = { [field]: value };

        // Dual rate auto-calculation: 1 Maund = 40 kg
        if (field === 'rate_per_maund') {
          updates.rate = (value || 0) / 40;
        } else if (field === 'rate') {
          updates.rate_per_maund = (value || 0) * 40;
        }

        return { ...item, ...updates };
      })
    );
  }, []);

  // Add new line item
  const addLineItem = useCallback(() => {
    setLineItems((prev) => [...prev, createEmptyLineItem()]);
  }, []);

  // Remove line item
  const removeLineItem = useCallback((id) => {
    setLineItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  // Calculate line item values
  const calculateLineValues = useCallback((item) => {
    const weight = item.weight || 0;
    const amount = weight * (item.rate || 0);
    const totalAmount = amount + (item.fare_charges || 0) + (item.ice_charges || 0);
    return { weight, amount, totalAmount };
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    let totalWeight = 0;
    let grossAmount = 0;
    let fareCharges = 0;
    let iceCharges = 0;
    let cashReceived = 0;
    let receiptAmount = 0;

    for (const item of lineItems) {
      const calculated = calculateLineValues(item);
      totalWeight += calculated.weight;
      grossAmount += calculated.amount;
      fareCharges += item.fare_charges || 0;
      iceCharges += item.ice_charges || 0;
      cashReceived += item.cash_amount || 0;
      receiptAmount += item.receipt_amount || 0;
    }

    const netAmount = grossAmount + fareCharges + iceCharges;
    const balanceAmount = netAmount - cashReceived - receiptAmount;

    return {
      totalWeight,
      grossAmount,
      fareCharges,
      iceCharges,
      netAmount,
      cashReceived,
      receiptAmount,
      balanceAmount,
    };
  }, [lineItems, calculateLineValues]);

  // Format date for API
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Save sale
  const handleSave = useCallback(async () => {
    // Validate that at least one line item has a customer
    const validItems = lineItems.filter((item) => item.item_id);
    if (validItems.length === 0) {
      notifications.show({
        title: 'توثیق کی خرابی / Validation Error',
        message: 'براہ کرم کم از کم ایک آئٹم شامل کریں / Please add at least one item',
        color: 'red',
      });
      return;
    }

    // Check each line item has a customer
    const itemsWithoutCustomer = validItems.filter((item) => !item.customer_id);
    if (itemsWithoutCustomer.length > 0) {
      notifications.show({
        title: 'توثیق کی خرابی / Validation Error',
        message: 'ہر آئٹم کے لیے گابک منتخب کریں / Please select a customer (گابک) for each item',
        color: 'red',
      });
      return;
    }

    // Stock availability check (FR-SALE-033, FR-VALID-006)
    try {
      const stockResult = await window.api.items.getAll();
      if (stockResult.success) {
        const stockMap = {};
        stockResult.data.forEach((item) => {
          stockMap[String(item.id)] = { stock: item.current_stock || 0, name: item.name };
        });

        // When editing, add back the weights already allocated to this sale
        if (editSale?.items) {
          for (const existingItem of editSale.items) {
            const key = String(existingItem.item_id);
            if (stockMap[key]) {
              stockMap[key].stock += existingItem.weight || 0;
            }
          }
        }

        const insufficientItems = validItems
          .map((item) => {
            const weight = item.weight || 0;
            const stockInfo = stockMap[String(item.item_id)];
            if (stockInfo && weight > stockInfo.stock) {
              return `${stockInfo.name}: need ${weight.toFixed(2)} kg, available ${stockInfo.stock.toFixed(2)} kg`;
            }
            return null;
          })
          .filter(Boolean);

        if (insufficientItems.length > 0) {
          notifications.show({
            title: 'Insufficient Stock',
            message: insufficientItems.join('\n'),
            color: 'red',
            autoClose: 8000,
          });
          return;
        }
      }
    } catch (error) {
      console.error('Stock check error:', error);
      notifications.show({
        title: 'Error',
        message: 'Unable to verify stock availability. Please try again.',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        customer_id: null, // No header-level customer — each line has its own
        supplier_id: selectedSupplier ? parseInt(selectedSupplier) : null,
        vehicle_number: vehicleNumber || null,
        sale_date: formatDate(saleDate),
        details: details || null,
        items: validItems.map((item) => ({
          item_id: parseInt(item.item_id),
          customer_id: item.customer_id ? parseInt(item.customer_id) : null,
          is_stock: item.is_stock,
          rate_per_maund: item.rate_per_maund || 0,
          rate: item.rate || 0,
          weight: item.weight || 0,
          fare_charges: item.fare_charges || 0,
          ice_charges: item.ice_charges || 0,
          cash_amount: item.cash_amount || 0,
          receipt_amount: item.receipt_amount || 0,
          notes: item.notes || null,
        })),
      };

      let response;
      if (editSale) {
        response = await window.api.sales.update(editSale.id, saleData);
      } else {
        response = await window.api.sales.create(saleData);
      }

      if (response.success) {
        notifications.show({
          title: 'بکری محفوظ / Sale Saved',
          message: editSale
            ? 'Sale updated successfully / بکری کامیابی سے اپ ڈیٹ ہو گئی'
            : `Sale ${response.data.saleNumber} created successfully / بکری نمبر ${response.data.saleNumber} کامیابی سے محفوظ`,
          color: 'green',
        });
        onSaved?.(response.data);
      } else {
        notifications.show({
          title: 'خرابی / Error',
          message: response.error || 'بکری محفوظ کرنے میں خرابی / Failed to save sale',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Save sale error:', error);
      notifications.show({
        title: 'خرابی / Error',
        message: 'بکری محفوظ کرنے میں خرابی / Failed to save sale',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [
    selectedSupplier,
    vehicleNumber,
    saleDate,
    details,
    lineItems,
    editSale,
    onSaved,
  ]);

  // Print receipt for saved sale
  const handlePrint = useCallback(() => {
    const dateStr = saleDate ? new Date(saleDate).toLocaleDateString('en-PK') : '';
    const validItems = lineItems.filter((item) => item.item_id);

    const itemRows = validItems
      .map((item) => {
        const calc = calculateLineValues(item);
        const itemInfo = itemsList.find((i) => String(i.id) === String(item.item_id));
        const custInfo = customers.find((c) => c.value === String(item.customer_id));
        return `<tr>
                <td>${itemInfo?.name || ''}</td>
                <td>${custInfo?.label || ''}</td>
                <td style="text-align:right">${calc.weight.toFixed(2)}</td>
                <td style="text-align:right">${item.rate?.toFixed(2) || '0.00'}</td>
                <td style="text-align:right">${calc.totalAmount.toFixed(2)}</td>
            </tr>`;
      })
      .join('');

    const html = `<!DOCTYPE html><html dir="rtl"><head><title>Sale Receipt - ${saleNumber}</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet" />
        <style>
            @page { margin: 1cm; }
            body { font-family: 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 20px; color: #333; direction: rtl; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
            .header h2 { margin: 0; } .header p { margin: 3px 0; font-size: 12px; }
            .info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 12px; }
            th { background: #f5f5f5; text-align: right; }
            .totals { text-align: right; font-size: 13px; }
            .totals td { border: none; padding: 3px 8px; }
            .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #333 !important; }
            @media print { body { padding: 0; } }
        </style></head><body>
        <div class="header">
            <h2>AL-SHEIKH FISH TRADER AND DISTRIBUTER</h2>
            <p style="font-size:18px;direction:rtl">اے ایل شیخ فش ٹریڈر اینڈ ڈسٹری بیوٹر</p>
            <p>Shop No. W-644 Gunj Mandi Rawalpindi</p>
            <p>Ph: +92-3008501724 | 051-5534607</p>
            <h3 style="margin:10px 0 0">Sale Receipt / بکری رسید</h3>
        </div>
        <div class="info">
            <div><strong>Receipt #:</strong> ${saleNumber}</div>
            <div><strong>Date:</strong> ${dateStr}</div>
        </div>
        <table>
            <thead><tr><th>مچھلی / Item</th><th>گابک / Customer</th><th style="text-align:right">وزن / Weight (kg)</th><th style="text-align:right">ریٹ / Rate</th><th style="text-align:right">ٹوٹل رقم / Amount</th></tr></thead>
            <tbody>${itemRows}</tbody>
        </table>
        <table class="totals">
            <tr><td>Gross Amount:</td><td>Rs. ${totals.grossAmount.toFixed(2)}</td></tr>
            <tr><td>Fare Charges / کرایہ:</td><td>Rs. ${totals.fareCharges.toFixed(2)}</td></tr>
            <tr><td>Ice Charges / برف:</td><td>Rs. ${totals.iceCharges.toFixed(2)}</td></tr>
            <tr><td>Net Amount:</td><td><strong>Rs. ${totals.netAmount.toFixed(2)}</strong></td></tr>
            <tr><td>Cash Received:</td><td>Rs. ${totals.cashReceived.toFixed(2)}</td></tr>
            <tr class="grand-total"><td>Balance:</td><td>Rs. ${totals.balanceAmount.toFixed(2)}</td></tr>
        </table>
        </body></html>`;

    // Use print preview instead of direct print
    try {
      window.api.print.preview(html, {
        title: `Sale Receipt - ${saleNumber} `,
        width: 1000,
        height: 800,
      });
    } catch (error) {
      console.error('Print error:', error);
      notifications.show({
        title: 'Print Error',
        message: 'Failed to open print preview',
        color: 'red',
      });
    }
  }, [
    customers,
    saleDate,
    saleNumber,
    lineItems,
    itemsList,
    totals,
    calculateLineValues,
  ]);

  // Clear form
  const handleClear = useCallback(() => {
    setSelectedSupplier(null);
    setVehicleNumber('');
    setDetails('');
    setLineItems([createEmptyLineItem()]);
  }, []);

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder pos="relative">
      <LoadingOverlay visible={loading} />

      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={4} className="text-blue-700">
            💰 {editSale ? 'Edit Sale' : 'New Sale'} (بکری)
          </Title>
          <Badge size="lg" variant="light" color="blue">
            {saleNumber}
          </Badge>
        </Group>

        <Divider />

        {/* Header Fields */}
        <Grid>
          <Grid.Col span={4}>
            <DatePickerInput
              label="بکری تاریخ (Sale Date)"
              placeholder="Select date"
              value={saleDate}
              onChange={setSaleDate}
              maxDate={new Date()}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="بیوپاری (Supplier)"
              placeholder="Select supplier (optional)"
              data={suppliers}
              value={selectedSupplier}
              onChange={setSelectedSupplier}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="گڑی نمبر (Vehicle No)"
              placeholder="Enter vehicle number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="ltr-field"
              dir="ltr"
              styles={{ input: { textAlign: 'left' } }}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={12}>
            <Textarea
              label="تفصیل (Details)"
              placeholder="Additional notes..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              minRows={1}
              maxRows={2}
            />
          </Grid.Col>
        </Grid>

        <Divider label="Line Items / اشیاء" labelPosition="center" />

        {/* Line Items Table */}
        <ScrollArea>
          <Table striped withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 50, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>سٹاک</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Stock</div>
                </Table.Th>
                <Table.Th style={{ minWidth: 140 }}>
                  <div style={{ fontWeight: 700 }}>مچھلی</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Item</div>
                </Table.Th>
                <Table.Th style={{ width: 90, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>ریٹ فی من</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Rate/Maund</div>
                </Table.Th>
                <Table.Th style={{ width: 90, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>ریٹ فی کلوگرام</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Rate/kg</div>
                </Table.Th>
                <Table.Th style={{ minWidth: 140 }}>
                  <div style={{ fontWeight: 700 }}>گابک</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Customer</div>
                </Table.Th>
                <Table.Th style={{ width: 88, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>وزن کلوگرام</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Weight (kg)</div>
                </Table.Th>
                <Table.Th style={{ width: 72, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>برف</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Ice</div>
                </Table.Th>
                <Table.Th style={{ width: 80, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>کرایہ</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Fare</div>
                </Table.Th>
                <Table.Th style={{ width: 96, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>ٹوٹل رقم</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Total Amt</div>
                </Table.Th>
                <Table.Th style={{ width: 84, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>نقدی</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Cash</div>
                </Table.Th>
                <Table.Th style={{ width: 84, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>وصولی</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Receipt</div>
                </Table.Th>
                <Table.Th style={{ width: 32 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {lineItems.map((item) => {
                const calculated = calculateLineValues(item);
                return (
                  <Table.Tr key={item.id}>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Checkbox
                        checked={item.is_stock}
                        onChange={(e) => updateLineItem(item.id, 'is_stock', e.currentTarget.checked)}
                        size="xs"
                      />
                    </Table.Td>
                    <Table.Td>
                      <Select
                        placeholder="Select"
                        data={itemOptions}
                        value={item.item_id}
                        onChange={(val) => updateLineItem(item.id, 'item_id', val)}
                        searchable
                        size="xs"
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.rate_per_maund}
                        onChange={(val) => updateLineItem(item.id, 'rate_per_maund', val || 0)}
                        min={0}
                        decimalScale={2}
                        size="xs"
                        hideControls
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.rate}
                        onChange={(val) => updateLineItem(item.id, 'rate', val || 0)}
                        min={0}
                        decimalScale={2}
                        size="xs"
                        hideControls
                      />
                    </Table.Td>
                    <Table.Td>
                      <Select
                        placeholder="Select"
                        data={customers}
                        value={item.customer_id}
                        onChange={(val) => updateLineItem(item.id, 'customer_id', val)}
                        searchable
                        size="xs"
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.weight}
                        onChange={(val) => updateLineItem(item.id, 'weight', val || 0)}
                        min={0}
                        decimalScale={2}
                        size="xs"
                        hideControls
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.ice_charges}
                        onChange={(val) => updateLineItem(item.id, 'ice_charges', val || 0)}
                        min={0}
                        decimalScale={2}
                        size="xs"
                        hideControls
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.fare_charges}
                        onChange={(val) => updateLineItem(item.id, 'fare_charges', val || 0)}
                        min={0}
                        decimalScale={2}
                        size="xs"
                        hideControls
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={600} c="blue">
                        {calculated.totalAmount.toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.cash_amount}
                        onChange={(val) => updateLineItem(item.id, 'cash_amount', val || 0)}
                        min={0}
                        decimalScale={2}
                        size="xs"
                        hideControls
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.receipt_amount}
                        onChange={(val) => updateLineItem(item.id, 'receipt_amount', val || 0)}
                        min={0}
                        decimalScale={2}
                        size="xs"
                        hideControls
                      />
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        size="sm"
                      >
                        ✕
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Button
          variant="light"
          color="teal"
          onClick={addLineItem}
          size="xs"
          leftSection={<span>+</span>}
        >
          Add Line Item
        </Button>

        <Divider label="خلاصہ / Summary" labelPosition="center" />

        {/* Summary */}
        <Paper
          p="md"
          radius="sm"
          style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
          }}
        >
          {/* Row 1: weight + amount stats */}
          <Grid mb="xs" gutter="sm">
            {[
              { ur: 'کُل وزن', en: 'Total Weight', val: `${totals.totalWeight.toFixed(2)} kg`, color: 'dark' },
              { ur: 'مجموعی رقم', en: 'Gross Amount', val: `Rs. ${totals.grossAmount.toFixed(2)}`, color: 'dark' },
              { ur: 'اخراجات', en: 'Charges', val: `Rs. ${(totals.fareCharges + totals.iceCharges).toFixed(2)}`, color: 'dark' },
            ].map(({ ur, en, val, color }) => (
              <Grid.Col key={en} span={4}>
                <Paper p="xs" radius="sm" withBorder style={{ background: '#fff' }}>
                  <Text size="xs" c="dimmed" mb={2}>{ur} / {en}</Text>
                  <Text fw={600} size="sm" c={color}>{val}</Text>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>

          {/* Row 2: payment stats */}
          <Grid gutter="sm">
            <Grid.Col span={4}>
              <Paper p="xs" radius="sm" withBorder style={{ background: '#eff6ff' }}>
                <Text size="xs" c="dimmed" mb={2}>خالص رقم / Net Amount</Text>
                <Text fw={700} size="md" c="blue">Rs. {totals.netAmount.toFixed(2)}</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={4}>
              <Paper p="xs" radius="sm" withBorder style={{ background: '#fff' }}>
                <Text size="xs" c="dimmed" mb={2}>نقد + وصولی / Cash + Receipt</Text>
                <Text fw={600} size="sm">Rs. {(totals.cashReceived + totals.receiptAmount).toFixed(2)}</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={4}>
              <Paper
                p="xs"
                radius="sm"
                withBorder
                style={{
                  background: totals.balanceAmount > 0 ? '#fef2f2' : '#f0fdf4',
                  borderColor: totals.balanceAmount > 0 ? '#fca5a5' : '#86efac',
                }}
              >
                <Text size="xs" c="dimmed" mb={2}>بقایا / Balance</Text>
                <Text fw={700} size="md" c={totals.balanceAmount > 0 ? 'red' : 'green'}>
                  Rs. {totals.balanceAmount.toFixed(2)}
                </Text>
              </Paper>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          {editSale && (
            <Button variant="light" color="teal" onClick={handlePrint}>
              🖨️ Print Receipt
            </Button>
          )}
          <Button variant="light" color="gray" onClick={onCancel || handleClear}>
            {onCancel ? 'Cancel' : 'Clear'}
          </Button>
          <Button variant="filled" color="blue" onClick={handleSave}>
            {editSale ? 'Update Sale' : 'Save Sale'}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

SaleForm.propTypes = {
  editSale: PropTypes.object,
  onSaved: PropTypes.func,
  onCancel: PropTypes.func,
};

export default SaleForm;
