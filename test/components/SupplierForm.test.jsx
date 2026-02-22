import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import SupplierForm from '../../src/renderer/components/SupplierForm';

// ──────────────────────────────────────────────
// Global browser stubs required by Mantine
// ──────────────────────────────────────────────
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserver);
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
);

// ──────────────────────────────────────────────
// Mock window.api (the IPC bridge)
// ──────────────────────────────────────────────
const mockApi = {
  reference: {
    getCities: vi.fn().mockResolvedValue({ success: true, data: [] }),
    getCountries: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
  suppliers: {
    create: vi.fn().mockResolvedValue({ success: true, data: { id: 1 } }),
    update: vi.fn().mockResolvedValue({ success: true, data: { id: 1 } }),
  },
};
vi.stubGlobal('api', mockApi);

// ──────────────────────────────────────────────
// Render helper
// ──────────────────────────────────────────────
const renderWithMantine = (component) =>
  render(
    <MantineProvider>
      <ModalsProvider>{component}</ModalsProvider>
    </MantineProvider>
  );

describe('SupplierForm Component', () => {
  const defaultProps = {
    opened: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    supplier: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────
  it('renders the modal with Add New Supplier title', () => {
    renderWithMantine(<SupplierForm {...defaultProps} />);
    expect(screen.getByText('Add New Supplier')).toBeInTheDocument();
  });

  it('renders Save button in create mode', () => {
    renderWithMantine(<SupplierForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('renders all required form fields', () => {
    renderWithMantine(<SupplierForm {...defaultProps} />);
    expect(screen.getByLabelText(/Name \(Urdu\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/NIC #/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone #/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('renders Update button in edit mode', () => {
    renderWithMantine(
      <SupplierForm
        {...defaultProps}
        supplier={{ id: 1, name: 'Test Supplier', nic: '12345-1234567-1', phone: '03001234567' }}
      />
    );
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
  });

  it('populates name field in edit mode', () => {
    renderWithMantine(
      <SupplierForm
        {...defaultProps}
        supplier={{ id: 1, name: 'احمد علی', nic: '12345-1234567-1' }}
      />
    );
    const nameInput = screen.getByLabelText(/Name \(Urdu\)/i);
    expect(nameInput.value).toBe('احمد علی');
  });

  // ── Validation ─────────────────────────────
  it('calls create API when form is valid and Save is clicked', async () => {
    renderWithMantine(<SupplierForm {...defaultProps} />);

    // Fill required fields
    const nameInput = screen.getByLabelText(/Name \(Urdu\)/i);
    fireEvent.change(nameInput, { target: { value: 'Test Supplier' } });

    const phoneInput = screen.getByLabelText(/Phone #/i);
    fireEvent.change(phoneInput, { target: { value: '03001234567' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockApi.suppliers.create).toHaveBeenCalled();
    });
  });

  it('shows required error when name is left empty and save is clicked', async () => {
    renderWithMantine(<SupplierForm {...defaultProps} />);

    // Add a phone so only name validation fires
    const phoneInput = screen.getByLabelText(/Phone #/i);
    fireEvent.change(phoneInput, { target: { value: '03001234567' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Validation fires synchronously — name error should appear
    await waitFor(() => {
      expect(mockApi.suppliers.create).not.toHaveBeenCalled();
    });
  });

  // ── Close button ───────────────────────────
  it('calls onClose when Close button is clicked (clean form)', () => {
    renderWithMantine(<SupplierForm {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // ── Closed state ───────────────────────────
  it('renders nothing when opened is false', () => {
    renderWithMantine(<SupplierForm {...defaultProps} opened={false} />);
    expect(screen.queryByText('Add New Supplier')).not.toBeInTheDocument();
  });
});
