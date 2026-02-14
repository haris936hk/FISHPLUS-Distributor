import { useState, useEffect, useCallback, useRef } from 'react';
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
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';

/**
 * SupplierForm Component
 * Modal form for creating and editing supplier records.
 * Implements FR-SUP-001 through FR-SUP-030.
 *
 * @param {boolean} opened - Whether the modal is open
 * @param {function} onClose - Close handler
 * @param {Object} supplier - Supplier data for edit mode (null for create)
 * @param {function} onSuccess - Callback after successful save
 */
function SupplierForm({ opened, onClose, supplier = null, onSuccess }) {
  const isEditMode = !!supplier;

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
    default_commission_pct: '5.0',
    notes: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [errors, setErrors] = useState({});

  // Track initial form data for dirty detection
  const initialFormData = useRef(null);

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
    if (supplier && opened) {
      const editData = {
        name: supplier.name || '',
        name_english: supplier.name_english || '',
        nic: supplier.nic || '',
        phone: supplier.phone || '',
        mobile: supplier.mobile || '',
        email: supplier.email || '',
        address: supplier.address || '',
        city_id: supplier.city_id ? String(supplier.city_id) : null,
        country_id: supplier.country_id ? String(supplier.country_id) : null,
        default_commission_pct: String(supplier.default_commission_pct || '5.0'),
        notes: supplier.notes || '',
      };
      setFormData(editData);
      initialFormData.current = editData;
      setErrors({});
    } else if (opened && !supplier) {
      // New form — snapshot the default state
      initialFormData.current = { ...formData };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier, opened]);

  // Handle input change
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  // Format NIC as user types (XXXXX-XXXXXXX-X)
  const handleNicChange = useCallback(
    (value) => {
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
    },
    [handleChange]
  );

  // Validate form
  const validate = useCallback(() => {
    const newErrors = {};

    // Required: Name (Urdu)
    if (!formData.name.trim()) {
      newErrors.name = 'نام ضروری ہے (Name is required)';
    }

    // NIC format validation (if provided)
    if (formData.nic && !/^\d{5}-\d{7}-\d{1}$/.test(formData.nic)) {
      newErrors.nic = 'Invalid NIC format. Use: XXXXX-XXXXXXX-X';
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
      default_commission_pct: '5.0',
      notes: '',
    });
    setErrors({});
  }, []);

  // Check if form has unsaved changes
  const isDirty = useCallback(() => {
    if (!initialFormData.current) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialFormData.current);
  }, [formData]);

  // Handle close with unsaved changes check
  const handleClose = useCallback(() => {
    if (isDirty()) {
      modals.openConfirmModal({
        title: 'Unsaved Changes',
        children: (
          <Text size="sm">
            You have unsaved changes. Are you sure you want to close? All changes will be lost.
          </Text>
        ),
        labels: { confirm: 'Discard', cancel: 'Keep Editing' },
        confirmProps: { color: 'red' },
        onConfirm: () => {
          handleClear();
          onClose();
        },
      });
    } else {
      handleClear();
      onClose();
    }
  }, [isDirty, handleClear, onClose]);

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
        default_commission_pct: parseFloat(formData.default_commission_pct) || 5.0,
      };

      let result;
      if (isEditMode) {
        result = await window.api.suppliers.update(supplier.id, dataToSubmit);
      } else {
        result = await window.api.suppliers.create(dataToSubmit);
      }

      if (result.success) {
        notifications.show({
          title: isEditMode ? 'Supplier Updated' : 'Supplier Created',
          message: `Supplier "${formData.name}" has been ${isEditMode ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        handleClear();
        onSuccess?.();
        onClose();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to save supplier',
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
  }, [formData, isEditMode, supplier, validate, handleClear, onSuccess, onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <Text size="xl">👤</Text>
          <Text size="lg" fw={600}>
            {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
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
          {/* Name (Urdu) - Required */}
          <TextInput
            label="Name (Urdu) - نام"
            placeholder="Enter supplier name in Urdu"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
            dir="rtl"
            styles={{ input: { textAlign: 'right' } }}
          />

          {/* Name (English) */}
          <TextInput
            label="Name (English)"
            placeholder="Enter supplier name in English"
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

          {/* Phone */}
          <TextInput
            label="Phone #"
            placeholder="e.g., 051-1234567"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </SimpleGrid>

        <SimpleGrid cols={2}>
          {/* Mobile */}
          <TextInput
            label="Mobile #"
            placeholder="e.g., 03001234567"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
          />

          {/* Email */}
          <TextInput
            label="Email"
            placeholder="supplier@example.com"
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

SupplierForm.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  supplier: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default SupplierForm;
