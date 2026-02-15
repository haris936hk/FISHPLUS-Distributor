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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [details, setDetails] = useState('');

  // Line items
  const [lineItems, setLineItems] = useState([createEmptyLineItem()]);

  function createEmptyLineItem() {
    return {
      id: Date.now() + Math.random(),
      item_id: null,
      supplier_id: null,
      gross_weight: 0,
      tare_weight: 0,
      rate: 0,
      grocery_charges: 0,
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
      setSelectedCustomer(String(editSale.customer_id));
      setSelectedSupplier(editSale.supplier_id ? String(editSale.supplier_id) : null);
      setVehicleNumber(editSale.vehicle_number || '');
      setDetails(editSale.details || '');
      if (editSale.items && editSale.items.length > 0) {
        setLineItems(
          editSale.items.map((item) => ({
            id: item.id,
            item_id: String(item.item_id),
            supplier_id: item.supplier_id ? String(item.supplier_id) : null,
            gross_weight: item.gross_weight || 0,
            tare_weight: item.tare_weight || 0,
            rate: item.rate || 0,
            grocery_charges: item.grocery_charges || 0,
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

  // Get item stock by ID
  const getItemStock = useCallback(
    (itemId) => {
      const item = itemsList.find((i) => String(i.id) === itemId);
      return item?.current_stock || 0;
    },
    [itemsList]
  );

  // Update line item
  const updateLineItem = useCallback((id, field, value) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
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
    const netWeight = Math.max(0, (item.gross_weight || 0) - (item.tare_weight || 0));
    const amount = netWeight * (item.rate || 0);
    const netAmount = amount + (item.grocery_charges || 0) + (item.ice_charges || 0);
    return { netWeight, amount, netAmount };
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    let totalWeight = 0;
    let totalTareWeight = 0;
    let netWeight = 0;
    let grossAmount = 0;
    let groceryCharges = 0;
    let iceCharges = 0;
    let cashReceived = 0;
    let receiptAmount = 0;

    for (const item of lineItems) {
      const calculated = calculateLineValues(item);
      totalWeight += item.gross_weight || 0;
      totalTareWeight += item.tare_weight || 0;
      netWeight += calculated.netWeight;
      grossAmount += calculated.amount;
      groceryCharges += item.grocery_charges || 0;
      iceCharges += item.ice_charges || 0;
      cashReceived += item.cash_amount || 0;
      receiptAmount += item.receipt_amount || 0;
    }

    const netAmount = grossAmount + groceryCharges + iceCharges;
    const balanceAmount = netAmount - cashReceived - receiptAmount;

    return {
      totalWeight,
      totalTareWeight,
      netWeight,
      grossAmount,
      groceryCharges,
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
    // Validate customer
    const customerResult = validateRequired(selectedCustomer, 'گاہک / Customer');
    if (!customerResult.isValid) {
      notifications.show({
        title: 'توثیق کی خرابی / Validation Error',
        message: 'براہ کرم گاہک منتخب کریں / Please select a customer',
        color: 'red',
      });
      return;
    }

    const validItems = lineItems.filter((item) => item.item_id);
    if (validItems.length === 0) {
      notifications.show({
        title: 'توثیق کی خرابی / Validation Error',
        message: 'براہ کرم کم از کم ایک آئٹم شامل کریں / Please add at least one item',
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
        // so we don't get false negatives on re-saves without quantity changes
        if (editSale?.items) {
          for (const existingItem of editSale.items) {
            const key = String(existingItem.item_id);
            if (stockMap[key]) {
              stockMap[key].stock += existingItem.net_weight || 0;
            }
          }
        }

        const insufficientItems = validItems
          .map((item) => {
            const calculated = calculateLineValues(item);
            const stockInfo = stockMap[String(item.item_id)];
            if (stockInfo && calculated.netWeight > stockInfo.stock) {
              return `${stockInfo.name}: need ${calculated.netWeight.toFixed(2)} kg, available ${stockInfo.stock.toFixed(2)} kg`;
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
        customer_id: parseInt(selectedCustomer),
        supplier_id: selectedSupplier ? parseInt(selectedSupplier) : null,
        vehicle_number: vehicleNumber || null,
        sale_date: formatDate(saleDate),
        details: details || null,
        items: validItems.map((item) => {
          const calculated = calculateLineValues(item);
          return {
            item_id: parseInt(item.item_id),
            supplier_id: item.supplier_id ? parseInt(item.supplier_id) : null,
            gross_weight: item.gross_weight || 0,
            tare_weight: item.tare_weight || 0,
            net_weight: calculated.netWeight,
            rate: item.rate || 0,
            amount: calculated.amount,
            grocery_charges: item.grocery_charges || 0,
            ice_charges: item.ice_charges || 0,
            cash_amount: item.cash_amount || 0,
            receipt_amount: item.receipt_amount || 0,
            notes: item.notes || null,
          };
        }),
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
    selectedCustomer,
    selectedSupplier,
    vehicleNumber,
    saleDate,
    details,
    lineItems,
    editSale,
    onSaved,
    calculateLineValues,
  ]);

  // Print receipt for saved sale
  const handlePrint = useCallback(() => {
    const customerName = customers.find((c) => c.value === selectedCustomer)?.label || '';
    const dateStr = saleDate ? new Date(saleDate).toLocaleDateString('en-PK') : '';
    const validItems = lineItems.filter((item) => item.item_id);

    const itemRows = validItems
      .map((item) => {
        const calc = calculateLineValues(item);
        const itemInfo = itemsList.find((i) => String(i.id) === String(item.item_id));
        return `<tr>
                <td>${itemInfo?.name || ''}</td>
                <td style="text-align:right">${calc.netWeight.toFixed(2)}</td>
                <td style="text-align:right">${item.rate?.toFixed(2) || '0.00'}</td>
                <td style="text-align:right">${calc.amount.toFixed(2)}</td>
            </tr>`;
      })
      .join('');

    const html = `<!DOCTYPE html><html><head><title>Sale Receipt - ${saleNumber}</title>
        <style>
            @page { margin: 1cm; }
            body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
            .header h2 { margin: 0; } .header p { margin: 3px 0; font-size: 12px; }
            .info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 12px; }
            th { background: #f5f5f5; text-align: left; }
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
            <div><strong>Customer:</strong> ${customerName}</div>
        </div>
        <table>
            <thead><tr><th>Item</th><th style="text-align:right">Weight (kg)</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
            <tbody>${itemRows}</tbody>
        </table>
        <table class="totals">
            <tr><td>Gross Amount:</td><td>Rs. ${totals.grossAmount.toFixed(2)}</td></tr>
            <tr><td>Grocery Charges:</td><td>Rs. ${totals.groceryCharges.toFixed(2)}</td></tr>
            <tr><td>Ice Charges:</td><td>Rs. ${totals.iceCharges.toFixed(2)}</td></tr>
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
    selectedCustomer,
    saleDate,
    saleNumber,
    lineItems,
    itemsList,
    totals,
    calculateLineValues,
  ]);

  // Clear form
  const handleClear = useCallback(() => {
    setSelectedCustomer(null);
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
              label="گاہک (Customer)"
              placeholder="Select customer"
              data={customers}
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              searchable
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
        </Grid>

        <Grid>
          <Grid.Col span={4}>
            <TextInput
              label="گڑی نمبر (Vehicle No)"
              placeholder="Enter vehicle number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={8}>
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
                <Table.Th style={{ width: 40 }}>#</Table.Th>
                <Table.Th style={{ minWidth: 150 }}>Item</Table.Th>
                <Table.Th style={{ width: 80 }}>Stock</Table.Th>
                <Table.Th style={{ width: 90 }}>Rate</Table.Th>
                <Table.Th style={{ width: 90 }}>Gross (kg)</Table.Th>
                <Table.Th style={{ width: 80 }}>Tare (kg)</Table.Th>
                <Table.Th style={{ width: 80 }}>Net (kg)</Table.Th>
                <Table.Th style={{ width: 100 }}>Amount</Table.Th>
                <Table.Th style={{ width: 80 }}>Grocery</Table.Th>
                <Table.Th style={{ width: 80 }}>Ice</Table.Th>
                <Table.Th style={{ width: 100 }}>Net Amt</Table.Th>
                <Table.Th style={{ width: 90 }}>Cash</Table.Th>
                <Table.Th style={{ width: 90 }}>Receipt</Table.Th>
                <Table.Th style={{ width: 40 }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {lineItems.map((item, index) => {
                const calculated = calculateLineValues(item);
                return (
                  <Table.Tr key={item.id}>
                    <Table.Td>{index + 1}</Table.Td>
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
                      <Text size="xs" c="dimmed">
                        {item.item_id ? getItemStock(item.item_id).toFixed(2) : '-'}
                      </Text>
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
                      <NumberInput
                        value={item.gross_weight}
                        onChange={(val) => updateLineItem(item.id, 'gross_weight', val || 0)}
                        min={0}
                        decimalScale={2}
                        size="xs"
                        hideControls
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.tare_weight}
                        onChange={(val) => updateLineItem(item.id, 'tare_weight', val || 0)}
                        min={0}
                        decimalScale={2}
                        size="xs"
                        hideControls
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={500}>
                        {calculated.netWeight.toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={500}>
                        {calculated.amount.toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.grocery_charges}
                        onChange={(val) => updateLineItem(item.id, 'grocery_charges', val || 0)}
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
                      <Text size="xs" fw={600} c="blue">
                        {calculated.netAmount.toFixed(2)}
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

        <Divider label="Summary / خلاصہ" labelPosition="center" />

        {/* Summary */}
        <Paper p="md" bg="gray.0" radius="sm">
          <Grid>
            <Grid.Col span={3}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Total Weight:
                </Text>
                <Text fw={500}>{totals.totalWeight.toFixed(2)} kg</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={3}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Net Weight:
                </Text>
                <Text fw={500}>{totals.netWeight.toFixed(2)} kg</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={3}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Gross Amount:
                </Text>
                <Text fw={500}>Rs. {totals.grossAmount.toFixed(2)}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={3}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Charges:
                </Text>
                <Text fw={500}>Rs. {(totals.groceryCharges + totals.iceCharges).toFixed(2)}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={4}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Net Amount:
                </Text>
                <Text fw={600} c="blue">
                  Rs. {totals.netAmount.toFixed(2)}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={4}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Cash + Receipt:
                </Text>
                <Text fw={500}>Rs. {(totals.cashReceived + totals.receiptAmount).toFixed(2)}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={4}>
              <Group justify="space-between">
                <Text size="lg" fw={600}>
                  Balance:
                </Text>
                <Text size="lg" fw={700} c={totals.balanceAmount > 0 ? 'red' : 'green'}>
                  Rs. {totals.balanceAmount.toFixed(2)}
                </Text>
              </Group>
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
