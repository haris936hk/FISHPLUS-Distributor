import { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    TextInput,
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
 * CustomerForm Component
 * Modal form for creating and editing customer records.
 * Implements FR-CUST-001 through FR-CUST-030.
 *
 * @param {boolean} opened - Whether the modal is open
 * @param {function} onClose - Close handler
 * @param {Object} customer - Customer data for edit mode (null for create)
 * @param {function} onSuccess - Callback after successful save
 */
function CustomerForm({ opened, onClose, customer = null, onSuccess }) {
    const isEditMode = !!customer;

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        name_english: '',
        nic: '',
        phone: '',
        mobile: '',
        email: '',
        address: '',
        city_id: null,
        country_id: null,
        notes: '',
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState([]);
    const [countries, setCountries] = useState([]);
    const [errors, setErrors] = useState({});

    // Load reference data
    useEffect(() => {
        const loadReferenceData = async () => {
            try {
                const [citiesResult, countriesResult] = await Promise.all([
                    window.api.reference.getCities(),
                    window.api.reference.getCountries(),
                ]);

                if (citiesResult.success) {
                    setCities(
                        citiesResult.data.map((c) => ({
                            value: String(c.id),
                            label: `${c.name} (${c.name_urdu || c.name})`,
                        }))
                    );
                }

                if (countriesResult.success) {
                    setCountries(
                        countriesResult.data.map((c) => ({
                            value: String(c.id),
                            label: `${c.name} (${c.name_urdu || c.name})`,
                        }))
                    );
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
        if (customer && opened) {
            setFormData({
                name: customer.name || '',
                name_english: customer.name_english || '',
                nic: customer.nic || '',
                phone: customer.phone || '',
                mobile: customer.mobile || '',
                email: customer.email || '',
                address: customer.address || '',
                city_id: customer.city_id ? String(customer.city_id) : null,
                country_id: customer.country_id ? String(customer.country_id) : null,
                notes: customer.notes || '',
            });
            setErrors({});
        }
    }, [customer, opened]);

    // Handle input change
    const handleChange = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        setErrors((prev) => ({ ...prev, [field]: null }));
    }, []);

    // Format NIC as user types (XXXXX-XXXXXXX-X)
    const handleNicChange = useCallback((value) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');

        // Format: XXXXX-XXXXXXX-X
        let formatted = '';
        if (digits.length > 0) {
            formatted = digits.slice(0, 5);
        }
        if (digits.length > 5) {
            formatted += '-' + digits.slice(5, 12);
        }
        if (digits.length > 12) {
            formatted += '-' + digits.slice(12, 13);
        }

        handleChange('nic', formatted);
    }, [handleChange]);

    // Validate form
    const validate = useCallback(() => {
        const newErrors = {};

        // Required: At least one name (Urdu or English)
        if (!formData.name.trim() && !formData.name_english.trim()) {
            newErrors.name = 'نام ضروری ہے (At least one name is required)';
        }

        // NIC format validation (if provided)
        if (formData.nic && !/^\d{5}-\d{7}-\d{1}$/.test(formData.nic)) {
            newErrors.nic = 'Invalid NIC format. Use: XXXXX-XXXXXXX-X';
        }

        // Mobile format validation (if provided) - Pakistan format
        if (formData.mobile && !/^03\d{9}$/.test(formData.mobile.replace(/\D/g, ''))) {
            newErrors.mobile = 'Invalid mobile format. Use: 03XXXXXXXXX';
        }

        // Email format validation (if provided)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // At least one contact method
        if (!formData.phone && !formData.mobile && !formData.email) {
            newErrors.contact = 'At least one contact method is required (Phone, Mobile, or Email)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Clear form
    const handleClear = useCallback(() => {
        setFormData({
            name: '',
            name_english: '',
            nic: '',
            phone: '',
            mobile: '',
            email: '',
            address: '',
            city_id: null,
            country_id: null,
            notes: '',
        });
        setErrors({});
    }, []);

    // Handle close with unsaved changes check
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
                city_id: formData.city_id ? parseInt(formData.city_id, 10) : null,
                country_id: formData.country_id ? parseInt(formData.country_id, 10) : null,
            };

            let result;
            if (isEditMode) {
                result = await window.api.customers.update(customer.id, dataToSubmit);
            } else {
                result = await window.api.customers.create(dataToSubmit);
            }

            if (result.success) {
                notifications.show({
                    title: isEditMode ? 'Customer Updated' : 'Customer Created',
                    message: `Customer "${formData.name || formData.name_english}" has been ${isEditMode ? 'updated' : 'created'} successfully`,
                    color: 'green',
                });
                handleClear();
                onSuccess?.();
                onClose();
            } else {
                notifications.show({
                    title: 'Error',
                    message: result.error || 'Failed to save customer',
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
    }, [formData, isEditMode, customer, validate, handleClear, onSuccess, onClose]);

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={
                <Group gap="sm">
                    <Text size="xl">👤</Text>
                    <Text size="lg" fw={600}>
                        {isEditMode ? 'Edit Customer' : 'Add New Customer'}
                    </Text>
                </Group>
            }
            size="lg"
            centered
            closeOnClickOutside={false}
        >
            <LoadingOverlay visible={loading} />

            <Stack gap="md">
                {/* Error summary for contact validation */}
                {errors.contact && (
                    <Text c="red" size="sm" ta="center">
                        {errors.contact}
                    </Text>
                )}

                <SimpleGrid cols={2}>
                    {/* Name (Urdu) */}
                    <TextInput
                        label="Name (Urdu) - نام"
                        placeholder="Enter customer name in Urdu"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={errors.name}
                        dir="rtl"
                        styles={{ input: { textAlign: 'right' } }}
                    />

                    {/* Name (English) */}
                    <TextInput
                        label="Name (English)"
                        placeholder="Enter customer name in English"
                        value={formData.name_english}
                        onChange={(e) => handleChange('name_english', e.target.value)}
                    />
                </SimpleGrid>

                <SimpleGrid cols={2}>
                    {/* NIC */}
                    <TextInput
                        label="NIC #"
                        placeholder="XXXXX-XXXXXXX-X"
                        value={formData.nic}
                        onChange={(e) => handleNicChange(e.target.value)}
                        error={errors.nic}
                        maxLength={15}
                    />

                    {/* Mobile */}
                    <TextInput
                        label="Mobile #"
                        placeholder="Like: 03338988999"
                        value={formData.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value)}
                        error={errors.mobile}
                    />
                </SimpleGrid>

                <SimpleGrid cols={2}>
                    {/* Phone */}
                    <TextInput
                        label="Phone #"
                        placeholder="e.g., 051-1234567"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                    />

                    {/* Email */}
                    <TextInput
                        label="Email"
                        placeholder="customer@example.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={errors.email}
                    />
                </SimpleGrid>

                <SimpleGrid cols={2}>
                    {/* Country */}
                    <Select
                        label="Country"
                        placeholder="Select country"
                        data={countries}
                        value={formData.country_id}
                        onChange={(value) => handleChange('country_id', value)}
                        searchable
                        clearable
                    />

                    {/* City */}
                    <Select
                        label="City"
                        placeholder="Select city"
                        data={cities}
                        value={formData.city_id}
                        onChange={(value) => handleChange('city_id', value)}
                        searchable
                        clearable
                    />
                </SimpleGrid>

                {/* Address */}
                <Textarea
                    label="Address"
                    placeholder="Enter complete address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={3}
                />

                {/* Notes */}
                <Textarea
                    label="Notes"
                    placeholder="Additional notes (optional)"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={2}
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

CustomerForm.propTypes = {
    opened: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    customer: PropTypes.object,
    onSuccess: PropTypes.func,
};

export default CustomerForm;
