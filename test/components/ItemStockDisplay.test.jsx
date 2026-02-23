import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import ItemStockDisplay from '../../src/renderer/components/ItemStockDisplay';

// Mock MantineProvider to wrap components
const renderWithMantine = (component) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

// Mock the ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserver);

// Mock window.matchMedia
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
);

describe('ItemStockDisplay Component', () => {
  const mockData = [
    { id: 1, name: 'Item 1', name_english: 'English 1', current_stock: 50 },
    { id: 2, name: 'Item 2', name_english: 'English 2', current_stock: 5 },
    { id: 3, name: 'Item 3', name_english: 'English 3', current_stock: 0 },
  ];

  it('renders loading state correctly', () => {
    const { container } = renderWithMantine(<ItemStockDisplay loading={true} />);
    // Mantine v7 loader uses styled spans/divs usually, let's check for the loader class
    // or just verify that the table/empty text is NOT there
    expect(screen.queryByText('item.noResults')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    // Check for loader by class
    const loader = container.querySelector('.mantine-Loader-root');
    expect(loader).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    renderWithMantine(<ItemStockDisplay data={[]} />);
    expect(screen.getByText('item.noResults')).toBeInTheDocument();
  });

  it('renders items with correct stock levels', () => {
    renderWithMantine(<ItemStockDisplay data={mockData} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();

    // Check quantity formatting
    expect(screen.getByText('50.00')).toBeInTheDocument();
    expect(screen.getByText('5.00')).toBeInTheDocument();
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });
});
