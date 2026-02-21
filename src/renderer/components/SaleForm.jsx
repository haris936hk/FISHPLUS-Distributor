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
  Checkbox,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';
import '@mantine/dates/styles.css';

/**
 * SaleForm Component
 * Single-transaction sale form: one item, one customer per sale.
 * Implements FR-SALE-001 through FR-SALE-055.
 *
 * @param {Object} editSale - Sale object to edit (null for new)
 * @param {function} onSaved - Callback after successful save
 * @param {function} onCancel - Callback to cancel/close form
 */
function SaleForm({ editSale, onSaved, onCancel }) {
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

  // Single sale row fields
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isStock, setIsStock] = useState(false);
  const [rateMaund, setRateMaund] = useState(0);
  const [rateKg, setRateKg] = useState(0);
  const [weight, setWeight] = useState(0);
  const [iceCharges, setIceCharges] = useState(0);
  const [fareCharges, setFareCharges] = useState(0);
  const [cashAmount, setCashAmount] = useState(0);
  const [receiptAmount, setReceiptAmount] = useState(0);

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

      // Load the first (and only) line item
      const item = editSale.items?.[0];
      if (item) {
        setSelectedItem(String(item.item_id));
        setSelectedCustomer(item.customer_id ? String(item.customer_id) : null);
        setIsStock(!!item.is_stock);
        setRateMaund(item.rate_per_maund || 0);
        setRateKg(item.rate || 0);
        setWeight(item.weight || 0);
        setIceCharges(item.ice_charges || 0);
        setFareCharges(item.fare_charges || 0);
        setCashAmount(item.cash_amount || 0);
        setReceiptAmount(item.receipt_amount || 0);
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

  // Dual-rate sync: 1 Maund = 40 kg
  const handleRateMaundChange = (val) => {
    const v = val || 0;
    setRateMaund(v);
    setRateKg(v / 40);
  };

  const handleRateKgChange = (val) => {
    const v = val || 0;
    setRateKg(v);
    setRateMaund(v * 40);
  };

  // Calculated totals
  const totals = useMemo(() => {
    const lineAmount = weight * rateKg;
    const netAmount = lineAmount + fareCharges + iceCharges;
    const balanceAmount = netAmount - cashAmount - receiptAmount;
    return {
      grossAmount: lineAmount,
      fareCharges,
      iceCharges,
      netAmount,
      cashReceived: cashAmount,
      receiptAmount,
      balanceAmount,
    };
  }, [weight, rateKg, fareCharges, iceCharges, cashAmount, receiptAmount]);

  // Format date for API
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Save sale
  const handleSave = useCallback(async () => {
    if (!selectedItem) {
      notifications.show({
        title: 'توثیق کی خرابی / Validation Error',
        message: 'براہ کرم آئٹم منتخب کریں / Please select an item (مچھلی)',
        color: 'red',
      });
      return;
    }

    if (!selectedCustomer) {
      notifications.show({
        title: 'توثیق کی خرابی / Validation Error',
        message: 'ہر آئٹم کے لیے گابک منتخب کریں / Please select a customer (گابک)',
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

        // When editing, add back weight already allocated to this sale
        if (editSale?.items) {
          for (const existingItem of editSale.items) {
            const key = String(existingItem.item_id);
            if (stockMap[key]) {
              stockMap[key].stock += existingItem.weight || 0;
            }
          }
        }

        const stockInfo = stockMap[String(selectedItem)];
        if (stockInfo && weight > stockInfo.stock) {
          notifications.show({
            title: 'Insufficient Stock',
            message: `${stockInfo.name}: need ${weight.toFixed(2)} kg, available ${stockInfo.stock.toFixed(2)} kg`,
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
        customer_id: selectedCustomer ? parseInt(selectedCustomer) : null,
        supplier_id: selectedSupplier ? parseInt(selectedSupplier) : null,
        vehicle_number: vehicleNumber || null,
        sale_date: formatDate(saleDate),
        details: details || null,
        items: [
          {
            item_id: parseInt(selectedItem),
            customer_id: selectedCustomer ? parseInt(selectedCustomer) : null,
            is_stock: isStock,
            rate_per_maund: rateMaund || 0,
            rate: rateKg || 0,
            weight: weight || 0,
            fare_charges: fareCharges || 0,
            ice_charges: iceCharges || 0,
            cash_amount: cashAmount || 0,
            receipt_amount: receiptAmount || 0,
            notes: null,
          },
        ],
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
    selectedItem,
    selectedCustomer,
    selectedSupplier,
    vehicleNumber,
    saleDate,
    details,
    isStock,
    rateMaund,
    rateKg,
    weight,
    fareCharges,
    iceCharges,
    cashAmount,
    receiptAmount,
    editSale,
    onSaved,
  ]);

  // Print receipt for saved sale
  const handlePrint = useCallback(() => {
    const dateStr = saleDate ? new Date(saleDate).toLocaleDateString('en-PK') : '';
    const itemInfo = itemsList.find((i) => String(i.id) === String(selectedItem));
    const custInfo = customers.find((c) => c.value === String(selectedCustomer));

    const lineAmount = weight * rateKg;
    const totalAmount = lineAmount + fareCharges + iceCharges;

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
            <tbody>
              <tr>
                <td>${itemInfo?.name || ''}</td>
                <td>${custInfo?.label || ''}</td>
                <td style="text-align:right">${weight.toFixed(2)}</td>
                <td style="text-align:right">${rateKg.toFixed(2)}</td>
                <td style="text-align:right">${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
        </table>
        <table class="totals">
            <tr><td>Gross Amount:</td><td>Rs. ${lineAmount.toFixed(2)}</td></tr>
            <tr><td>Fare Charges / کرایہ:</td><td>Rs. ${fareCharges.toFixed(2)}</td></tr>
            <tr><td>Ice Charges / برف:</td><td>Rs. ${iceCharges.toFixed(2)}</td></tr>
            <tr><td>Net Amount:</td><td><strong>Rs. ${totals.netAmount.toFixed(2)}</strong></td></tr>
            <tr><td>Cash Received:</td><td>Rs. ${cashAmount.toFixed(2)}</td></tr>
            <tr class="grand-total"><td>Balance:</td><td>Rs. ${totals.balanceAmount.toFixed(2)}</td></tr>
        </table>
        </body></html>`;

    try {
      window.api.print.preview(html, {
        title: `Sale Receipt - ${saleNumber}`,
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
    selectedItem,
    selectedCustomer,
    itemsList,
    weight,
    rateKg,
    fareCharges,
    iceCharges,
    cashAmount,
    totals,
  ]);

  // Clear form
  const handleClear = useCallback(() => {
    setSelectedSupplier(null);
    setVehicleNumber('');
    setDetails('');
    setSelectedItem(null);
    setSelectedCustomer(null);
    setIsStock(false);
    setRateMaund(0);
    setRateKg(0);
    setWeight(0);
    setIceCharges(0);
    setFareCharges(0);
    setCashAmount(0);
    setReceiptAmount(0);
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

        <Divider label="بکری تفصیل / Sale Details" labelPosition="center" />

        {/* Single Sale Row — flat fields */}
        <Grid gutter="md">
          {/* Row 1: Item + Customer + Is Stock */}
          <Grid.Col span={5}>
            <Select
              label="مچھلی (Item)"
              placeholder="Select item"
              data={itemOptions}
              value={selectedItem}
              onChange={setSelectedItem}
              searchable
              required
            />
          </Grid.Col>
          <Grid.Col span={5}>
            <Select
              label="گابک (Customer)"
              placeholder="Select customer"
              data={customers}
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              searchable
              required
            />
          </Grid.Col>
          <Grid.Col span={2} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 6 }}>
            <Checkbox
              label="سٹاک (Stock)"
              checked={isStock}
              onChange={(e) => setIsStock(e.currentTarget.checked)}
            />
          </Grid.Col>

          {/* Row 2: Rates + Weight */}
          <Grid.Col span={3}>
            <NumberInput
              label="ریٹ فی من (Rate/Maund)"
              value={rateMaund}
              onChange={handleRateMaundChange}
              min={0}
              decimalScale={2}
              hideControls
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <NumberInput
              label="ریٹ فی کلوگرام (Rate/kg)"
              value={rateKg}
              onChange={handleRateKgChange}
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
            <Paper p="xs" radius="sm" withBorder style={{ background: '#eff6ff' }}>
              <Text size="xs" c="dimmed" mb={2}>
                ٹوٹل رقم / Total Amount
              </Text>
              <Text fw={700} size="md" c="blue">
                Rs. {totals.netAmount.toFixed(2)}
              </Text>
            </Paper>
          </Grid.Col>

          {/* Row 3: Charges + Payments */}
          <Grid.Col span={3}>
            <NumberInput
              label="برف (Ice Charges)"
              value={iceCharges}
              onChange={(val) => setIceCharges(val || 0)}
              min={0}
              decimalScale={2}
              hideControls
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <NumberInput
              label="کرایہ (Fare Charges)"
              value={fareCharges}
              onChange={(val) => setFareCharges(val || 0)}
              min={0}
              decimalScale={2}
              hideControls
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <NumberInput
              label="نقدی (Cash)"
              value={cashAmount}
              onChange={(val) => setCashAmount(val || 0)}
              min={0}
              decimalScale={2}
              hideControls
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <NumberInput
              label="وصولی (Receipt)"
              value={receiptAmount}
              onChange={(val) => setReceiptAmount(val || 0)}
              min={0}
              decimalScale={2}
              hideControls
            />
          </Grid.Col>
        </Grid>

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
          {/* Row 1: weight + amounts */}
          <Grid mb="xs" gutter="sm">
            {[
              {
                ur: 'مجموعی رقم',
                en: 'Gross Amount',
                val: `Rs. ${totals.grossAmount.toFixed(2)}`,
                color: 'dark',
              },
              {
                ur: 'اخراجات',
                en: 'Charges',
                val: `Rs. ${(totals.fareCharges + totals.iceCharges).toFixed(2)}`,
                color: 'dark',
              },
              {
                ur: 'خالص رقم',
                en: 'Net Amount',
                val: `Rs. ${totals.netAmount.toFixed(2)}`,
                color: 'blue',
              },
            ].map(({ ur, en, val, color }) => (
              <Grid.Col key={en} span={4}>
                <Paper p="xs" radius="sm" withBorder style={{ background: '#fff' }}>
                  <Text size="xs" c="dimmed" mb={2}>
                    {ur} / {en}
                  </Text>
                  <Text fw={700} size="sm" c={color}>
                    {val}
                  </Text>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>

          {/* Row 2: received + balance */}
          <Grid gutter="sm">
            <Grid.Col span={6}>
              <Paper p="xs" radius="sm" withBorder style={{ background: '#fff' }}>
                <Text size="xs" c="dimmed" mb={2}>
                  نقد + وصولی / Cash + Receipt
                </Text>
                <Text fw={600} size="sm">
                  Rs. {(totals.cashReceived + totals.receiptAmount).toFixed(2)}
                </Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={6}>
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
                  بقایا / Balance
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
