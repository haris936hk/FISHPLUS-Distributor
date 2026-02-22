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
  Badge,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';
import '@mantine/dates/styles.css';
import { validateRequired } from '../utils/validators';

/**
 * PurchaseForm Component
 * Single-transaction purchase form: one item per purchase.
 * Implements FR-PURCH-001 through FR-PURCH-046.
 *
 * @param {Object} editPurchase - Purchase object to edit (null for new)
 * @param {function} onSaved - Callback after successful save
 * @param {function} onCancel - Callback to cancel/close form
 */
function PurchaseForm({ editPurchase, onSaved, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [itemsList, setItemsList] = useState([]);

  // Header fields
  const [purchaseNumber, setPurchaseNumber] = useState('00000');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [details, setDetails] = useState('');

  // Single purchase row fields
  const [selectedItem, setSelectedItem] = useState(null);
  const [rate, setRate] = useState(0);
  const [weight, setWeight] = useState(0);

  // Payment fields
  const [concessionAmount, setConcessionAmount] = useState(0);
  const [cashPaid, setCashPaid] = useState(0);

  // Supplier previous balance
  const [previousBalance, setPreviousBalance] = useState(0);

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

      // Load the first (and only) line item
      const item = editPurchase.items?.[0];
      if (item) {
        setSelectedItem(String(item.item_id));
        setRate(Number(item.rate) || 0);
        setWeight(Number(item.weight) || 0);
      }
    }
  }, [editPurchase]);

  // Update previous balance when supplier changes (new purchase only)
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

  // Calculated totals
  const totals = useMemo(() => {
    const grossAmount = weight * rate;
    const netAmount = grossAmount - (concessionAmount || 0);
    const balanceAmount = netAmount - (cashPaid || 0) + (previousBalance || 0);
    return { grossAmount, netAmount, balanceAmount };
  }, [weight, rate, concessionAmount, cashPaid, previousBalance]);

  // Format date for API
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0];
  };

  // Save purchase
  const handleSave = useCallback(async () => {
    const supplierResult = validateRequired(selectedSupplier, 'بیوپاری / Supplier');
    if (!supplierResult.isValid) {
      notifications.show({
        title: 'توثیق کی خرابی / Validation Error',
        message: 'براہ کرم بیوپاری منتخب کریں / Please select a supplier',
        color: 'red',
      });
      return;
    }

    if (!selectedItem) {
      notifications.show({
        title: 'توثیق کی خرابی / Validation Error',
        message: 'براہ کرم آئٹم منتخب کریں / Please select an item (قسم)',
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
        items: [
          {
            item_id: parseInt(selectedItem),
            weight: weight || 0,
            rate: rate || 0,
            amount: weight * rate,
            notes: null,
          },
        ],
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
    selectedItem,
    vehicleNumber,
    purchaseDate,
    details,
    concessionAmount,
    cashPaid,
    weight,
    rate,
    editPurchase,
    onSaved,
  ]);

  // Print receipt
  const handlePrint = useCallback(() => {
    const supplierName = suppliers.find((s) => s.value === selectedSupplier)?.label || '';
    const dateStr = purchaseDate ? new Date(purchaseDate).toLocaleDateString('en-PK') : '';
    const itemInfo = itemsList.find((i) => String(i.id) === String(selectedItem));
    const lineAmount = weight * rate;

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
            <div><strong>Supplier / بیوپاری:</strong> ${supplierName}</div>
        </div>
        <table>
            <thead><tr><th>قسم / Item</th><th style="text-align:right">وزن / Weight (kg)</th><th style="text-align:right">ریٹ / Rate</th><th style="text-align:right">رقم / Amount</th></tr></thead>
            <tbody>
              <tr>
                <td>${itemInfo?.name || ''}</td>
                <td style="text-align:right">${weight.toFixed(2)}</td>
                <td style="text-align:right">${rate.toFixed(2)}</td>
                <td style="text-align:right">${lineAmount.toFixed(2)}</td>
              </tr>
            </tbody>
        </table>
        <table class="totals">
            <tr><td>Gross Amount / مجموعی رقم:</td><td>Rs. ${totals.grossAmount.toFixed(2)}</td></tr>
            <tr><td>Concession / رعایت:</td><td>Rs. ${(concessionAmount || 0).toFixed(2)}</td></tr>
            <tr><td>Net Amount / خالص رقم:</td><td><strong>Rs. ${totals.netAmount.toFixed(2)}</strong></td></tr>
            <tr><td>Cash Paid / نقد ادا:</td><td>Rs. ${(cashPaid || 0).toFixed(2)}</td></tr>
            <tr class="grand-total"><td>Balance Due / اداینگی رقم:</td><td>Rs. ${totals.balanceAmount.toFixed(2)}</td></tr>
        </table>
        </body></html>`;

    try {
      window.api.print.preview(html, {
        title: `Purchase Receipt - ${purchaseNumber}`,
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
    selectedItem,
    itemsList,
    weight,
    rate,
    concessionAmount,
    cashPaid,
    totals,
  ]);

  // Clear form
  const handleClear = useCallback(() => {
    setSelectedSupplier(null);
    setVehicleNumber('');
    setDetails('');
    setSelectedItem(null);
    setRate(0);
    setWeight(0);
    setConcessionAmount(0);
    setCashPaid(0);
    setPreviousBalance(0);
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

        <Divider label="خریداری تفصیل / Purchase Details" labelPosition="center" />

        {/* Single Purchase Row — flat fields */}
        <Grid gutter="md">
          {/* Row 1: Item + Rate + Weight + Amount */}
          <Grid.Col span={4}>
            <Select
              label="قسم (Item)"
              placeholder="Select item"
              data={itemOptions}
              value={selectedItem}
              onChange={setSelectedItem}
              searchable
              required
            />
          </Grid.Col>
          <Grid.Col span={2}>
            <NumberInput
              label="ریٹ (Rate/kg)"
              value={rate}
              onChange={(val) => setRate(val || 0)}
              min={0}
              decimalScale={2}
              hideControls
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <NumberInput
              label="وزن کلوگرام (Weight kg)"
              value={weight}
              onChange={(val) => setWeight(val || 0)}
              min={0}
              decimalScale={2}
              hideControls
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper p="xs" radius="sm" withBorder style={{ background: '#f0fdf4' }}>
              <Text size="xs" c="dimmed" mb={2}>
                رقم / Amount
              </Text>
              <Text fw={700} size="md" c="green">
                Rs. {(weight * rate).toFixed(2)}
              </Text>
            </Paper>
          </Grid.Col>

          {/* Row 2: Concession + Cash Paid */}
          <Grid.Col span={4}>
            <NumberInput
              label="رعایت (Concession)"
              value={concessionAmount}
              onChange={(val) => setConcessionAmount(val || 0)}
              min={0}
              decimalScale={2}
              hideControls
              dir="ltr"
              styles={{ input: { textAlign: 'left' } }}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="نقد ادا (Cash Paid)"
              value={cashPaid}
              onChange={(val) => setCashPaid(val || 0)}
              min={0}
              decimalScale={2}
              hideControls
              dir="ltr"
              styles={{ input: { textAlign: 'left' } }}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper p="xs" radius="sm" withBorder style={{ background: '#fff' }}>
              <Text size="xs" c="dimmed" mb={2}>
                سابقہ بقایا / Previous Balance
              </Text>
              <Text fw={600} size="sm">
                Rs. {previousBalance.toFixed(2)}
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>

        <Divider label="خلاصہ / Summary" labelPosition="center" />

        {/* Summary */}
        <Paper
          p="md"
          radius="sm"
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #86efac',
          }}
        >
          <Grid gutter="sm">
            <Grid.Col span={4}>
              <Paper p="xs" radius="sm" withBorder style={{ background: '#fff' }}>
                <Text size="xs" c="dimmed" mb={2}>
                  مجموعی رقم / Gross Amount
                </Text>
                <Text fw={600} size="sm">
                  Rs. {totals.grossAmount.toFixed(2)}
                </Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={4}>
              <Paper p="xs" radius="sm" withBorder style={{ background: '#eff6ff' }}>
                <Text size="xs" c="dimmed" mb={2}>
                  خالص رقم / Net Amount
                </Text>
                <Text fw={700} size="md" c="green">
                  Rs. {totals.netAmount.toFixed(2)}
                </Text>
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
                <Text size="xs" c="dimmed" mb={2}>
                  اداینگی رقم / Balance Due
                </Text>
                <Text fw={700} size="md" c={totals.balanceAmount > 0 ? 'red' : 'green'}>
                  Rs. {totals.balanceAmount.toFixed(2)}
                </Text>
              </Paper>
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
