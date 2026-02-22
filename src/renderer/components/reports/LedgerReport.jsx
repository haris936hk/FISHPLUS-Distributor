import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Stack,
  Grid,
  Select,
  Button,
  Table,
  LoadingOverlay,
  Text,
  ScrollArea,
  Paper,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { ReportViewer } from '../ReportViewer';

/**
 * Ledger Report (کھاتہ)
 * Shows account ledger for customer or supplier
 */
export function LedgerReport() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountType, setAccountType] = useState('customer');
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [reportData, setReportData] = useState(null);

  // Fetch accounts based on type
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        let response;
        if (accountType === 'customer') {
          response = await window.api.customers.getAll();
        } else {
          response = await window.api.suppliers.getAll();
        }
        if (response.success) {
          setAccounts(
            response.data.map((a) => ({
              value: String(a.id),
              label: a.name + (a.name_english ? ` (${a.name_english})` : ''),
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    fetchAccounts();
    setSelectedAccount(null);
  }, [accountType]);

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
    if (!selectedAccount) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select an account',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await window.api.reports.getLedger({
        accountId: parseInt(selectedAccount),
        accountType,
        dateFrom: formatDate(dateFrom),
        dateTo: formatDate(dateTo),
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
  }, [selectedAccount, accountType, dateFrom, dateTo]);

  // Calculate running balance
  const getTransactionsWithBalance = useCallback(() => {
    if (!reportData) return [];
    let balance = reportData.openingBalance;
    return reportData.transactions.map((txn) => {
      balance = balance + (txn.debit || 0) - (txn.credit || 0);
      return { ...txn, balance };
    });
  }, [reportData]);

  // ——— Professional Urdu-only print layout ———
  const printContentHTML = useMemo(() => {
    if (!reportData) return null;

    const fmt = (num) =>
      (num || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const txnsWithBalance = getTransactionsWithBalance();

    const rows = txnsWithBalance
      .map(
        (txn, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td class="amount-cell" style="text-align: left;">${new Date(txn.date).toLocaleDateString()}</td>
        <td class="amount-cell" style="text-align: left;">${txn.reference || '-'}</td>
        <td style="text-align: right;">${txn.description || '-'}</td>
        <td class="amount-cell">${txn.debit > 0 ? fmt(txn.debit) : '-'}</td>
        <td class="amount-cell">${txn.credit > 0 ? fmt(txn.credit) : '-'}</td>
        <td class="amount-cell">Rs. ${fmt(txn.balance)}</td>
      </tr>
    `
      )
      .join('');

    const totalDebit = reportData.transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const totalCredit = reportData.transactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    const finalBalance =
      txnsWithBalance.length > 0
        ? txnsWithBalance[txnsWithBalance.length - 1].balance
        : reportData.openingBalance;

    return `
      <style>
        .print-table { width: 100%; border-collapse: collapse; margin: 14px 0; direction: rtl; }
        .print-table th, .print-table td { border: 1px solid #000; padding: 8px 14px; font-size: 14px; text-align: right; }
        .print-table th { background-color: #e8e8e8; font-weight: bold; font-size: 13px; }
        .print-table .section-header { background-color: #f5f5f5; font-weight: bold; font-size: 14px; text-align: center; }
        .print-table .amount-cell { text-align: left; direction: ltr; font-family: 'Segoe UI', Tahoma, sans-serif; white-space: nowrap; }
        .print-table .total-row { background-color: #f0f0f0; font-weight: bold; font-size: 15px; }
        .balance-info { padding: 10px; margin-bottom: 15px; border: 1px solid #000; direction: rtl; background-color: #fafafa; font-weight: bold; font-size: 15px; text-align: right; }
      </style>

      <div class="balance-info">
        سابقہ بقایا / Opening Balance: <span class="amount-cell" style="display:inline-block; margin-right: 10px;">Rs. ${fmt(reportData.openingBalance)}</span>
      </div>

      <table class="print-table">
        <thead>
          <tr>
            <th colspan="7" class="section-header">کھاتہ / Ledger Report</th>
          </tr>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="width: 100px; text-align: left; direction: ltr;">تاریخ / Date</th>
            <th style="width: 100px; text-align: left; direction: ltr;">حوالہ / Reference</th>
            <th style="text-align: right;">تفصیل / Description</th>
            <th style="width: 100px; text-align: left; direction: ltr;">بنام / Debit</th>
            <th style="width: 100px; text-align: left; direction: ltr;">جمع / Credit</th>
            <th style="width: 120px; text-align: left; direction: ltr;">بقایا / Balance</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td colspan="4" style="text-align: left;">Total / کل</td>
            <td class="amount-cell">${fmt(totalDebit)}</td>
            <td class="amount-cell">${fmt(totalCredit)}</td>
            <td class="amount-cell">Rs. ${fmt(finalBalance)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }, [reportData, getTransactionsWithBalance]);

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={loading} />

      {/* Filters */}
      <Grid align="flex-end">
        <Grid.Col span={2}>
          <Select
            label="Account Type"
            data={[
              { value: 'customer', label: 'Customer' },
              { value: 'supplier', label: 'Vendor' },
            ]}
            value={accountType}
            onChange={setAccountType}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <Select
            label="Account"
            placeholder="Select account"
            data={accounts}
            value={selectedAccount}
            onChange={setSelectedAccount}
            searchable
            clearable
            required
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <DatePickerInput
            label="From Date"
            value={dateFrom}
            onChange={setDateFrom}
            maxDate={dateTo}
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <DatePickerInput
            label="To Date"
            value={dateTo}
            onChange={setDateTo}
            minDate={dateFrom}
            maxDate={new Date()}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <Button leftSection={<IconSearch size={16} />} onClick={handleGenerate} fullWidth>
            Go
          </Button>
        </Grid.Col>
      </Grid>

      {/* Report Display */}
      {reportData && (
        <ReportViewer
          title="Ledger Report"
          titleUrdu="کھاتہ"
          dateRange={{ from: formatDate(dateFrom), to: formatDate(dateTo) }}
          printContentHTML={printContentHTML}
        >
          <ScrollArea>
            {/* Opening Balance */}
            <Paper p="sm" mb="md" withBorder>
              <Text>
                <strong>Opening Balance:</strong> {formatNumber(reportData.openingBalance)}
              </Text>
            </Paper>

            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Reference</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th className="text-right">Debit</Table.Th>
                  <Table.Th className="text-right">Credit</Table.Th>
                  <Table.Th className="text-right">Balance</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {getTransactionsWithBalance().map((txn, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{new Date(txn.date).toLocaleDateString()}</Table.Td>
                    <Table.Td>{txn.reference}</Table.Td>
                    <Table.Td>{txn.description}</Table.Td>
                    <Table.Td className="text-right">
                      {txn.debit > 0 ? formatNumber(txn.debit) : '-'}
                    </Table.Td>
                    <Table.Td className="text-right">
                      {txn.credit > 0 ? formatNumber(txn.credit) : '-'}
                    </Table.Td>
                    <Table.Td className="text-right">{formatNumber(txn.balance)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr className="font-bold bg-gray-100">
                  <Table.Td colSpan={4}>
                    <strong>Totals</strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>
                      {formatNumber(
                        reportData.transactions.reduce((sum, t) => sum + (t.debit || 0), 0)
                      )}
                    </strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>
                      {formatNumber(
                        reportData.transactions.reduce((sum, t) => sum + (t.credit || 0), 0)
                      )}
                    </strong>
                  </Table.Td>
                  <Table.Td className="text-right">
                    <strong>
                      {formatNumber(
                        getTransactionsWithBalance().slice(-1)[0]?.balance ||
                          reportData.openingBalance
                      )}
                    </strong>
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>

            {reportData.transactions.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                No transactions found for the selected criteria
              </Text>
            )}
          </ScrollArea>
        </ReportViewer>
      )}
    </Stack>
  );
}

export default LedgerReport;
