import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Stack,
  Grid,
  Select,
  Checkbox,
  Button,
  Table,
  LoadingOverlay,
  Text,
  ScrollArea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { ReportViewer } from '../ReportViewer';

/**
 * Client Recovery Report (کلائنٹ بکری)
 * Shows sales summary for clients with collection and balance details
 */
export function ClientRecoveryReport() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [allClients, setAllClients] = useState(true);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [reportData, setReportData] = useState(null);

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await window.api.customers.getAll();
        if (response.success) {
          setCustomers(
            response.data.map((c) => ({
              value: String(c.id),
              label: c.name + (c.name_english ? ` (${c.name_english})` : ''),
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatNumber = (num) => {
    return (num || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!allClients && !selectedCustomer) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select a customer or check "All Customers"',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await window.api.reports.getClientRecovery({
        customerId: selectedCustomer ? parseInt(selectedCustomer) : null,
        dateFrom: formatDate(dateFrom),
        dateTo: formatDate(dateTo),
        allClients,
      });

      if (response.success) {
        setReportData(response.data);
      } else {
        notifications.show({
          title: 'Error',
          message: response.error || 'Failed to generate report',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to generate report',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCustomer, dateFrom, dateTo, allClients]);

  // ——— Professional Urdu-only print layout ———
  const printContentHTML = useMemo(() => {
    if (!reportData || reportData.summary.length === 0) return null;

    const fmt = (num) =>
      (num || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const totalAmount = reportData.summary.reduce((sum, r) => sum + (r.total_amount || 0), 0);
    const totalCharges = reportData.summary.reduce((sum, r) => sum + (r.total_charges || 0), 0);
    const totalCollection = reportData.summary.reduce(
      (sum, r) => sum + (r.total_collection || 0),
      0
    );
    const totalDiscount = reportData.summary.reduce((sum, r) => sum + (r.total_discount || 0), 0);
    const totalBalance = reportData.summary.reduce((sum, r) => sum + (r.total_balance || 0), 0);

    const rows = reportData.summary
      .map(
        (row, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td style="text-align: right;">${row.customer_name}</td>
        <td class="amount-cell">Rs. ${fmt(row.total_amount)}</td>
        <td class="amount-cell">Rs. ${fmt(row.total_charges)}</td>
        <td class="amount-cell">Rs. ${fmt(row.total_collection)}</td>
        <td class="amount-cell">Rs. ${fmt(row.total_discount)}</td>
        <td class="amount-cell">Rs. ${fmt(row.total_balance)}</td>
      </tr>
    `
      )
      .join('');

    return `
      <style>
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin: 14px 0;
          direction: rtl;
        }
        .print-table th,
        .print-table td {
          border: 1px solid #000;
          padding: 8px 14px;
          font-size: 14px;
          text-align: right;
        }
        .print-table th {
          background-color: #e8e8e8;
          font-weight: bold;
          font-size: 13px;
        }
        .print-table .section-header {
          background-color: #f5f5f5;
          font-weight: bold;
          font-size: 14px;
          text-align: center;
        }
        .print-table .amount-cell {
          text-align: left;
          direction: ltr;
          font-family: 'Segoe UI', Tahoma, sans-serif;
          white-space: nowrap;
        }
        .print-table .total-row {
          background-color: #f0f0f0;
          font-weight: bold;
          font-size: 15px;
        }
      </style>

      <table class="print-table">
        <thead>
          <tr>
            <th colspan="7" class="section-header">کلائنٹ بکری تفصیلات / Client Recovery Details</th>
          </tr>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="text-align: right;">صارف کا نام / Customer Name</th>
            <th style="width: 120px; text-align: left; direction: ltr;">کل رقم / Total Amount</th>
            <th style="width: 120px; text-align: left; direction: ltr;">اخراجات / Charges</th>
            <th style="width: 120px; text-align: left; direction: ltr;">وصولی / Collection</th>
            <th style="width: 120px; text-align: left; direction: ltr;">رعایت / Discount</th>
            <th style="width: 120px; text-align: left; direction: ltr;">بقایا / Balance</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td colspan="2" style="text-align: left;">Grand Total / کل</td>
            <td class="amount-cell">Rs. ${fmt(totalAmount)}</td>
            <td class="amount-cell">Rs. ${fmt(totalCharges)}</td>
            <td class="amount-cell">Rs. ${fmt(totalCollection)}</td>
            <td class="amount-cell">Rs. ${fmt(totalDiscount)}</td>
            <td class="amount-cell">Rs. ${fmt(totalBalance)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }, [reportData]);

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={loading} />

      {/* Filters */}
      <Grid align="flex-end">
        <Grid.Col span={3}>
          <DatePickerInput
            label="From Date"
            value={dateFrom}
            onChange={setDateFrom}
            maxDate={dateTo}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <DatePickerInput
            label="To Date"
            value={dateTo}
            onChange={setDateTo}
            minDate={dateFrom}
            maxDate={new Date()}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <Select
            label="Customer"
            placeholder="Select client"
            data={customers}
            value={selectedCustomer}
            onChange={setSelectedCustomer}
            searchable
            clearable
            disabled={allClients}
          />
        </Grid.Col>
        <Grid.Col span={1}>
          <Checkbox
            label="All"
            checked={allClients}
            onChange={(e) => {
              setAllClients(e.target.checked);
              if (e.target.checked) setSelectedCustomer(null);
            }}
            mt="xl"
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <Button leftSection={<IconSearch size={16} />} onClick={handleGenerate} fullWidth>
            Go
          </Button>
        </Grid.Col>
      </Grid>

      {/* Report Display */}
      {reportData && (
        <ReportViewer
          title="Customer Recovery Report"
          titleUrdu="کلائنٹ بکری"
          dateRange={{ from: formatDate(dateFrom), to: formatDate(dateTo) }}
          printContentHTML={printContentHTML}
        >
          <ScrollArea>
            {/* Summary Table */}
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Customer Name</Table.Th>
                  <Table.Th className="text-right">Total Amount</Table.Th>
                  <Table.Th className="text-right">Charges</Table.Th>
                  <Table.Th className="text-right">Collection</Table.Th>
                  <Table.Th className="text-right">Discount</Table.Th>
                  <Table.Th className="text-right">Balance</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reportData.summary.map((row, index) => (
                  <Table.Tr key={row.customer_id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{row.customer_name}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.total_amount)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.total_charges)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.total_collection)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.total_discount)}</Table.Td>
                    <Table.Td className="text-right">{formatNumber(row.total_balance)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr className="font-bold bg-gray-100">
                  <Table.Td colSpan={2}>
                    <strong>Grand Total</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>
                      {formatNumber(
                        reportData.summary.reduce((sum, r) => sum + (r.total_amount || 0), 0)
                      )}
                    </strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>
                      {formatNumber(
                        reportData.summary.reduce((sum, r) => sum + (r.total_charges || 0), 0)
                      )}
                    </strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>
                      {formatNumber(
                        reportData.summary.reduce((sum, r) => sum + (r.total_collection || 0), 0)
                      )}
                    </strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>
                      {formatNumber(
                        reportData.summary.reduce((sum, r) => sum + (r.total_discount || 0), 0)
                      )}
                    </strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>
                      {formatNumber(
                        reportData.summary.reduce((sum, r) => sum + (r.total_balance || 0), 0)
                      )}
                    </strong>
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            {reportData.summary.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                No records found for the selected criteria
              </Text>
            )}
          </ScrollArea>
        </ReportViewer>
      )}
    </Stack>
  );
}

export default ClientRecoveryReport;
