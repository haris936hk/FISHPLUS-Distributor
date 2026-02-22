import { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Title,
  Select,
  TextInput,
  Button,
  LoadingOverlay,
  Divider,
  Grid,
  Table,
  ActionIcon,
  Checkbox,
  Badge,
  ScrollArea,
  Pagination,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';
import '@mantine/dates/styles.css';
import { useResizableColumns } from '../hooks/useResizableColumns';

/**
 * SaleSearch Component
 * Search and manage existing sales transactions.
 * Implements FR-SALESEARCH-001 through FR-SALESEARCH-034.
 *
 * @param {function} onEdit - Callback to edit a sale
 */
function SaleSearch({ onEdit }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  // Filters
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [allCustomers, setAllCustomers] = useState(true);
  const [saleNumber, setSaleNumber] = useState('');
  const [searchBySaleNumber, setSearchBySaleNumber] = useState(false);

  // Bulk selection (FR-GRID-006)
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Column resizing (FR-GRID-008)
  const { getResizeProps } = useResizableColumns({
    saleNum: 90,
    date: 100,
    customer: 150,
    supplier: 150,
    vehicle: 100,
    netAmt: 120,
    balance: 120,
    status: 80,
    actions: 100,
  });

  // Load customers on mount
  useEffect(() => {
    const loadCustomers = async () => {
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
        console.error('Failed to load customers:', error);
      }
    };
    loadCustomers();
  }, []);

  // Format date for API
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Search sales
  const handleSearch = useCallback(async () => {
    if (dateFrom > dateTo) {
      notifications.show({
        title: 'Validation Error',
        message: 'Start date cannot be after end date',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const filters = {
        dateFrom: formatDate(dateFrom),
        dateTo: formatDate(dateTo),
        customerId: !allCustomers ? parseInt(selectedCustomer) : null,
        allCustomers,
        saleNumber: searchBySaleNumber ? saleNumber : null,
      };

      const response = await window.api.sales.search(filters);

      if (response.success) {
        setSales(response.data);
        setPage(1);
        if (response.data.length === 0) {
          notifications.show({
            title: 'No Results',
            message: 'No sales found matching the criteria',
            color: 'yellow',
          });
        }
      } else {
        notifications.show({
          title: 'Error',
          message: response.error || 'Failed to search sales',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to search sales',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, selectedCustomer, allCustomers, saleNumber, searchBySaleNumber]);

  // Delete sale
  const handleDelete = useCallback(
    (sale) => {
      modals.openConfirmModal({
        title: 'Delete Sale',
        children: (
          <Text size="sm">
            Are you sure you want to delete sale <strong>{sale.sale_number}</strong>? This action
            cannot be undone. Stock and customer balance will be restored.
          </Text>
        ),
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: async () => {
          setLoading(true);
          try {
            const response = await window.api.sales.delete(sale.id);
            if (response.success) {
              notifications.show({
                title: 'Success',
                message: 'Sale deleted successfully',
                color: 'green',
              });
              handleSearch();
            } else {
              notifications.show({
                title: 'Error',
                message: response.error || 'Failed to delete sale',
                color: 'red',
              });
            }
          } catch (error) {
            console.error('Delete error:', error);
            notifications.show({
              title: 'Error',
              message: 'Failed to delete sale',
              color: 'red',
            });
          } finally {
            setLoading(false);
          }
        },
      });
    },
    [handleSearch]
  );

  // Format display date
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Print All Client Slips (FR-SALESEARCH-025)
  const handlePrintAllSlips = useCallback(async () => {
    if (sales.length === 0) {
      notifications.show({ title: 'No Data', message: 'No sales to print', color: 'yellow' });
      return;
    }

    try {
      setLoading(true);
      // Fetch full details for each sale
      const saleDetails = [];
      for (const sale of sales) {
        const resp = await window.api.sales.getById(sale.id);
        if (resp.success) saleDetails.push(resp.data);
      }

      const slipHtml = saleDetails
        .map((sale) => {
          const itemRows = (sale.items || [])
            .map((item) => {
              const netWeight = (item.weight || 0) - (item.tare_weight || 0);
              const amount = netWeight * (item.rate || 0);
              return `<tr>
                        <td>${item.item_name || ''}</td>
                        <td style="text-align:right">${netWeight.toFixed(2)}</td>
                        <td style="text-align:right">${(item.rate || 0).toFixed(2)}</td>
                        <td style="text-align:right">${amount.toFixed(2)}</td>
                    </tr>`;
            })
            .join('');

          return `<div class="slip">
                    <div class="header">
                        <h2>AL-SHEIKH FISH TRADER AND DISTRIBUTER</h2>
                        <p style="font-size:16px;direction:rtl">اے ایل شیخ فش ٹریڈر اینڈ ڈسٹری بیوٹر</p>
                        <p>Shop No. W-644 Gunj Mandi Rawalpindi</p>
                        <p>Ph: +92-3008501724 | 051-5534607</p>
                        <h3>Sale Receipt / بکری رسید</h3>
                    </div>
                    <div class="info">
                        <span><strong>Receipt #:</strong> ${sale.sale_number}</span>
                        <span><strong>Date:</strong> ${formatDisplayDate(sale.sale_date)}</span>
                        <span><strong>Customer:</strong> ${sale.customer_name || '-'}</span>
                    </div>
                    <table>
                        <thead><tr><th>Item</th><th style="text-align:right">Weight (kg)</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
                        <tbody>${itemRows}</tbody>
                    </table>
                    <table class="totals">
                        <tr><td>Net Amount:</td><td><strong>Rs. ${(sale.net_amount || 0).toFixed(2)}</strong></td></tr>
                        <tr><td>Cash Received:</td><td>Rs. ${(sale.cash_received || 0).toFixed(2)}</td></tr>
                        <tr class="grand-total"><td>Balance:</td><td>Rs. ${(sale.balance_amount || 0).toFixed(2)}</td></tr>
                    </table>
                </div>`;
        })
        .join('');

      const html = `<!DOCTYPE html><html><head><title>All Customer Slips</title>
            <style>
                @page { margin: 1cm; }
                body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; color: #333; }
                .slip { padding: 20px; page-break-after: always; }
                .slip:last-child { page-break-after: auto; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
                .header h2 { margin: 0; } .header h3 { margin: 10px 0 0; } .header p { margin: 3px 0; font-size: 12px; }
                .info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 12px; }
                th { background: #f5f5f5; text-align: left; }
                .totals { text-align: right; font-size: 13px; } .totals td { border: none; padding: 3px 8px; }
                .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #333 !important; }
                @media print { body { padding: 0; } }
            </style></head><body>${slipHtml}</body></html>`;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error('Print all slips error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to generate client slips',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [sales]);

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder pos="relative">
      <LoadingOverlay visible={loading} />

      <Stack gap="md">
        <Title order={4} className="text-blue-700">
          🔍 Search Sales (بکری تلاش)
        </Title>

        <Divider />

        {/* Filters */}
        <Grid align="end">
          <Grid.Col span={3}>
            <DatePickerInput
              label="شروع تاریخ / From Date"
              placeholder="Start date"
              value={dateFrom}
              onChange={setDateFrom}
              maxDate={dateTo || undefined}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <DatePickerInput
              label="اختتام تاریخ / To Date"
              placeholder="End date"
              value={dateTo}
              onChange={setDateTo}
              minDate={dateFrom || undefined}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Select
              label="گاہک / Customer"
              placeholder="Select customer"
              data={customers}
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              searchable
              disabled={allCustomers}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Checkbox
              label="تمام گاہک / All Customers"
              checked={allCustomers}
              onChange={(e) => setAllCustomers(e.target.checked)}
              mt="xl"
            />
          </Grid.Col>
        </Grid>

        <Grid align="end">
          <Grid.Col span={3}>
            <TextInput
              label="بکری نمبر / Sale #"
              placeholder="Enter sale number"
              value={saleNumber}
              onChange={(e) => setSaleNumber(e.target.value)}
              disabled={!searchBySaleNumber}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Checkbox
              label="بکری نمبر سے تلاش / Search by Sale #"
              checked={searchBySaleNumber}
              onChange={(e) => setSearchBySaleNumber(e.target.checked)}
              mt="xl"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Group justify="flex-end">
              <Button
                variant="light"
                color="teal"
                onClick={handlePrintAllSlips}
                disabled={sales.length === 0}
              >
                🖨️ تمام رسیدیں پرنٹ / Print All Customer Slips
              </Button>
              <Button variant="filled" color="blue" onClick={handleSearch}>
                تلاش / Search
              </Button>
            </Group>
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Bulk Actions (FR-GRID-006) */}
        {selectedIds.size > 0 && (
          <Group
            gap="sm"
            p="xs"
            style={{ background: 'var(--mantine-color-blue-0)', borderRadius: 8 }}
          >
            <Text size="sm" fw={500}>
              {selectedIds.size} منتخب / selected
            </Text>
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => {
                modals.openConfirmModal({
                  title: 'منتخب بکریاں حذف کریں / Delete Selected Sales',
                  children: (
                    <Text size="sm">
                      کیا آپ {selectedIds.size} منتخب بکری(یاں) حذف کرنا چاہتے ہیں؟
                    </Text>
                  ),
                  labels: { confirm: 'حذف کریں / Delete All', cancel: 'منسوخ / Cancel' },
                  confirmProps: { color: 'red' },
                  onConfirm: async () => {
                    for (const id of selectedIds) {
                      await window.api.sales.delete(id);
                    }
                    setSelectedIds(new Set());
                    handleSearch();
                    notifications.show({
                      title: 'حذف ہو گئیں',
                      message: `${selectedIds.size} بکری(یاں) حذف ہو گئیں`,
                      color: 'green',
                    });
                  },
                });
              }}
            >
              🗑️ منتخب حذف کریں / Delete Selected
            </Button>
            <Button size="xs" variant="subtle" onClick={() => setSelectedIds(new Set())}>
              انتخاب صاف کریں / Clear Selection
            </Button>
          </Group>
        )}

        {/* Results */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            ریکارڈ ملے / Records Found: <strong>{sales.length}</strong>
          </Text>
        </Group>

        <ScrollArea h={400}>
          <Table striped withTableBorder highlightOnHover style={{ tableLayout: 'fixed' }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 40 }}>
                  <Checkbox
                    checked={
                      sales.length > 0 &&
                      sales
                        .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                        .every((s) => selectedIds.has(s.id))
                    }
                    indeterminate={
                      sales
                        .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                        .some((s) => selectedIds.has(s.id)) &&
                      !sales
                        .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                        .every((s) => selectedIds.has(s.id))
                    }
                    onChange={(e) => {
                      const pageIds = sales
                        .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                        .map((s) => s.id);
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        pageIds.forEach((id) =>
                          e.target.checked ? next.add(id) : next.delete(id)
                        );
                        return next;
                      });
                    }}
                  />
                </Table.Th>
                {[
                  ['saleNum', 'بکری نمبر', 'Sale #'],
                  ['date', 'تاریخ', 'Date'],
                  ['customer', 'گاہک', 'Customer'],
                  ['supplier', 'بیوپاری', 'Supplier'],
                  ['vehicle', 'گڑی نمبر', 'Vehicle No'],
                  ['netAmt', 'خالص رقم', 'Net Amount'],
                  ['balance', 'بقایا', 'Balance'],
                  ['status', 'حالت', 'Status'],
                  ['actions', 'عمل', 'Actions'],
                ].map(([key, ur, en]) => {
                  const rp = getResizeProps(key);
                  return (
                    <Table.Th
                      key={key}
                      style={{
                        ...rp.style,
                        textAlign: ['netAmt', 'balance'].includes(key) ? 'right' : undefined,
                      }}
                    >
                      <div style={{ fontWeight: 700, lineHeight: 1.2 }}>{ur}</div>
                      <div style={{ fontWeight: 400, fontSize: 10, opacity: 0.6 }}>{en}</div>
                      <div {...rp.resizeHandle} />
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sales.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={10}>
                    <Text c="dimmed" ta="center" py="xl">
                      کوئی بکری نہیں ملی — اوپر کے فلٹر استعمال کریں۔
                      <br />
                      <span style={{ fontSize: 12 }}>
                        No sales found. Use the filters above to search.
                      </span>
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                sales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((sale) => (
                  <Table.Tr key={sale.id} bg={selectedIds.has(sale.id) ? 'blue.0' : undefined}>
                    <Table.Td>
                      <Checkbox
                        checked={selectedIds.has(sale.id)}
                        onChange={(e) => {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            e.target.checked ? next.add(sale.id) : next.delete(sale.id);
                            return next;
                          });
                        }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{sale.sale_number}</Text>
                    </Table.Td>
                    <Table.Td>{formatDisplayDate(sale.sale_date)}</Table.Td>
                    <Table.Td>{sale.customer_name || '-'}</Table.Td>
                    <Table.Td>{sale.supplier_name || '-'}</Table.Td>
                    <Table.Td>{sale.vehicle_number || '-'}</Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      Rs. {(sale.net_amount || 0).toFixed(2)}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text c={sale.balance_amount > 0 ? 'red' : 'green'}>
                        Rs. {(sale.balance_amount || 0).toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={sale.status === 'posted' ? 'green' : 'orange'}
                        variant="light"
                        size="sm"
                      >
                        {sale.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          color="blue"
                          variant="subtle"
                          onClick={() => onEdit?.(sale)}
                          title={
                            sale.status === 'posted' ? 'Posted sales cannot be edited' : 'Edit'
                          }
                          disabled={sale.status === 'posted'}
                        >
                          ✏️
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleDelete(sale)}
                          title={
                            sale.status === 'posted' ? 'Posted sales cannot be deleted' : 'Delete'
                          }
                          disabled={sale.status === 'posted'}
                        >
                          🗑️
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {/* Pagination */}
        {Math.ceil(sales.length / PAGE_SIZE) > 1 && (
          <Group justify="center" mt="sm">
            <Pagination
              total={Math.ceil(sales.length / PAGE_SIZE)}
              value={page}
              onChange={setPage}
              size="sm"
            />
          </Group>
        )}
      </Stack>
    </Paper>
  );
}

SaleSearch.propTypes = {
  onEdit: PropTypes.func,
};

export default SaleSearch;
