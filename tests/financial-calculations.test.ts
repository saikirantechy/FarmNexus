import { describe, it, expect } from 'vitest';
import {
  calculateCommission,
  calculateFinancialSummary,
  calculateHarvestGross,
  calculateLabourCost,
  calculateSaleDeductions,
  formatRupee,
  roundToPaise,
} from '../src/lib/calculations';
import { ExpenseRecord, HarvestRecord, LabourRecord, SaleRecord } from '../src/types';

describe('Financial Calculation Engine - Exact Rules', () => {
  it('correctly calculates harvest batches and upcoming sales totals', () => {
    // Example 1: 68 boxes × ₹270 = ₹18,360
    expect(calculateHarvestGross(68, 270)).toBe(18360);

    // Example 2: 110 boxes × ₹70 = ₹7,700
    expect(calculateHarvestGross(110, 70)).toBe(7700);

    // Example 3: 50 boxes × ₹90 = ₹4,500
    expect(calculateHarvestGross(50, 90)).toBe(4500);

    // Example 4: 80 boxes × ₹50 = ₹4,000
    expect(calculateHarvestGross(80, 50)).toBe(4000);

    // Total upcoming: 308 boxes = ₹34,560
    const totalBoxes = 68 + 110 + 50 + 80;
    const totalAmount =
      calculateHarvestGross(68, 270) +
      calculateHarvestGross(110, 70) +
      calculateHarvestGross(50, 90) +
      calculateHarvestGross(80, 50);

    expect(totalBoxes).toBe(308);
    expect(totalAmount).toBe(34560);
  });

  it('correctly calculates commission (percentage, per-box, and fixed)', () => {
    // Sale amount: ₹1,40,000, Commission: 10% -> ₹14,000, Net: ₹1,26,000
    const grossAmount = 140000;
    const comm10Percent = calculateCommission(grossAmount, 1000, 'percentage', 10);
    expect(comm10Percent).toBe(14000);

    const deductionResult = calculateSaleDeductions(grossAmount, 1000, 'percentage', 10, 0, 0);
    expect(deductionResult.commissionAmount).toBe(14000);
    expect(deductionResult.netAmount).toBe(126000);

    // 1,600 boxes × ₹10 = ₹16,000 per-box commission
    const commPerBox = calculateCommission(200000, 1600, 'per_box', 10);
    expect(commPerBox).toBe(16000);

    // Fixed commission: ₹2,500
    const commFixed = calculateCommission(100000, 500, 'fixed', 2500);
    expect(commFixed).toBe(2500);
  });

  it('correctly calculates labour and food expenses', () => {
    // 62 workers × ₹500 = ₹31,000
    const labour1 = calculateLabourCost(62, 500);
    expect(labour1.wageSubtotal).toBe(31000);
    expect(labour1.totalCost).toBe(31000);

    // 100 workers × ₹350 = ₹35,000
    const labour2 = calculateLabourCost(100, 350);
    expect(labour2.wageSubtotal).toBe(35000);
    expect(labour2.totalCost).toBe(35000);

    // Total labour wage: ₹31,000 + ₹35,000 = ₹66,000
    expect(labour1.wageSubtotal + labour2.wageSubtotal).toBe(66000);

    // Food expense: 162 × ₹50 = ₹8,100
    const labourWithFood = calculateLabourCost(162, 0, 50);
    expect(labourWithFood.totalFoodCost).toBe(8100);
  });

  it('correctly calculates comprehensive P&L summary and unit economics', () => {
    const mockHarvests: HarvestRecord[] = [
      {
        id: 'h1',
        farmId: 'f1',
        cropCycleId: 'c1',
        date: '2026-08-01',
        boxes: 1000,
        weightPerBoxKg: 20,
        totalWeightKg: 20000,
        unit: 'box',
        grade: 'A',
        createdAt: '2026-08-01',
      },
      {
        id: 'h2',
        farmId: 'f1',
        cropCycleId: 'c1',
        date: '2026-08-05',
        boxes: 542,
        weightPerBoxKg: 20,
        totalWeightKg: 10840,
        unit: 'box',
        grade: 'A',
        createdAt: '2026-08-05',
      },
    ];

    const mockSales: SaleRecord[] = [
      {
        id: 's1',
        farmId: 'f1',
        cropCycleId: 'c1',
        saleDate: '2026-08-05',
        boxes: 1000,
        unit: 'box',
        pricePerUnit: 140,
        grossAmount: 140000,
        buyerName: 'Kolar Mandi Trader',
        marketName: 'APMC Kolar',
        commissionType: 'percentage',
        commissionRate: 10,
        commissionAmount: 14000,
        transportCost: 0,
        otherDeductions: 0,
        netAmount: 140000, // Direct revenue test case
        amountReceived: 140000,
        amountPending: 0,
        paymentStatus: 'paid',
        createdAt: '2026-08-05',
      },
    ];

    const mockExpenses: ExpenseRecord[] = [
      {
        id: 'e1',
        farmId: 'f1',
        cropCycleId: 'c1',
        date: '2026-07-10',
        amount: 25000,
        category: 'Fertilizer',
        paymentStatus: 'paid',
        createdAt: '2026-07-10',
      },
      {
        id: 'e2',
        farmId: 'f1',
        cropCycleId: 'c1',
        date: '2026-07-15',
        amount: 15000,
        category: 'Pesticides',
        paymentStatus: 'paid',
        createdAt: '2026-07-15',
      },
      {
        id: 'e3',
        farmId: 'f1',
        cropCycleId: 'c1',
        date: '2026-07-20',
        amount: 19000,
        category: 'Diesel',
        paymentStatus: 'paid',
        createdAt: '2026-07-20',
      },
    ]; // Total direct expenses = 59,000

    const mockLabour: LabourRecord[] = [];

    const summary = calculateFinancialSummary(mockHarvests, mockSales, mockExpenses, mockLabour);

    // Revenue: ₹1,40,000, Expenses: ₹59,000 -> Net Profit = ₹81,000
    expect(summary.totalRevenue).toBe(140000);
    expect(summary.totalExpenses).toBe(59000);
    expect(summary.netProfitLoss).toBe(81000);
    expect(summary.isProfit).toBe(true);
    expect(summary.totalHarvestBoxes).toBe(1542);
  });

  it('correctly formats Indian Rupee numbers', () => {
    expect(formatRupee(140000)).toBe('₹1,40,000');
    expect(formatRupee(81000)).toBe('₹81,000');
    expect(formatRupee(18360)).toBe('₹18,360');
    expect(formatRupee(0)).toBe('₹0');
    expect(formatRupee(-5000)).toBe('-₹5,000');
  });
});
