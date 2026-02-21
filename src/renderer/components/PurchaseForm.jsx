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
 * PurchaseForm Component
 * Form for creating/editing purchase transactions with dynamic line items.
 * Implements FR-PURCH-001 through FR-PURCH-046.
 *
 * @param {Object} editPurchase - Purchase object to edit (null for new)
 * @param {function} onSaved - Callback after successful save
 * @param {function} onCancel - Callback to cancel/close form
 */
function PurchaseForm({ editPurchase, onSaved, onCancel }) {
  // Form state
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [itemsList, setItemsList] = useState([]);

  // Header fields
  const [purchaseNumber, setPurchaseNumber] = useState('00000');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [details, setDetails] = useState('');

  // Footer fields
  const [concessionAmount, setConcessionAmount] = useState(0);
  const [cashPaid, setCashPaid] = useState(0);

  // Supplier balance
  const [previousBalance, setPreviousBalance] = useState(0);

  // Line items
  const [lineItems, setLineItems] = useState([createEmptyLineItem()]);

  function createEmptyLineItem() {
    return {
      id: Date.now() + Math.random(),
      item_id: null,
      weight: 0,
      rate: 0,
      notes: '',
    };
  }

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersRes, itemsRes, nextNumRes] = await Promise.all([
          window.api.suppliers.getAll(),
          window.api.items.getAll(),
          !editPurchase ? window.api.purchases.getNextNumber() : Promise.resolve(null),
        ]);

        if (suppliersRes.success) {
          setSuppliers(
            suppliersRes.data.map((s) => ({
              value: String(s.id),
              label: s.name + (s.name_english ? ` (${s.name_english})` : ''),
              balance: s.current_balance || 0,
            }))
          );
        }

        if (itemsRes.success) {
          setItemsList(itemsRes.data);
        }

        if (nextNumRes?.success) {
          setPurchaseNumber(nextNumRes.data);
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
  }, [editPurchase]);

  // Load existing purchase for editing
  useEffect(() => {
    if (editPurchase) {
      setPurchaseNumber(editPurchase.purchase_number);
      setPurchaseDate(new Date(editPurchase.purchase_date));
      setSelectedSupplier(String(editPurchase.supplier_id));
      setVehicleNumber(editPurchase.vehicle_number || '');
      setDetails(editPurchase.details || '');
      setConcessionAmount(editPurchase.concession_amount || 0);
      setCashPaid(editPurchase.cash_paid || 0);
      setPreviousBalance(editPurchase.previous_balance || 0);
      if (editPurchase.items && editPurchase.items.length > 0) {
        setLineItems(
          editPurchase.items.map((item) => ({
            id: item.id,
            item_id: String(item.item_id),
            weight: Number(item.weight) || 0,
            rate: Number(item.rate) || 0,
            notes: item.notes || '',
          }))
        );
      }
    }
  }, [editPurchase]);

  // Update previous balance when supplier changes
  useEffect(() => {
    if (selectedSupplier && !editPurchase) {
      const supplier = suppliers.find((s) => s.value === selectedSupplier);
      setPreviousBalance(supplier?.balance || 0);
    }
  }, [selectedSupplier, suppliers, editPurchase]);

  // Items dropdown options
  const itemOptions = useMemo(
    () =>
      itemsList.map((item) => ({
        value: String(item.id),
        label: item.name + (item.name_english ? ` (${item.name_english})` : ''),
      })),
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

  // Calculate line item amount
  const calculateLineAmount = useCallback((item) => {
    return (Number(item.weight) || 0) * (Number(item.rate) || 0);
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    let totalWeight = 0;
    let grossAmount = 0;

    for (const item of lineItems) {
      totalWeight += Number(item.weight) || 0;
      grossAmount += calculateLineAmount(item);
    }

    const netAmount = grossAmount - (Number(concessionAmount) || 0);
    const balanceAmount = netAmount - (Number(cashPaid) || 0) + (Number(previousBalance) || 0);

    return {
      totalWeight,
      grossAmount,
      netAmount,
      balanceAmount,
    };
  }, [lineItems, concessionAmount, cashPaid, previousBalance, calculateLineAmount]);

  // Format date for API
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Save purchase
  const handleSave = useCallback(async () => {
    // Validate supplier
    const supplierResult = validateRequired(selectedSupplier, 'بیوپاری / Supplier');
    if (!supplierResult.isValid) {
      notifications.show({
        title: 'توثیق کی خرابی / Validation Error',
        message: 'براہ کرم بیوپاری منتخب کریں / Please select a supplier',
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

    setLoading(true);
    try {
      const purchaseData = {
        supplier_id: parseInt(selectedSupplier),
        vehicle_number: vehicleNumber || null,
        purchase_date: formatDate(purchaseDate),
        details: details || null,
        concession_amount: concessionAmount || 0,
        cash_paid: cashPaid || 0,
        items: validItems.map((item) => ({
          item_id: parseInt(item.item_id),
          weight: item.weight || 0,
          rate: item.rate || 0,
          amount: calculateLineAmount(item),
          notes: item.notes || null,
        })),
      };

      let response;
      if (editPurchase) {
        response = await window.api.purchases.update(editPurchase.id, purchaseData);
      } else {
        response = await window.api.purchases.create(purchaseData);
      }

      if (response.success) {
        notifications.show({
          title: 'خریداری محفوظ / Purchase Saved',
          message: editPurchase
            ? 'Purchase updated successfully / خریداری کامیابی سے اپ ڈیٹ ہو گئی'
            : `Purchase ${response.data.purchaseNumber} created successfully / خریداری نمبر ${response.data.purchaseNumber} کامیابی سے محفوظ`,
          color: 'green',
        });
        onSaved?.(response.data);
      } else {
        notifications.show({
          title: 'خرابی / Error',
          message: response.error || 'خریداری محفوظ کرنے میں خرابی / Failed to save purchase',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Save purchase error:', error);
      notifications.show({
        title: 'خرابی / Error',
        message: 'خریداری محفوظ کرنے میں خرابی / Failed to save purchase',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [
    selectedSupplier,
    vehicleNumber,
    purchaseDate,
    details,
    concessionAmount,
    cashPaid,
    lineItems,
    editPurchase,
    onSaved,
    calculateLineAmount,
  ]);

  // Print receipt for saved purchase
  const handlePrint = useCallback(() => {
    const supplierName = suppliers.find((s) => s.value === selectedSupplier)?.label || '';
    const dateStr = purchaseDate ? new Date(purchaseDate).toLocaleDateString('en-PK') : '';
    const validItems = lineItems.filter((item) => item.item_id);

    const itemRows = validItems
      .map((item) => {
        const itemInfo = itemsList.find((i) => String(i.id) === String(item.item_id));
        return `<tr>
                <td>${itemInfo?.name || ''}</td>
                <td style="text-align:right">${(item.weight || 0).toFixed(2)}</td>
                <td style="text-align:right">${(item.rate || 0).toFixed(2)}</td>
                <td style="text-align:right">${calculateLineAmount(item).toFixed(2)}</td>
            </tr>`;
      })
      .join('');

    const html = `<!DOCTYPE html><html dir="rtl"><head><title>Purchase Receipt - ${purchaseNumber}</title>
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
            <h3 style="margin:10px 0 0">Purchase Receipt / خریداری رسید</h3>
        </div>
        <div class="info">
            <div><strong>Receipt #:</strong> ${purchaseNumber}</div>
            <div><strong>Date:</strong> ${dateStr}</div>
            <div><strong>Supplier:</strong> ${supplierName}</div>
        </div>
        <table>
            <thead><tr><th>Item</th><th style="text-align:right">Weight (kg)</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
            <tbody>${itemRows}</tbody>
        </table>
        <table class="totals">
            <tr><td>Gross Amount:</td><td>Rs. ${totals.grossAmount.toFixed(2)}</td></tr>
            <tr><td>Concession:</td><td>Rs. ${concessionAmount.toFixed(2)}</td></tr>
            <tr><td>Net Amount:</td><td><strong>Rs. ${totals.netAmount.toFixed(2)}</strong></td></tr>
            <tr><td>Cash Paid:</td><td>Rs. ${cashPaid.toFixed(2)}</td></tr>
            <tr class="grand-total"><td>Balance:</td><td>Rs. ${totals.balanceAmount.toFixed(2)}</td></tr>
        </table>
        </body></html>`;

    // Use print preview instead of direct print
    try {
      window.api.print.preview(html, {
        title: `Purchase Receipt - ${purchaseNumber} `,
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
    suppliers,
    selectedSupplier,
    purchaseDate,
    purchaseNumber,
    lineItems,
    itemsList,
    totals,
    concessionAmount,
    cashPaid,
    calculateLineAmount,
  ]);

  // Clear form
  const handleClear = useCallback(() => {
    setSelectedSupplier(null);
    setVehicleNumber('');
    setDetails('');
    setConcessionAmount(0);
    setCashPaid(0);
    setPreviousBalance(0);
    setLineItems([createEmptyLineItem()]);
  }, []);

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder pos="relative">
      <LoadingOverlay visible={loading} />

      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={4} className="text-green-700">
            📦 {editPurchase ? 'Edit Purchase' : 'New Purchase'} (خریداری)
          </Title>
          <Badge size="lg" variant="light" color="green">
            {purchaseNumber}
          </Badge>
        </Group>

        <Divider />

        {/* Header Fields */}
        <Grid>
          <Grid.Col span={4}>
            <DatePickerInput
              label="خریداری تاریخ (Purchase Date)"
              placeholder="Select date"
              value={purchaseDate}
              onChange={setPurchaseDate}
              maxDate={new Date()}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="بیوپاری (Supplier)"
              placeholder="Select supplier"
              data={suppliers}
              value={selectedSupplier}
              onChange={setSelectedSupplier}
              searchable
              required
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
                <Table.Th style={{ minWidth: 200 }}>
                  <div style={{ fontWeight: 700 }}>قسم</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Item</div>
                </Table.Th>
                <Table.Th style={{ width: 120 }}>
                  <div style={{ fontWeight: 700 }}>ریٹ</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Rate</div>
                </Table.Th>
                <Table.Th style={{ width: 120 }}>
                  <div style={{ fontWeight: 700 }}>وزن</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Weight (kg)</div>
                </Table.Th>
                <Table.Th style={{ width: 140 }}>
                  <div style={{ fontWeight: 700 }}>رقم</div>
                  <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.65 }}>Amount</div>
                </Table.Th>
                <Table.Th style={{ width: 40 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {lineItems.map((item) => {
                const amount = calculateLineAmount(item);
                return (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Select
                        placeholder="Select item"
                        data={itemOptions}
                        value={item.item_id}
                        onChange={(val) => updateLineItem(item.id, 'item_id', val)}
                        searchable
                        size="xs"
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
                      <Text size="sm" fw={600} c="green">
                        Rs. {amount.toFixed(2)}
                      </Text>
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
                  Gross Amount:
                </Text>
                <Text fw={500}>Rs. {totals.grossAmount.toFixed(2)}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={3}>
              <NumberInput
                label="رعایت (امرکم) - Concession"
                value={concessionAmount}
                onChange={(val) => setConcessionAmount(val || 0)}
                min={0}
                decimalScale={2}
                size="xs"
                className="ltr-field"
                dir="ltr"
                styles={{ input: { textAlign: 'left' } }}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Net Amount:
                </Text>
                <Text fw={600} c="green">
                  Rs. {totals.netAmount.toFixed(2)}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={3}>
              <NumberInput
                label="نقد (ادای کی) - Cash Paid"
                value={cashPaid}
                onChange={(val) => setCashPaid(val || 0)}
                min={0}
                decimalScale={2}
                size="xs"
                className="ltr-field"
                dir="ltr"
                styles={{ input: { textAlign: 'left' } }}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  سابقہ (Previous):
                </Text>
                <Text fw={500}>Rs. {previousBalance.toFixed(2)}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="lg" fw={600}>
                  اداینگی رقم (Balance):
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
          {editPurchase && (
            <Button variant="light" color="teal" onClick={handlePrint}>
              🖨️ Print Receipt
            </Button>
          )}
          <Button variant="light" color="gray" onClick={onCancel || handleClear}>
            {onCancel ? 'Cancel' : 'Clear'}
          </Button>
          <Button variant="filled" color="green" onClick={handleSave}>
            {editPurchase ? 'Update Purchase' : 'Save Purchase'}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

PurchaseForm.propTypes = {
  editPurchase: PropTypes.object,
  onSaved: PropTypes.func,
  onCancel: PropTypes.func,
};

export default PurchaseForm;
