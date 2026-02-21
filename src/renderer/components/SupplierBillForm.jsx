import { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Title,
  Select,
  TextInput,
  NumberInput,
  Button,
  LoadingOverlay,
  Divider,
  Grid,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';
import '@mantine/dates/styles.css';
import { validateRequired } from '../utils/validators';

/**
 * SupplierBillForm Component
 * Form for generating supplier bills with date range, charges, and calculations.
 * Implements FR-SUPBILL-001 through FR-SUPBILL-038.
 *
 * @param {function} onPreviewGenerated - Callback when preview data is ready
 * @param {function} onBillSaved - Callback after successful save
 */
function SupplierBillForm({ onPreviewGenerated, onBillSaved }) {
  // Form state
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());

  // Header state
  const [vehicleNumber, setVehicleNumber] = useState('');

  // Charges state
  const [commissionPct, setCommissionPct] = useState(5.0);
  const [drugsCharges, setDrugsCharges] = useState(0);
  const [fareCharges, setFareCharges] = useState(0);
  const [laborCharges, setLaborCharges] = useState(0);
  const [iceCharges, setIceCharges] = useState(0);
  const [concessionAmount, setConcessionAmount] = useState(0);
  const [cashPaid, setCashPaid] = useState(0);

  // Calculated values from preview
  const [previewData, setPreviewData] = useState(null);
  const [totalWeight, setTotalWeight] = useState(0);
  const [grossAmount, setGrossAmount] = useState(0);

  // Calculated values
  const commissionAmount = (grossAmount * commissionPct) / 100;
  const totalCharges = drugsCharges + fareCharges + laborCharges + iceCharges;
  const netAmount = grossAmount - commissionAmount - totalCharges;
  const totalPayable = netAmount - concessionAmount;
  const balanceAmount = totalPayable - cashPaid;

  // Load suppliers on mount
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await window.api.suppliers.getAll();
        if (response.success) {
          setSuppliers(
            response.data.map((s) => ({
              value: String(s.id),
              label: s.name + (s.name_english ? ` (${s.name_english})` : ''),
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load suppliers:', error);
      }
    };
    loadSuppliers();
  }, []);

  // Format date for API
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Generate preview (Go button)
  const handleGeneratePreview = useCallback(async () => {
    const supplierResult = validateRequired(selectedSupplier, 'بیوپاری / Supplier');
    if (!supplierResult.isValid) {
      notifications.show({
        title: 'توثیق کی خرابی / Validation Error',
        message: 'براہ کرم بیوپاری منتخب کریں / Please select a supplier',
        color: 'red',
      });
      return;
    }

    if (dateFrom > dateTo) {
      notifications.show({
        title: 'توثیق کی خرابی / Validation Error',
        message: 'شروع کی تاریخ ختم ہونے کی تاریخ سے بعد نہیں ہو سکتی / Start date cannot be after end date',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await window.api.supplierBills.generatePreview(
        parseInt(selectedSupplier),
        formatDate(dateFrom),
        formatDate(dateTo)
      );

      if (response.success) {
        const data = response.data;
        setPreviewData(data);
        setTotalWeight(data.totalWeight);
        setGrossAmount(data.grossAmount);
        setCommissionPct(data.defaultCommissionPct || 5.0);

        // Notify parent with preview data
        onPreviewGenerated?.({
          ...data,
          supplierId: parseInt(selectedSupplier),
          dateFrom: formatDate(dateFrom),
          dateTo: formatDate(dateTo),
        });

        if (data.items.length === 0) {
          notifications.show({
            title: 'کوئی ڈیٹا نہیں / No Data',
            message: 'منتخب تاریخوں میں اس بیوپاری کا کوئی ڈیٹا نہیں ملا / No sales found for this supplier in the selected date range',
            color: 'yellow',
          });
        }
      } else {
        notifications.show({
          title: 'خرابی / Error',
          message: response.error || 'پیش نظارہ بنانے میں ناکامی / Failed to generate preview',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Preview generation error:', error);
      notifications.show({
        title: 'خرابی / Error',
        message: 'پیش نظارہ بنانے میں ناکامی / Failed to generate preview',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedSupplier, dateFrom, dateTo, onPreviewGenerated]);

  // Save bill
  const handleSave = useCallback(async () => {
    if (!previewData || !selectedSupplier) {
      notifications.show({
        title: 'Error',
        message: 'Please generate a preview first',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const billData = {
        supplier_id: parseInt(selectedSupplier),
        vehicle_number: vehicleNumber || null,
        date_from: formatDate(dateFrom),
        date_to: formatDate(dateTo),
        total_weight: totalWeight,
        gross_amount: grossAmount,
        commission_pct: commissionPct,
        commission_amount: commissionAmount,
        drugs_charges: drugsCharges,
        fare_charges: fareCharges,
        labor_charges: laborCharges,
        ice_charges: iceCharges,
        other_charges: 0,
        total_charges: totalCharges,
        total_payable: totalPayable,
        concession_amount: concessionAmount,
        cash_paid: cashPaid,
        collection_amount: 0,
        balance_amount: balanceAmount,
      };

      const response = await window.api.supplierBills.create(billData);

      if (response.success) {
        notifications.show({
          title: 'بل محفوظ / Bill Saved',
          message: `Bill ${response.data.billNumber} created successfully / بل نمبر ${response.data.billNumber} کامیابی سے محفوظ`,
          color: 'green',
        });
        onBillSaved?.(response.data);
        // Reset form
        setPreviewData(null);
        setTotalWeight(0);
        setGrossAmount(0);
        setConcessionAmount(0);
        setCashPaid(0);
      } else {
        notifications.show({
          title: 'خرابی / Error',
          message: response.error || 'بل محفوظ کرنے میں خرابی / Failed to save bill',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Save bill error:', error);
      notifications.show({
        title: 'خرابی / Error',
        message: 'بل محفوظ کرنے میں خرابی / Failed to save bill',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [
    previewData,
    selectedSupplier,
    vehicleNumber,
    dateFrom,
    dateTo,
    totalWeight,
    grossAmount,
    commissionPct,
    commissionAmount,
    drugsCharges,
    fareCharges,
    laborCharges,
    iceCharges,
    totalCharges,
    totalPayable,
    concessionAmount,
    cashPaid,
    balanceAmount,
    onBillSaved,
  ]);

  // Clear form
  const handleClear = useCallback(() => {
    setSelectedSupplier(null);
    setVehicleNumber('');
    setDateFrom(new Date());
    setDateTo(new Date());
    setCommissionPct(5.0);
    setDrugsCharges(0);
    setFareCharges(0);
    setLaborCharges(0);
    setIceCharges(0);
    setConcessionAmount(0);
    setCashPaid(0);
    setPreviewData(null);
    setTotalWeight(0);
    setGrossAmount(0);
    onPreviewGenerated?.(null);
  }, [onPreviewGenerated]);

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder pos="relative">
      <LoadingOverlay visible={loading} />

      <Stack gap="md">
        <Title order={4} className="text-blue-700">
          📄 بیوپاری بل (Vendor Bill)
        </Title>

        <Divider />

        {/* Date Range */}
        <Grid>
          <Grid.Col span={6}>
            <DatePickerInput
              label="تاریخ (From Date)"
              placeholder="Select start date"
              value={dateFrom}
              onChange={setDateFrom}
              maxDate={dateTo || undefined}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <DatePickerInput
              label="سے تاریخ (To Date)"
              placeholder="Select end date"
              value={dateTo}
              onChange={setDateTo}
              minDate={dateFrom || undefined}
              required
            />
          </Grid.Col>
        </Grid>

        {/* Supplier Selection */}
        <Select
          label="بیوپاری (Vendor)"
          placeholder="Select supplier"
          data={suppliers}
          value={selectedSupplier}
          onChange={setSelectedSupplier}
          searchable
          required
        />

        {/* Vehicle Number */}
        <TextInput
          label="گاڑی نمبر (Vehicle Number)"
          placeholder="Enter vehicle number"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
        />

        <Divider label="Charges / خرچ" labelPosition="center" />

        {/* Charges Grid */}
        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="منشیانا (Drugs/Chemicals)"
              value={drugsCharges}
              onChange={setDrugsCharges}
              min={0}
              decimalScale={2}
              prefix="Rs. "
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="کرایہ (Fare)"
              value={fareCharges}
              onChange={setFareCharges}
              min={0}
              decimalScale={2}
              prefix="Rs. "
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={4}>
            <NumberInput
              label="مزدوری (Labor)"
              value={laborCharges}
              onChange={setLaborCharges}
              min={0}
              decimalScale={2}
              prefix="Rs. "
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="برف (Ice)"
              value={iceCharges}
              onChange={setIceCharges}
              min={0}
              decimalScale={2}
              prefix="Rs. "
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="کمیش % (Commission %)"
              value={commissionPct}
              onChange={setCommissionPct}
              min={0}
              max={100}
              decimalScale={2}
              suffix="%"
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={4}>
            <NumberInput
              label="کمیش (Commission Amount)"
              value={commissionAmount}
              readOnly
              decimalScale={2}
              prefix="Rs. "
              styles={{ input: { backgroundColor: '#f8f9fa' } }}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="رعایت (Concession)"
              value={concessionAmount}
              onChange={setConcessionAmount}
              min={0}
              decimalScale={2}
              prefix="Rs. "
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="نقل (Cash Paid)"
              value={cashPaid}
              onChange={setCashPaid}
              min={0}
              decimalScale={2}
              prefix="Rs. "
            />
          </Grid.Col>
        </Grid>

        <Divider label="Summary / خلاصہ" labelPosition="center" />

        {/* Summary Display */}
        <Paper p="md" bg="gray.0" radius="sm">
          <Grid>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Total Weight:
                </Text>
                <Text fw={500}>{totalWeight.toFixed(2)} kg</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Gross Amount:
                </Text>
                <Text fw={500}>Rs. {grossAmount.toFixed(2)}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Total Charges:
                </Text>
                <Text fw={500} c="red">
                  - Rs. {(commissionAmount + totalCharges).toFixed(2)}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Net Payable:
                </Text>
                <Text fw={600} c="blue">
                  Rs. {totalPayable.toFixed(2)}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={12}>
              <Divider my="xs" />
              <Group justify="space-between">
                <Text size="lg" fw={600}>
                  اداینگی رقم (Balance):
                </Text>
                <Text size="xl" fw={700} c={balanceAmount >= 0 ? 'green' : 'red'}>
                  Rs. {balanceAmount.toFixed(2)}
                </Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="light" color="gray" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="filled" color="teal" onClick={handleGeneratePreview}>
            Go (Preview)
          </Button>
          <Button variant="filled" color="blue" onClick={handleSave} disabled={!previewData}>
            Save Bill
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

SupplierBillForm.propTypes = {
  onPreviewGenerated: PropTypes.func,
  onBillSaved: PropTypes.func,
};

export default SupplierBillForm;
