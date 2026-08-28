import {
  CommissionType,
  ExpenseRecord,
  FarmFinancialSummary,
  HarvestRecord,
  LabourRecord,
  SaleRecord,
} from '@/types';

/**
 * Pure, deterministic financial calculation engine with zero floating-point drift.
 * Handles rounding deterministically to 2 decimal places (or exact paise/minor units).
 */

export function roundToPaise(value: number): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatRupee(amount: number): string {
  const rounded = roundToPaise(amount);
  const isNegative = rounded < 0;
  const absAmount = Math.abs(rounded);
  
  // Indian numbering system formatting: 1,40,000.00
  const parts = absAmount.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
  const formatted = decimalPart === '00' ? formattedInteger : `${formattedInteger}.${decimalPart}`;
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function calculateLabourCost(
  workerCount: number,
  dailyWage: number,
  foodCostPerPerson: number = 0,
  transportCost: number = 0,
  advancePaid: number = 0
): {
  wageSubtotal: number;
  totalFoodCost: number;
  transportCost: number;
  totalCost: number;
  balancePayable: number;
} {
  const validWorkers = Math.max(0, Math.floor(workerCount || 0));
  const validWage = Math.max(0, dailyWage || 0);
  const validFood = Math.max(0, foodCostPerPerson || 0);
  const validTransport = Math.max(0, transportCost || 0);
  const validAdvance = Math.max(0, advancePaid || 0);

  const wageSubtotal = roundToPaise(validWorkers * validWage);
  const totalFoodCost = roundToPaise(validWorkers * validFood);
  const totalCost = roundToPaise(wageSubtotal + totalFoodCost + validTransport);
  const balancePayable = roundToPaise(Math.max(0, totalCost - validAdvance));

  return {
    wageSubtotal,
    totalFoodCost,
    transportCost: roundToPaise(validTransport),
    totalCost,
    balancePayable,
  };
}

export function calculateHarvestGross(boxes: number, pricePerBox: number): number {
  const validBoxes = Math.max(0, boxes || 0);
  const validPrice = Math.max(0, pricePerBox || 0);
  return roundToPaise(validBoxes * validPrice);
}

export function calculateCommission(
  grossAmount: number,
  boxes: number,
  commissionType: CommissionType,
  commissionRate: number
): number {
  const validGross = Math.max(0, grossAmount || 0);
  const validBoxes = Math.max(0, boxes || 0);
  const validRate = Math.max(0, commissionRate || 0);

  if (commissionType === 'percentage') {
    return roundToPaise((validGross * validRate) / 100);
  } else if (commissionType === 'per_box') {
    return roundToPaise(validBoxes * validRate);
  } else {
    // fixed
    return roundToPaise(validRate);
  }
}

export function calculateSaleDeductions(
  grossAmount: number,
  boxes: number,
  commissionType: CommissionType,
  commissionRate: number,
  transportCost: number = 0,
  otherDeductions: number = 0
): {
  commissionAmount: number;
  netAmount: number;
  amountPending: number;
} {
  const validGross = Math.max(0, grossAmount || 0);
  const validTransport = Math.max(0, transportCost || 0);
  const validOther = Math.max(0, otherDeductions || 0);

  const commissionAmount = calculateCommission(validGross, boxes, commissionType, commissionRate);
  const totalDeductions = roundToPaise(commissionAmount + validTransport + validOther);
  const netAmount = roundToPaise(Math.max(0, validGross - totalDeductions));

  return {
    commissionAmount,
    netAmount,
    amountPending: netAmount,
  };
}

export function calculateFinancialSummary(
  harvests: HarvestRecord[],
  sales: SaleRecord[],
  expenses: ExpenseRecord[],
  labourRecords: LabourRecord[]
): FarmFinancialSummary {
  // 1. Total Harvest Units
  let totalHarvestBoxes = 0;
  let totalHarvestKg = 0;
  for (const h of harvests) {
    totalHarvestBoxes += Number(h.boxes || 0);
    totalHarvestKg += Number(h.totalWeightKg || (h.boxes * (h.weightPerBoxKg || 20)) || 0);
  }

  // 2. Sales & Revenue
  let grossSales = 0;
  let totalCommissions = 0;
  let totalTransportSalesDeductions = 0;
  let totalOtherDeductions = 0;
  let totalRevenue = 0;
  let totalSoldBoxes = 0;
  let totalReceivables = 0;

  for (const s of sales) {
    grossSales += Number(s.grossAmount || 0);
    totalCommissions += Number(s.commissionAmount || 0);
    totalTransportSalesDeductions += Number(s.transportCost || 0);
    totalOtherDeductions += Number(s.otherDeductions || 0);
    totalRevenue += Number(s.netAmount || 0);
    totalSoldBoxes += Number(s.boxes || 0);
    totalReceivables += Number(s.amountPending || 0);
  }

  // 3. Direct Expenses (Seeds, fertilizers, diesel, etc.)
  let directExpenses = 0;
  let expensePayables = 0;

  for (const exp of expenses) {
    if (exp.category !== 'Labour') {
      directExpenses += Number(exp.amount || 0);
      if (exp.paymentStatus === 'pending') {
        expensePayables += Number(exp.balanceAmount ?? exp.amount);
      } else if (exp.paymentStatus === 'partial') {
        expensePayables += Number(exp.balanceAmount ?? Math.max(0, exp.amount - (exp.paidAmount || 0)));
      }
    }
  }

  // 4. Labour Records
  let totalLabourCost = 0;
  let totalFoodCost = 0;
  let totalLabourWorkersCount = 0;
  let labourPayables = 0;

  for (const l of labourRecords) {
    totalLabourCost += Number(l.totalCost || 0);
    totalFoodCost += Number(l.totalFoodCost || 0);
    totalLabourWorkersCount += Number(l.workerCount || 0);
    labourPayables += Number(l.balancePayable || 0);
  }

  // 5. Total Expenses
  const totalExpenses = roundToPaise(directExpenses + totalLabourCost);

  // 6. Net Profit or Loss
  const netProfitLoss = roundToPaise(totalRevenue - totalExpenses);
  const isProfit = netProfitLoss >= 0;

  // 7. Profit Margin
  const profitMarginPercent =
    totalRevenue > 0
      ? roundToPaise((netProfitLoss / totalRevenue) * 100)
      : 0;

  // 8. Unit Economics
  const averageSellingPricePerBox =
    totalSoldBoxes > 0 ? roundToPaise(grossSales / totalSoldBoxes) : 0;

  const costPerBox =
    totalHarvestBoxes > 0
      ? roundToPaise(totalExpenses / totalHarvestBoxes)
      : totalSoldBoxes > 0
      ? roundToPaise(totalExpenses / totalSoldBoxes)
      : 0;

  const costPerKg =
    totalHarvestKg > 0 ? roundToPaise(totalExpenses / totalHarvestKg) : 0;

  const revenuePerBox =
    totalSoldBoxes > 0 ? roundToPaise(totalRevenue / totalSoldBoxes) : 0;

  const totalPayables = roundToPaise(labourPayables + expensePayables);

  return {
    totalRevenue: roundToPaise(totalRevenue),
    totalExpenses: roundToPaise(totalExpenses),
    netProfitLoss,
    isProfit,
    profitMarginPercent,

    grossSales: roundToPaise(grossSales),
    totalCommissions: roundToPaise(totalCommissions),
    totalTransportSalesDeductions: roundToPaise(totalTransportSalesDeductions),
    totalOtherDeductions: roundToPaise(totalOtherDeductions),
    directExpenses: roundToPaise(directExpenses),
    totalLabourCost: roundToPaise(totalLabourCost),
    totalFoodCost: roundToPaise(totalFoodCost),

    totalReceivables: roundToPaise(totalReceivables),
    totalPayables,

    totalHarvestBoxes,
    totalHarvestKg: roundToPaise(totalHarvestKg),
    totalSoldBoxes,
    averageSellingPricePerBox,
    costPerBox,
    costPerKg,
    revenuePerBox,

    totalLabourWorkersCount,
    totalLabourEntries: labourRecords.length,
    totalHarvestBatches: harvests.length,
    totalSalesCount: sales.length,
  };
}
