import { useState, useCallback, useEffect } from 'react';
import {
  Card,
  TextInput,
  Button,
  Group,
  Table,
  Text,
  ActionIcon,
  Tooltip,
  Stack,
  Center,
  Loader,
  Badge,
  ScrollArea,
  Pagination,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';

/**
 * SupplierSearch Component
 * Search and list suppliers with edit/delete actions.
 * Implements FR-SUP-SEARCH-001 through FR-SUP-SEARCH-021.
 *
 * @param {function} onEdit - Callback when edit is clicked
 * @param {function} onRefresh - Callback to refresh after delete
 */
function SupplierSearch({ onEdit, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  // Load all suppliers initially
  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await window.api.suppliers.getAll();
      if (result.success) {
        setSuppliers(result.data);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load suppliers',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Load suppliers error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load suppliers',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // Search suppliers
  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const result = searchTerm.trim()
        ? await window.api.suppliers.search(searchTerm)
        : await window.api.suppliers.getAll();

      if (result.success) {
        setSuppliers(result.data);
        setPage(1);
        if (result.data.length === 0) {
          notifications.show({
            title: 'No Results',
            message: 'No suppliers found matching your search',
            color: 'blue',
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      notifications.show({
        title: 'Error',
        message: 'Search failed',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Handle delete with confirmation
  const handleDelete = useCallback(
    (supplier) => {
      modals.openConfirmModal({
        title: 'Delete Supplier',
        centered: true,
        children: (
          <Text size="sm">
            Are you sure you want to delete supplier <strong>{supplier.name}</strong>? This action
            cannot be undone.
          </Text>
        ),
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: async () => {
          try {
            const result = await window.api.suppliers.delete(supplier.id);
            if (result.success) {
              notifications.show({
                title: 'Deleted',
                message: `Supplier "${supplier.name}" has been deleted`,
                color: 'green',
              });
              loadSuppliers();
              onRefresh?.();
            } else {
              notifications.show({
                title: 'Cannot Delete',
                message: result.error,
                color: 'red',
              });
            }
          } catch {
            notifications.show({
              title: 'Error',
              message: 'Failed to delete supplier',
              color: 'red',
            });
          }
        },
      });
    },
    [loadSuppliers, onRefresh]
  );

  // Handle key press in search input
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Refresh when parent requests
  useEffect(() => {
    if (!initialLoad) {
      loadSuppliers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRefresh?.refreshKey]);

  // Paginated rows
  const totalPages = Math.ceil(suppliers.length / PAGE_SIZE);
  const paginatedSuppliers = suppliers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Table rows
  const rows = paginatedSuppliers.map((supplier) => (
    <Table.Tr key={supplier.id}>
      <Table.Td>
        <Text fw={500} dir="rtl">
          {supplier.name}
        </Text>
        {supplier.name_english && (
          <Text size="xs" c="dimmed">
            {supplier.name_english}
          </Text>
        )}
      </Table.Td>
      <Table.Td>{supplier.city_name || '-'}</Table.Td>
      <Table.Td>{supplier.country_name || '-'}</Table.Td>
      <Table.Td>{supplier.mobile || supplier.phone || supplier.email || '-'}</Table.Td>
      <Table.Td>
        <Badge variant="light" color="blue">
          {Number(supplier.advance_amount || 0).toFixed(2)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Edit">
            <ActionIcon variant="light" color="blue" onClick={() => onEdit?.(supplier)}>
              <span>✏️</span>
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="light" color="red" onClick={() => handleDelete(supplier)}>
              <span>🗑️</span>
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* Search Section */}
        <Group justify="space-between">
          <Group>
            <TextInput
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ width: 300 }}
            />
            <Button onClick={handleSearch} loading={loading}>
              🔍 Search
            </Button>
            <Button
              variant="light"
              onClick={() => {
                setSearchTerm('');
                loadSuppliers();
              }}
            >
              Clear
            </Button>
          </Group>
          <Text size="sm" c="dimmed">
            {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} found
          </Text>
        </Group>

        {/* Results Table */}
        <ScrollArea h={400}>
          {loading && initialLoad ? (
            <Center h={300}>
              <Loader size="lg" />
            </Center>
          ) : suppliers.length === 0 ? (
            <Center h={200}>
              <Stack align="center" gap="sm">
                <Text size="xl">📭</Text>
                <Text c="dimmed">No suppliers found</Text>
              </Stack>
            </Center>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>City</Table.Th>
                  <Table.Th>Country</Table.Th>
                  <Table.Th>Contact</Table.Th>
                  <Table.Th>Advance</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          )}
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center" mt="sm">
            <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
          </Group>
        )}
      </Stack>
    </Card>
  );
}

SupplierSearch.propTypes = {
  onEdit: PropTypes.func,
  onRefresh: PropTypes.object,
};

export default SupplierSearch;
