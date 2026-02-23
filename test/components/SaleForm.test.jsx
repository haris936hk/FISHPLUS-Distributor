import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import SaleForm from '../../src/renderer/components/SaleForm';

// ──────────────────────────────────────────────
// Global browser stubs required by Mantine
// ──────────────────────────────────────────────
class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
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
  customers: {
    getAll: vi.fn().mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: 'Customer One', name_english: 'Cust 1' },
        { id: 2, name: 'Customer Two', name_english: 'Cust 2' },
      ],
    }),
  },
  suppliers: {
    getAll: vi.fn().mockResolvedValue({
      success: true,
      data: [{ id: 1, name: 'Supplier One', name_english: 'Sup 1' }],
    }),
  },
  items: {
    getAll: vi.fn().mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: 'Rohu', name_english: 'Rohu', current_stock: 200 },
        { id: 2, name: 'Catla', name_english: 'Catla', current_stock: 0 },
      ],
    }),
  },
  sales: {
    getNextNumber: vi.fn().mockResolvedValue({ success: true, data: 'SL-000001' }),
    create: vi.fn().mockResolvedValue({ success: true, data: { saleNumber: 'SL-000001' } }),
  },
  print: {
    preview: vi.fn(),
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

describe('SaleForm Component', () => {
  const defaultProps = {
    editSale: null,
    onSaved: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────
  it('renders New Sale title in create mode', () => {
    renderWithMantine(<SaleForm {...defaultProps} />);
    expect(screen.getByText(/New Sale/i)).toBeInTheDocument();
  });

  it('renders Edit Sale title when editSale is provided', () => {
    const editSale = {
      id: 1,
      sale_number: 'SL-000001',
      sale_date: '2026-02-06',
      customer_id: 1,
      items: [],
    };
    renderWithMantine(<SaleForm {...defaultProps} editSale={editSale} />);
    expect(screen.getByText(/Edit Sale/i)).toBeInTheDocument();
  });

  it('renders the Save Sale button', () => {
    renderWithMantine(<SaleForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Save Sale/i })).toBeInTheDocument();
  });

  it('renders the Update Sale button in edit mode', () => {
    renderWithMantine(
      <SaleForm
        {...defaultProps}
        editSale={{
          id: 1,
          sale_number: 'SL-000001',
          sale_date: '2026-02-06',
          customer_id: 1,
          items: [],
        }}
      />
    );
    expect(screen.getByRole('button', { name: /Update Sale/i })).toBeInTheDocument();
  });

  // ── Cancel ─────────────────────────────────
  it('calls onCancel when Cancel button is clicked', () => {
    renderWithMantine(<SaleForm {...defaultProps} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  // ── Summary totals (initial state) ─────────
  it('shows zero balance when no items have been entered', () => {
    // Requirement: a new sale form with no line item data must show Balance: Rs. 0.00
    // The summary section renders multiple Rs. x.xx values; we find the balance row by
    // its label and assert its sibling text — this is a behaviour check, not an
    // implementation detail.
    renderWithMantine(<SaleForm {...defaultProps} />);
    // Balance label is bilingual → its containing group holds the value
    const balanceLabel = screen.getByText(/Balance Due/i);
    const balanceGroup = balanceLabel.closest('div');
    expect(balanceGroup.parentElement).toHaveTextContent('Rs. 0.00');
  });
});
