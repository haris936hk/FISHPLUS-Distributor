import { useState, useCallback } from 'react';
import {
  Stack,
  Grid,
  Button,
  LoadingOverlay,
  Text,
  Paper,
  SimpleGrid,
  Table,
  Checkbox,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconCash, IconReceipt, IconCreditCard, IconWallet } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import { ReportViewer } from '../ReportViewer';

/**
 * Daily Net Amount Summary Report (8.11) - رجسٹر ٹوٹل رقم
 * Shows day-end reconciliation summary with previous balance, sales, collections, and closing balance
 */
export function DailyNetAmountSummaryReport() {
  const [loading, setLoading] = useState(false);
  const [asOfDate, setAsOfDate] = useState(new Date());
  const [compareDate, setCompareDate] = useState(null);
  const [enableCompare, setEnableCompare] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [compareData, setCompareData] = useState(null);

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
    setLoading(true);
    try {
      const response = await window.api.reports.getDailyNetSummary({
        asOfDate: formatDate(asOfDate),
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

    // Fetch comparison data if enabled
    if (enableCompare && compareDate) {
      try {
        const compareResponse = await window.api.reports.getDailyNetSummary({
          asOfDate: formatDate(compareDate),
        });
        if (compareResponse.success) {
          setCompareData(compareResponse.data);
        }
      } catch (err) {
        console.error('Compare date fetch error:', err);
      }
    } else {
      setCompareData(null);
    }
  }, [asOfDate, compareDate, enableCompare]);

  const SummaryCard = ({ title, titleUrdu, value, icon: Icon, color = 'blue' }) => (
    <Paper shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="xs">
        <div className="flex items-center justify-between">
          <Text size="sm" c="dimmed">
            {title}
          </Text>
          <Icon size={24} color={`var(--mantine-color-${color}-6)`} />
        </div>
        <Text size="xs" c="dimmed" style={{ direction: 'rtl' }}>
          {titleUrdu}
        </Text>
        <Text size="xl" fw={700} c={color}>
          Rs. {formatNumber(value)}
        </Text>
      </Stack>
    </Paper>
  );

  SummaryCard.propTypes = {
    title: PropTypes.string.isRequired,
    titleUrdu: PropTypes.string.isRequired,
    value: PropTypes.number,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string,
  };

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={loading} />

      {/* Filters */}
      <Grid align="flex-end">
        <Grid.Col span={4}>
          <DatePickerInput
            label="Date"
            value={asOfDate}
            onChange={setAsOfDate}
            maxDate={new Date()}
          />
        </Grid.Col>
        <Grid.Col span={1}>
          <Checkbox
            label="Compare"
            checked={enableCompare}
            onChange={(e) => {
              setEnableCompare(e.target.checked);
              if (!e.target.checked) setCompareData(null);
            }}
            mt="xl"
          />
        </Grid.Col>
        {enableCompare && (
          <Grid.Col span={3}>
            <DatePickerInput
              label="Compare Date"
              value={compareDate}
              onChange={setCompareDate}
              maxDate={new Date()}
            />
          </Grid.Col>
        )}
        <Grid.Col span={2}>
          <Button leftSection={<IconSearch size={16} />} onClick={handleGenerate} fullWidth>
            Go
          </Button>
        </Grid.Col>
      </Grid>

      {/* Report Display */}
      {reportData && (
        <ReportViewer
          title="Daily Net Amount Summary"
          titleUrdu="رجسٹر ٹوٹل رقم"
          singleDate={formatDate(asOfDate)}
        >
          <Stack gap="lg">
            {/* Summary Cards */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md">
              <SummaryCard
                title="Previous Balance"
                titleUrdu="سابقہ بقایا"
                value={reportData.previousBalance}
                icon={IconWallet}
                color="gray"
              />
              <SummaryCard
                title="Today's Sales"
                titleUrdu="آج کی بکری"
                value={reportData.todaySales}
                icon={IconReceipt}
                color="blue"
              />
              <SummaryCard
                title="Total Amount"
                titleUrdu="کل رقم"
                value={reportData.totalAmount}
                icon={IconCash}
                color="indigo"
              />
              <SummaryCard
                title="Total Collection"
                titleUrdu="کل وصولی"
                value={reportData.totalCollection}
                icon={IconCreditCard}
                color="green"
              />
              <SummaryCard
                title="Closing Balance"
                titleUrdu="بقایا رقم"
                value={reportData.closingBalance}
                icon={IconWallet}
                color="red"
              />
            </SimpleGrid>

            {/* Detailed Breakdown */}
            <Paper shadow="sm" p="lg" radius="md" withBorder>
              <Text fw={600} mb="md">
                Detailed Breakdown / تفصیلات
              </Text>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <Stack gap="sm">
                  <Text size="sm" fw={500}>
                    Sales Details
                  </Text>
                  <div className="flex justify-between">
                    <Text size="sm" c="dimmed">
                      Today&apos;s Sales:
                    </Text>
                    <Text size="sm">Rs. {formatNumber(reportData.todaySales)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text size="sm" c="dimmed">
                      Today&apos;s Charges (Fare + Ice):
                    </Text>
                    <Text size="sm">Rs. {formatNumber(reportData.todayCharges)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text size="sm" c="dimmed">
                      Today&apos;s Discount:
                    </Text>
                    <Text size="sm">Rs. {formatNumber(reportData.todayDiscount)}</Text>
                  </div>
                </Stack>
                <Stack gap="sm">
                  <Text size="sm" fw={500}>
                    Collection Details
                  </Text>
                  <div className="flex justify-between">
                    <Text size="sm" c="dimmed">
                      Cash Received (Sale):
                    </Text>
                    <Text size="sm">Rs. {formatNumber(reportData.todayCollection)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text size="sm" c="dimmed">
                      Payments Received:
                    </Text>
                    <Text size="sm">Rs. {formatNumber(reportData.todayPayments)}</Text>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <Text size="sm" fw={500}>
                      Total Collection:
                    </Text>
                    <Text size="sm" fw={500}>
                      Rs. {formatNumber(reportData.totalCollection)}
                    </Text>
                  </div>
                </Stack>
              </SimpleGrid>
            </Paper>

            {/* Balance Calculation */}
            <Paper shadow="sm" p="lg" radius="md" withBorder bg="gray.0">
              <Text fw={600} mb="md">
                Balance Calculation / باقی حساب
              </Text>
              <Stack gap="xs">
                <div className="flex justify-between">
                  <Text>Previous Balance (سابقہ بقایا):</Text>
                  <Text fw={500}>Rs. {formatNumber(reportData.previousBalance)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>+ Today&apos;s Sales (آج کی بکری):</Text>
                  <Text fw={500}>Rs. {formatNumber(reportData.todaySales)}</Text>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <Text fw={500}>= Total Amount (کل رقم):</Text>
                  <Text fw={600}>Rs. {formatNumber(reportData.totalAmount)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>- Total Collection (کل وصولی):</Text>
                  <Text fw={500}>Rs. {formatNumber(reportData.totalCollection)}</Text>
                </div>
                <div
                  className="flex justify-between border-t pt-2 mt-2"
                  style={{ borderTopWidth: 2 }}
                >
                  <Text size="lg" fw={700}>
                    Closing Balance (بقایا رقم):
                  </Text>
                  <Text size="lg" fw={700} c="red">
                    Rs. {formatNumber(reportData.closingBalance)}
                  </Text>
                </div>
              </Stack>
            </Paper>

            {/* Multi-Date Comparison Table (FR-NETSUMMARY-021) */}
            {compareData && (
              <Paper shadow="sm" p="lg" radius="md" withBorder>
                <Text fw={600} mb="md">
                  Date Comparison / تاریخ کا موازنہ
                </Text>
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Metric</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>
                        {new Date(asOfDate).toLocaleDateString('en-GB')}
                      </Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>
                        {new Date(compareDate).toLocaleDateString('en-GB')}
                      </Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Difference</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Trend</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {[
                      { label: 'Previous Balance / سابقہ', key: 'previousBalance' },
                      { label: "Today's Sales / بکری", key: 'todaySales' },
                      { label: 'Total Amount / کل رقم', key: 'totalAmount' },
                      { label: 'Total Collection / وصولی', key: 'totalCollection' },
                      { label: 'Closing Balance / بقایا', key: 'closingBalance' },
                    ].map((metric) => {
                      const val1 = reportData[metric.key] || 0;
                      const val2 = compareData[metric.key] || 0;
                      const diff = val1 - val2;
                      return (
                        <Table.Tr key={metric.key}>
                          <Table.Td>{metric.label}</Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            Rs. {formatNumber(val1)}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            Rs. {formatNumber(val2)}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Text c={diff > 0 ? 'red' : diff < 0 ? 'green' : 'dimmed'} size="sm">
                              Rs. {formatNumber(Math.abs(diff))}
                            </Text>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'center' }}>
                            <Text size="lg" c={diff > 0 ? 'red' : diff < 0 ? 'green' : 'dimmed'}>
                              {diff > 0 ? '↑' : diff < 0 ? '↓' : '—'}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Paper>
            )}
          </Stack>
        </ReportViewer>
      )}
    </Stack>
  );
}

export default DailyNetAmountSummaryReport;
