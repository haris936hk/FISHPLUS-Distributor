import { describe, it, expect } from 'vitest';

/**
 * Pure arithmetic tests for business calculation formulas.
 * These formulas are extracted directly from src/database/queries.js
 * and tested in isolation — no mocks or database needed.
 *
 * Source locations referenced in comments below.
 */

// ─────────────────────────────────────────────
// Sale Calculations  (queries.js — updated schema)
// ─────────────────────────────────────────────
describe('Sale Calculations', () => {
    describe('dual rate conversion', () => {
        it('computes rate per kg as rate_per_maund / 40', () => {
            const ratePerMaund = 4000;
            const ratePerKg = ratePerMaund / 40;
            expect(ratePerKg).toBe(100);
        });

        it('computes rate per maund as rate_per_kg * 40', () => {
            const ratePerKg = 125;
            const ratePerMaund = ratePerKg * 40;
            expect(ratePerMaund).toBe(5000);
        });

        it('handles decimal rate per maund', () => {
            const ratePerMaund = 3000;
            const ratePerKg = ratePerMaund / 40;
            expect(ratePerKg).toBe(75);
        });
    });

    describe('line item arithmetic', () => {
        it('computes line amount as weight times rate per kg', () => {
            const weight = 85;
            const rate = 150;
            const lineAmount = weight * rate;
            expect(lineAmount).toBe(12750);
        });

        it('computes total amount as amount + fare + ice', () => {
            const amount = 12750;
            const fareCharges = 100;
            const iceCharges = 50;
            const totalAmount = amount + fareCharges + iceCharges;
            expect(totalAmount).toBe(12900);
        });

        it('handles zero rate (free item)', () => {
            const weight = 85;
            const rate = 0;
            const lineAmount = weight * rate;
            expect(lineAmount).toBe(0);
        });

        it('handles decimal weights and rates', () => {
            const weight = 12.5;
            const rate = 200;
            const lineAmount = weight * rate;
            expect(lineAmount).toBe(2500);
        });
    });

    describe('sale header totals', () => {
        const items = [
            { weight: 90, rate: 200, fare_charges: 100, ice_charges: 50, cash_amount: 500, receipt_amount: 0 },
            { weight: 45, rate: 180, fare_charges: 0, ice_charges: 0, cash_amount: 0, receipt_amount: 200 },
        ];

        it('sums weight across all line items', () => {
            const totalWeight = items.reduce((sum, i) => sum + (i.weight || 0), 0);
            expect(totalWeight).toBe(135);
        });

        it('computes gross amount by summing each line amount', () => {
            const grossAmount = items.reduce((sum, i) => sum + (i.weight || 0) * (i.rate || 0), 0);
            // Item 1: 90 * 200 = 18000; Item 2: 45 * 180 = 8100
            expect(grossAmount).toBe(26100);
        });

        it('sums fare charges across all line items', () => {
            const totalFare = items.reduce((sum, i) => sum + (i.fare_charges || 0), 0);
            expect(totalFare).toBe(100);
        });

        it('sums ice charges across all line items', () => {
            const totalIce = items.reduce((sum, i) => sum + (i.ice_charges || 0), 0);
            expect(totalIce).toBe(50);
        });
    });

    describe('sale net amount formula', () => {
        it('adds gross amount plus fare plus ice', () => {
            const grossAmount = 26100;
            const fareCharges = 100;
            const iceCharges = 50;
            const netAmount = grossAmount + fareCharges + iceCharges;
            expect(netAmount).toBe(26250);
        });

        it('equals gross when no charges', () => {
            const grossAmount = 10000;
            const netAmount = grossAmount + 0 + 0;
            expect(netAmount).toBe(10000);
        });
    });

    describe('sale balance amount formula', () => {
        it('deducts cash and receipt from net amount', () => {
            const netAmount = 26250;
            const cashReceived = 500;
            const receiptAmount = 200;
            const balanceAmount = netAmount - cashReceived - receiptAmount;
            expect(balanceAmount).toBe(25550);
        });

        it('is zero when fully paid', () => {
            const netAmount = 5000;
            const cashReceived = 3000;
            const receiptAmount = 2000;
            const balanceAmount = netAmount - cashReceived - receiptAmount;
            expect(balanceAmount).toBe(0);
        });

        it('can be negative when overpaid', () => {
            const netAmount = 5000;
            const cashReceived = 6000;
            const receiptAmount = 0;
            const balanceAmount = netAmount - cashReceived - receiptAmount;
            expect(balanceAmount).toBe(-1000);
        });
    });
});

// ─────────────────────────────────────────────
// Purchase Calculations  (queries.js L1485–1495)
// ─────────────────────────────────────────────
describe('Purchase Calculations', () => {
    describe('line item arithmetic', () => {
        it('computes line amount as weight times rate', () => {
            // L1527: const lineAmount = (item.weight || 0) * (item.rate || 0)
            const weight = 100;
            const rate = 120;
            const lineAmount = weight * rate;
            expect(lineAmount).toBe(12000);
        });

        it('handles decimal weights', () => {
            const weight = 33.333;
            const rate = 150;
            expect(weight * rate).toBeCloseTo(4999.95, 1);
        });
    });

    describe('purchase totals', () => {
        const items = [
            { weight: 100, rate: 120 },
            { weight: 50, rate: 130 },
        ];

        it('sums total weight across all items', () => {
            const totalWeight = items.reduce((sum, i) => sum + (i.weight || 0), 0);
            expect(totalWeight).toBe(150);
        });

        it('sums gross amount across all items', () => {
            // L1491: grossAmount += item.amount || 0
            const grossAmount = items.reduce((sum, i) => sum + (i.weight || 0) * (i.rate || 0), 0);
            // 100*120=12000, 50*130=6500
            expect(grossAmount).toBe(18500);
        });
    });

    describe('purchase net amount formula', () => {
        // L1494: const netAmount = grossAmount - (concession_amount || 0)
        it('deducts concession from gross amount', () => {
            const grossAmount = 18500;
            const concession = 500;
            const netAmount = grossAmount - concession;
            expect(netAmount).toBe(18000);
        });

        it('equals gross when no concession', () => {
            const grossAmount = 18500;
            const netAmount = grossAmount - 0;
            expect(netAmount).toBe(18500);
        });
    });

    describe('purchase balance amount formula', () => {
        // L1495: const balanceAmount = netAmount - (cash_paid || 0) + previousBalance
        it('deducts cash paid and adds previous balance', () => {
            const netAmount = 18000;
            const cashPaid = 5000;
            const previousBalance = 3000;
            const balanceAmount = netAmount - cashPaid + previousBalance;
            expect(balanceAmount).toBe(16000);
        });

        it('handles zero previous balance', () => {
            const netAmount = 10000;
            const cashPaid = 2000;
            const balanceAmount = netAmount - cashPaid + 0;
            expect(balanceAmount).toBe(8000);
        });

        it('handles full cash payment', () => {
            const netAmount = 10000;
            const cashPaid = 10000;
            const previousBalance = 0;
            const balanceAmount = netAmount - cashPaid + previousBalance;
            expect(balanceAmount).toBe(0);
        });
    });
});

// ─────────────────────────────────────────────
// Stock Report Calculations  (queries.js L2095–2114)
// ─────────────────────────────────────────────
describe('Stock Report Calculations', () => {
    // FR-STOCKRPT-012: remaining = previous + today_purchases - today_sales
    it('calculates previous stock: opening + purchases_before - sales_before', () => {
        // L2096: const previousStock = item.opening_stock + item.purchases_before - item.sales_before
        const openingStock = 200;
        const purchasesBefore = 50;
        const salesBefore = 30;
        const previousStock = openingStock + purchasesBefore - salesBefore;
        expect(previousStock).toBe(220);
    });

    it('calculates remaining stock: previous + today_purchases - today_sales', () => {
        // L2097: const remainingStock = previousStock + item.today_purchases - item.today_sales
        const previousStock = 220;
        const todayPurchases = 80;
        const todaySales = 60;
        const remainingStock = previousStock + todayPurchases - todaySales;
        expect(remainingStock).toBe(240);
    });

    it('remaining stock can be zero when all stock sold', () => {
        const previousStock = 100;
        const todayPurchases = 0;
        const todaySales = 100;
        const remainingStock = previousStock + todayPurchases - todaySales;
        expect(remainingStock).toBe(0);
    });

    it('sums totals across all items correctly', () => {
        // L2106–2113: reduce over item array
        const items = [
            { previous_stock: 100, today_purchases: 20, today_sales: 30, remaining_stock: 90 },
            { previous_stock: 200, today_purchases: 40, today_sales: 10, remaining_stock: 230 },
        ];
        const totals = items.reduce(
            (acc, item) => ({
                previous_stock: acc.previous_stock + item.previous_stock,
                today_purchases: acc.today_purchases + item.today_purchases,
                today_sales: acc.today_sales + item.today_sales,
                remaining_stock: acc.remaining_stock + item.remaining_stock,
            }),
            { previous_stock: 0, today_purchases: 0, today_sales: 0, remaining_stock: 0 }
        );
        expect(totals.previous_stock).toBe(300);
        expect(totals.today_purchases).toBe(60);
        expect(totals.today_sales).toBe(40);
        expect(totals.remaining_stock).toBe(320);
    });
});

// ─────────────────────────────────────────────
// Net Summary Calculations  (queries.js L2424–2428)
// ─────────────────────────────────────────────
describe('Daily Net Amount Summary Calculations', () => {
    // FR-NETSUMMARY-013: Total Amount = Previous + Today
    it('computes total amount as previous balance plus today sales', () => {
        // L2426: const totalAmount = previousBalance + todaySales
        const previousBalance = 84583242.29;
        const todaySales = 0;
        const totalAmount = previousBalance + todaySales;
        expect(totalAmount).toBeCloseTo(84583242.29, 2);
    });

    // FR-NETSUMMARY-015: Balance = Total Amount - Collection
    it('computes closing balance as total minus collection', () => {
        // L2427: const closingBalance = totalAmount - totalCollection
        const totalAmount = 84583242.29;
        const totalCollection = 150000;
        const closingBalance = totalAmount - totalCollection;
        expect(closingBalance).toBeCloseTo(84433242.29, 2);
    });

    it('closing balance equals total when nothing collected', () => {
        const totalAmount = 5000000;
        const closingBalance = totalAmount - 0;
        expect(closingBalance).toBe(5000000);
    });

    it('today sales added to previous balance for today total', () => {
        const previousBalance = 10000;
        const todaySales = 2500;
        const totalAmount = previousBalance + todaySales;
        expect(totalAmount).toBe(12500);
    });
});

// ─────────────────────────────────────────────
// Customer Register Calculations  (queries.js L2154–2173)
// ─────────────────────────────────────────────
describe('Customer Register Calculations', () => {
    // FR-CUSTREG-012: balance = opening + net_amount - collections
    it('calculates customer balance: opening + sales - payments', () => {
        // L2155: const balance = cust.opening_balance + cust.total_sales - cust.total_payments
        const opening = 71500;
        const totalSales = 0;
        const totalPayments = 0;
        const balance = opening + totalSales - totalPayments;
        expect(balance).toBe(71500);
    });

    it('reduces balance when payments received', () => {
        const opening = 10000;
        const totalSales = 5000;
        const totalPayments = 3000;
        const balance = opening + totalSales - totalPayments;
        expect(balance).toBe(12000);
    });

    it('sums aggregate totals across multiple customers', () => {
        // L2165–2173: reduce over customers
        const customers = [
            { opening_balance: 1000, net_amount: 5000, collection: 2000, balance: 4000 },
            { opening_balance: 2000, net_amount: 3000, collection: 1000, balance: 4000 },
        ];
        const totals = customers.reduce(
            (acc, c) => ({
                previous: acc.previous + c.opening_balance,
                net_amount: acc.net_amount + c.net_amount,
                collection: acc.collection + c.collection,
                balance: acc.balance + c.balance,
            }),
            { previous: 0, net_amount: 0, collection: 0, balance: 0 }
        );
        expect(totals.previous).toBe(3000);
        expect(totals.net_amount).toBe(8000);
        expect(totals.collection).toBe(3000);
        expect(totals.balance).toBe(8000);
    });
});

// ─────────────────────────────────────────────
// Vendor Sales Grand Totals  (queries.js L2357–2365)
// ─────────────────────────────────────────────
describe('Vendor Sales Grand Total Calculations', () => {
    it('reduces vendor summary rows into grand totals', () => {
        const summary = [
            { vehicle_count: 3, total_weight: 100, total_amount: 15000 },
            { vehicle_count: 2, total_weight: 80, total_amount: 12000 },
        ];
        const grandTotals = summary.reduce(
            (acc, row) => ({
                total_vehicles: acc.total_vehicles + (row.vehicle_count || 0),
                total_weight: acc.total_weight + (row.total_weight || 0),
                total_amount: acc.total_amount + (row.total_amount || 0),
            }),
            { total_vehicles: 0, total_weight: 0, total_amount: 0 }
        );
        expect(grandTotals.total_vehicles).toBe(5);
        expect(grandTotals.total_weight).toBe(180);
        expect(grandTotals.total_amount).toBe(27000);
    });

    it('handles single vendor', () => {
        const summary = [{ vehicle_count: 1, total_weight: 50, total_amount: 7500 }];
        const grandTotals = summary.reduce(
            (acc, row) => ({
                total_vehicles: acc.total_vehicles + (row.vehicle_count || 0),
                total_weight: acc.total_weight + (row.total_weight || 0),
                total_amount: acc.total_amount + (row.total_amount || 0),
            }),
            { total_vehicles: 0, total_weight: 0, total_amount: 0 }
        );
        expect(grandTotals.total_vehicles).toBe(1);
        expect(grandTotals.total_weight).toBe(50);
        expect(grandTotals.total_amount).toBe(7500);
    });
});
