import { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    TextInput,
    NumberInput,
    Textarea,
    Select,
    Button,
    Group,
    Stack,
    Text,
    SimpleGrid,
    LoadingOverlay,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';

/**
 * ItemForm Component
 * Modal form for creating and editing inventory items.
 * Implements FR-ITEM-001 through FR-ITEM-019.
 *
 * @param {boolean} opened - Whether the modal is open
 * @param {function} onClose - Close handler
 * @param {Object} item - Item data for edit mode (null for create)
 * @param {function} onSuccess - Callback after successful save
 */
function ItemForm({ opened, onClose, item = null, onSuccess }) {
    const isEditMode = !!item;

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        name_english: '',
        unit_price: 0,
        category_id: null,
        notes: '',
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});

    // Load reference data
    useEffect(() => {
        const loadReferenceData = async () => {
            try {
                const categoriesResult = await window.api.reference.getCategories();

                if (categoriesResult.success) {
                    setCategories([
                        { value: '', label: 'None' },
                        ...categoriesResult.data.map((c) => ({
                            value: String(c.id),
                            label: c.name_urdu ? `${c.name} (${c.name_urdu})` : c.name,
                        })),
                    ]);
                }
            } catch (error) {
                console.error('Failed to load reference data:', error);
            }
        };

        if (opened) {
            loadReferenceData();
        }
    }, [opened]);

    // Populate form when editing
    useEffect(() => {
        if (item && opened) {
            setFormData({
                name: item.name || '',
                name_english: item.name_english || '',
                unit_price: item.unit_price || 0,
                category_id: item.category_id ? String(item.category_id) : null,
                notes: item.notes || '',
            });
            setErrors({});
        }
    }, [item, opened]);

    // Handle input change
    const handleChange = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        setErrors((prev) => ({ ...prev, [field]: null }));
    }, []);

    // Validate form
    const validate = useCallback(() => {
        const newErrors = {};

        // Required: Name (Urdu)
        if (!formData.name.trim()) {
            newErrors.name = 'نام ضروری ہے (Name is required)';
        }

        // Unit price must be non-negative
        if (formData.unit_price < 0) {
            newErrors.unit_price = 'Unit price cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Clear form
    const handleClear = useCallback(() => {
        setFormData({
            name: '',
            name_english: '',
            unit_price: 0,
            category_id: null,
            notes: '',
        });
        setErrors({});
    }, []);

    // Handle close
    const handleClose = useCallback(() => {
        handleClear();
        onClose();
    }, [handleClear, onClose]);

    // Submit form
    const handleSubmit = useCallback(async () => {
        if (!validate()) {
            notifications.show({
                title: 'Validation Error',
                message: 'Please fix the errors before saving',
                color: 'red',
            });
            return;
        }

        setLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
                unit_price: parseFloat(formData.unit_price) || 0,
            };

            let result;
            if (isEditMode) {
                result = await window.api.items.update(item.id, dataToSubmit);
            } else {
                result = await window.api.items.create(dataToSubmit);
            }

            if (result.success) {
                notifications.show({
                    title: isEditMode ? 'Item Updated' : 'Item Created',
                    message: `Item "${formData.name}" has been ${isEditMode ? 'updated' : 'created'} successfully`,
                    color: 'green',
                });
                handleClear();
                onSuccess?.();
                onClose();
            } else {
                notifications.show({
                    title: 'Error',
                    message: result.error || 'Failed to save item',
                    color: 'red',
                });
            }
        } catch (error) {
            console.error('Submit error:', error);
            notifications.show({
                title: 'Error',
                message: error.message || 'An unexpected error occurred',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    }, [formData, isEditMode, item, validate, handleClear, onSuccess, onClose]);

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={
                <Group gap="sm">
                    <Text size="xl">📦</Text>
                    <Text size="lg" fw={600}>
                        {isEditMode ? 'Edit Item' : 'Add New Item'}
                    </Text>
                </Group>
            }
            size="md"
            centered
            closeOnClickOutside={false}
        >
            <LoadingOverlay visible={loading} />

            <Stack gap="md">
                <SimpleGrid cols={2}>
                    {/* Name (Urdu) - Required */}
                    <TextInput
                        label="Item Name (Urdu) - مال"
                        placeholder="Enter item name in Urdu"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={errors.name}
                        required
                        dir="rtl"
                        styles={{ input: { textAlign: 'right' } }}
                    />

                    {/* Name (English) */}
                    <TextInput
                        label="Item Name (English)"
                        placeholder="Enter item name in English"
                        value={formData.name_english}
                        onChange={(e) => handleChange('name_english', e.target.value)}
                    />
                </SimpleGrid>

                <SimpleGrid cols={2}>
                    {/* Unit Price */}
                    <NumberInput
                        label="Unit Price (Rs.)"
                        placeholder="0.00"
                        value={formData.unit_price}
                        onChange={(value) => handleChange('unit_price', value || 0)}
                        error={errors.unit_price}
                        min={0}
                        decimalScale={2}
                        fixedDecimalScale
                        thousandSeparator=","
                    />

                    {/* Category */}
                    <Select
                        label="Category"
                        placeholder="Select category"
                        data={categories}
                        value={formData.category_id}
                        onChange={(value) => handleChange('category_id', value)}
                        searchable
                        clearable
                    />
                </SimpleGrid>

                {/* Notes */}
                <Textarea
                    label="Notes"
                    placeholder="Additional notes (optional)"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                />

                {/* Action Buttons */}
                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" color="gray" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="light" onClick={handleClear}>
                        Clear
                    </Button>
                    <Button onClick={handleSubmit} loading={loading}>
                        {isEditMode ? 'Update' : 'Save'}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}

ItemForm.propTypes = {
    opened: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    item: PropTypes.object,
    onSuccess: PropTypes.func,
};

export default ItemForm;
