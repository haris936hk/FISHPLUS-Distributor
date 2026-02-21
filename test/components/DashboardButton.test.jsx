import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import DashboardButton from '../../src/renderer/components/DashboardButton';

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
// Render helper
// ──────────────────────────────────────────────
const renderWithMantine = (component) =>
    render(<MantineProvider>{component}</MantineProvider>);

describe('DashboardButton Component', () => {
    it('renders the button with the given label', () => {
        renderWithMantine(<DashboardButton label="Suppliers" icon="🏪" onClick={vi.fn()} />);
        expect(screen.getByText('Suppliers')).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', () => {
        const handleClick = vi.fn();
        renderWithMantine(<DashboardButton label="Sales" icon="💰" onClick={handleClick} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders multiple buttons without label interference', () => {
        renderWithMantine(
            <div>
                <DashboardButton label="Sales" icon="💰" onClick={vi.fn()} />
                <DashboardButton label="Purchases" icon="🛒" onClick={vi.fn()} />
            </div>
        );
        expect(screen.getByText('Sales')).toBeInTheDocument();
        expect(screen.getByText('Purchases')).toBeInTheDocument();
    });

    it('does not call onClick when disabled', () => {
        const handleClick = vi.fn();
        renderWithMantine(
            <DashboardButton label="Reports" icon="📊" onClick={handleClick} disabled={true} />
        );
        const button = screen.getByRole('button');
        fireEvent.click(button);
        // Mantine UnstyledButton with disabled=true does not invoke onClick
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders with transaction variant without crashing', () => {
        renderWithMantine(
            <DashboardButton label="Sales" icon="💰" onClick={vi.fn()} variant="transaction" />
        );
        expect(screen.getByText('Sales')).toBeInTheDocument();
    });

    it('renders with report variant without crashing', () => {
        renderWithMantine(
            <DashboardButton label="Reports" icon="📊" onClick={vi.fn()} variant="report" />
        );
        expect(screen.getByText('Reports')).toBeInTheDocument();
    });
});
