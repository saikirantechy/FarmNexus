export type LanguageCode = 'en' | 'hi' | 'kn' | 'mr' | 'te' | 'ta';

export type CropStage = 'Planned' | 'Growing' | 'Flowering' | 'Fruiting' | 'Harvesting' | 'Completed';

export type UnitType = 'box' | 'kg' | 'quintal' | 'ton' | 'piece';

export type CommissionType = 'percentage' | 'per_box' | 'fixed';

export type PaymentStatus = 'paid' | 'pending' | 'partial';

export type InventoryCategory =
  | 'Seeds'
  | 'Fertilizer'
  | 'Pesticide'
  | 'Fungicide'
  | 'Organic input'
  | 'Packaging'
  | 'Fuel'
  | 'Other';

export type InventoryUnit = 'kg' | 'g' | 'litre' | 'ml' | 'piece' | 'bag' | 'packet';

export type ExpenseCategory =
  | 'Seeds'
  | 'Seedlings'
  | 'Fertilizer'
  | 'Pesticides'
  | 'Fungicides'
  | 'Organic inputs'
  | 'Labour'
  | 'Food'
  | 'Irrigation'
  | 'Electricity'
  | 'Diesel'
  | 'Machinery'
  | 'Equipment'
  | 'Transport'
  | 'Packaging'
  | 'Market fees'
  | 'Commission'
  | 'Land preparation'
  | 'Rent'
  | 'Repairs'
  | 'Other';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  language: LanguageCode;
  state: string;
  district: string;
  village: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface FarmField {
  id: string;
  farmId: string;
  name: string;
  areaAcres: number;
  soilType?: string;
  irrigationType?: string;
}

export interface Farm {
  id: string;
  userId: string;
  name: string;
  village: string;
  district: string;
  state: string;
  totalAcreage: number;
  irrigationType: 'Drip' | 'Sprinkler' | 'Flood' | 'Rainfed' | 'Borewell';
  soilType: 'Red Loam' | 'Black Cotton' | 'Sandy' | 'Clay' | 'Alluvial';
  notes?: string;
  fields: FarmField[];
  createdAt: string;
}

export interface CropCycle {
  id: string;
  farmId: string;
  fieldId: string;
  cropName: string; // e.g. 'Tomato', 'Onion', 'Chilli', etc.
  variety: string;
  areaAcres: number;
  plantingDate: string;
  transplantingDate?: string;
  expectedHarvestDate?: string;
  stage: CropStage;
  expectedYieldBoxes?: number;
  expectedYieldKg?: number;
  status: 'active' | 'completed' | 'archived';
  notes?: string;
  createdAt: string;
}

export interface LabourRecord {
  id: string;
  farmId: string;
  cropCycleId: string;
  date: string;
  workerCount: number;
  maleCount?: number;
  femaleCount?: number;
  dailyWage: number;
  workDescription: string;
  hoursWorked?: number;
  foodCostPerPerson?: number;
  totalFoodCost?: number;
  transportCost?: number;
  advancePaid?: number;
  balancePayable?: number;
  totalCost: number; // (workerCount * dailyWage) + (foodCost) + (transport)
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  farmId: string;
  cropCycleId: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  vendor?: string;
  paymentStatus: PaymentStatus;
  paidAmount?: number;
  balanceAmount?: number;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  farmId: string;
  name: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  currentQuantity: number;
  lowStockThreshold: number;
  supplier?: string;
  createdAt: string;
}

export interface InventoryTransaction {
  id: string;
  farmId: string;
  inventoryItemId: string;
  type: 'purchase' | 'usage' | 'adjustment';
  quantity: number;
  unitCost?: number;
  supplier?: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export type FarmTaskType = 'Irrigation' | 'Spraying' | 'Scouting' | 'Harvest' | 'Labour' | 'Other';

export type OpsActivityType =
  | 'Irrigation'
  | 'Spraying'
  | 'Fertilizing'
  | 'Ploughing'
  | 'Seeding'
  | 'Weeding'
  | 'Scouting'
  | 'Harvest'
  | 'Other';

export interface OpsActivity {
  id: string;
  farmId: string;
  fieldId: string;
  cropCycleId?: string;
  date: string;
  type: OpsActivityType;
  description?: string;
  cost?: number;
  status: 'completed' | 'planned';
  createdAt: string;
}

export interface FarmTask {
  id: string;
  farmId: string;
  cropCycleId?: string;
  title: string;
  type: FarmTaskType;
  dueDate: string;
  reminderEnabled: boolean;
  reminderTime?: string;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface HarvestRecord {
  id: string;
  farmId: string;
  cropCycleId: string;
  fieldId?: string;
  date: string;
  boxes: number;
  weightPerBoxKg?: number;
  totalWeightKg?: number;
  unit: UnitType;
  grade: 'A' | 'B' | 'C' | 'Mixed';
  qualityNotes?: string;
  estimatedPricePerBox?: number;
  estimatedGross?: number;
  createdAt: string;
}

export interface SaleRecord {
  id: string;
  farmId: string;
  cropCycleId: string;
  harvestRecordId?: string;
  saleDate: string;
  boxes: number;
  weightKg?: number;
  unit: UnitType;
  pricePerUnit: number;
  grossAmount: number; // boxes * pricePerUnit
  buyerName: string;
  marketName: string; // APMC Mandi or local trader
  commissionType: CommissionType;
  commissionRate: number; // e.g. 10 for 10% or 10 for ₹10/box
  commissionAmount: number;
  transportCost: number;
  otherDeductions: number;
  netAmount: number; // gross - commission - transport - otherDeductions
  amountReceived: number;
  amountPending: number; // netAmount - amountReceived
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface FarmFinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfitLoss: number; // positive = Profit, negative = Loss
  isProfit: boolean;
  profitMarginPercent: number;
  
  // Breakdown
  grossSales: number;
  totalCommissions: number;
  totalTransportSalesDeductions: number;
  totalOtherDeductions: number;
  directExpenses: number; // seeds, fertilizers, pesticides, diesel, etc.
  totalLabourCost: number;
  totalFoodCost: number;
  
  // Receivables & Payables
  totalReceivables: number; // money buyers owe the farmer
  totalPayables: number; // money farmer owes workers/vendors
  
  // Unit Economics
  totalHarvestBoxes: number;
  totalHarvestKg: number;
  totalSoldBoxes: number;
  averageSellingPricePerBox: number;
  costPerBox: number;
  costPerKg: number;
  revenuePerBox: number;
  
  // Status summary
  totalLabourWorkersCount: number;
  totalLabourEntries: number;
  totalHarvestBatches: number;
  totalSalesCount: number;
}

export interface MandiPriceItem {
  id: string;
  marketName: string;
  district: string;
  state: string;
  cropName: string;
  variety: string;
  minPricePerKg: number;
  maxPricePerKg: number;
  modalPricePerKg: number;
  minPricePerBox: number; // assuming 20kg box
  maxPricePerBox: number;
  modalPricePerBox: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  distanceKm: number;
  updatedAt: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  rainProbability: number;
  humidity: number;
  windSpeedKmH: number;
  rainfallMm: number;
  forecast: {
    day: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
    icon: string;
    condition: string;
  }[];
  agriculturalAlerts: {
    id: string;
    type: 'warning' | 'info' | 'critical';
    title: string;
    message: string;
    crop: string;
  }[];
}

export interface ParsedAITransaction {
  intent: 'harvest' | 'labour' | 'expense' | 'sale' | 'unknown';
  confidence: number;
  rawText: string;
  extracted: {
    date?: string;
    crop?: string;
    // Labour fields
    workerCount?: number;
    dailyWage?: number;
    labourTotal?: number;
    workDescription?: string;
    // Harvest fields
    boxes?: number;
    weightKg?: number;
    ratePerBox?: number;
    estimatedTotal?: number;
    // Expense fields
    amount?: number;
    category?: ExpenseCategory;
    vendor?: string;
    // Sale fields
    buyer?: string;
    market?: string;
    grossAmount?: number;
  };
  suggestedAction: string;
  requiresClarification?: boolean;
}

export interface CropDiseaseDiagnosis {
  diseaseName: string;
  confidencePercent: number;
  severity: 'low' | 'moderate' | 'high';
  symptoms: string[];
  cause: string;
  organicRemedy: string[];
  recommendedChemicalControl: string[];
  preventiveMeasures: string[];
  expertDisclaimer: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'harvest' | 'labour_payment' | 'buyer_payment' | 'weather' | 'crop_milestone';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
