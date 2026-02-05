import { useState, useCallback } from 'react';
import {
    Title,
    Text,
    Button,
    Group,
    Stack,
    Paper,
} from '@mantine/core';
import PropTypes from 'prop-types';
import { SupplierForm, SupplierSearch } from '../components';

/**
 * Suppliers Page Component
 * Main container for supplier management.
 * Implements FR-SUP requirements and FR-SUP-SEARCH requirements.
 *
 * @param {function} onBack - Callback to navigate back to dashboard
 */
function Suppliers({ onBack }) {
    // Modal state
    const [formOpened, setFormOpened] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Open form for new supplier
    const handleAdd = useCallback(() => {
        setEditingSupplier(null);
        setFormOpened(true);
    }, []);

    // Open form for editing
    const handleEdit = useCallback((supplier) => {
        setEditingSupplier(supplier);
        setFormOpened(true);
    }, []);

    // Close form
    const handleCloseForm = useCallback(() => {
        setFormOpened(false);
        setEditingSupplier(null);
    }, []);

    // Refresh list after save
    const handleSuccess = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 dark:from-gray-900 dark:to-slate-800">
            {/* Header */}
            <Paper
                shadow="md"
                className="bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-800"
                style={{ borderRadius: 0 }}
            >
                <div className="px-8 py-6">
                    <Group justify="space-between" align="center">
                        <Stack gap={4}>
                            <Title order={1} c="white" className="text-3xl font-bold">
                                🏪 Supplier Management
                            </Title>
                            <Text c="white" opacity={0.9} size="md">
                                Add, Edit, and Search Suppliers
                            </Text>
                        </Stack>
                        <Group>
                            <Button
                                variant="white"
                                color="violet"
                                onClick={handleAdd}
                                leftSection={<span>➕</span>}
                            >
                                Add New Supplier
                            </Button>
                            <Button
                                variant="light"
                                color="gray"
                                onClick={onBack}
                                leftSection={<span>🏠</span>}
                            >
                                Back to Dashboard
                            </Button>
                        </Group>
                    </Group>
                </div>
            </Paper>

            {/* Main Content */}
            <div className="p-8">
                <SupplierSearch
                    onEdit={handleEdit}
                    onRefresh={{ refreshKey }}
                />
            </div>

            {/* Supplier Form Modal */}
            <SupplierForm
                opened={formOpened}
                onClose={handleCloseForm}
                supplier={editingSupplier}
                onSuccess={handleSuccess}
            />
        </div>
    );
}

Suppliers.propTypes = {
    onBack: PropTypes.func.isRequired,
};

export default Suppliers;
