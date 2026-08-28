'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  CropCycle,
  ExpenseRecord,
  Farm,
  FarmFinancialSummary,
  HarvestRecord,
  LabourRecord,
  NotificationItem,
  SaleRecord,
  UserProfile,
} from '@/types';
import {
  DEMO_CROPS,
  DEMO_EXPENSES,
  DEMO_FARMS,
  DEMO_HARVESTS,
  DEMO_LABOUR,
  DEMO_NOTIFICATIONS,
  DEMO_SALES,
  DEMO_USER,
} from './demo-data';
import { calculateFinancialSummary } from './calculations';

interface FarmStoreContextType {
  user: UserProfile;
  farms: Farm[];
  activeFarmId: string;
  setActiveFarmId: (id: string) => void;
  activeFarm: Farm | undefined;
  
  cropCycles: CropCycle[];
  activeCropId: string;
  setActiveCropId: (id: string) => void;
  activeCrop: CropCycle | undefined;

  harvests: HarvestRecord[];
  labourRecords: LabourRecord[];
  expenses: ExpenseRecord[];
  sales: SaleRecord[];
  notifications: NotificationItem[];

  financialSummary: FarmFinancialSummary;
  isOffline: boolean;
  
  // Actions
  addHarvest: (record: Omit<HarvestRecord, 'id' | 'createdAt'>) => HarvestRecord;
  deleteHarvest: (id: string) => void;
  
  addLabour: (record: Omit<LabourRecord, 'id' | 'createdAt'>) => LabourRecord;
  deleteLabour: (id: string) => void;
  
  addExpense: (record: Omit<ExpenseRecord, 'id' | 'createdAt'>) => ExpenseRecord;
  deleteExpense: (id: string) => void;
  
  addSale: (record: Omit<SaleRecord, 'id' | 'createdAt'>) => SaleRecord;
  markSaleReceived: (saleId: string) => void;
  deleteSale: (id: string) => void;
  
  addFarm: (farm: Omit<Farm, 'id' | 'createdAt'>) => Farm;
  addCropCycle: (crop: Omit<CropCycle, 'id' | 'createdAt'>) => CropCycle;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const STORAGE_KEY = 'farmnexus_data_v1';

const FarmStoreContext = createContext<FarmStoreContextType | undefined>(undefined);

export function FarmStoreProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<UserProfile>(DEMO_USER);
  const [farms, setFarms] = useState<Farm[]>(DEMO_FARMS);
  const [activeFarmId, setActiveFarmId] = useState<string>('farm-1');
  const [cropCycles, setCropCycles] = useState<CropCycle[]>(DEMO_CROPS);
  const [activeCropId, setActiveCropId] = useState<string>('crop-tomato-1');
  
  const [harvests, setHarvests] = useState<HarvestRecord[]>(DEMO_HARVESTS);
  const [labourRecords, setLabourRecords] = useState<LabourRecord[]>(DEMO_LABOUR);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(DEMO_EXPENSES);
  const [sales, setSales] = useState<SaleRecord[]>(DEMO_SALES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [isOffline, setIsOffline] = useState(false);

  // Online / Offline listener
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load from local storage
  useEffect(() => {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        if (parsed.user) setUser(parsed.user);
        if (parsed.farms && parsed.farms.length > 0) {
          setFarms(parsed.farms);
          setActiveFarmId(parsed.activeFarmId || parsed.farms[0].id);
        }
        if (parsed.cropCycles && parsed.cropCycles.length > 0) {
          setCropCycles(parsed.cropCycles);
          setActiveCropId(parsed.activeCropId || parsed.cropCycles[0].id);
        }
        if (parsed.harvests) setHarvests(parsed.harvests);
        if (parsed.labourRecords) setLabourRecords(parsed.labourRecords);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.notifications) setNotifications(parsed.notifications);
      }
    } catch (e) {
      console.warn('Failed to load storage data, using defaults', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on any state change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const payload = {
        user,
        farms,
        activeFarmId,
        cropCycles,
        activeCropId,
        harvests,
        labourRecords,
        expenses,
        sales,
        notifications,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save to storage', e);
    }
  }, [
    isLoaded,
    user,
    farms,
    activeFarmId,
    cropCycles,
    activeCropId,
    harvests,
    labourRecords,
    expenses,
    sales,
    notifications,
  ]);

  const activeFarm = useMemo(() => {
    return farms.find((f) => f.id === activeFarmId) || farms[0];
  }, [farms, activeFarmId]);

  const activeCrop = useMemo(() => {
    return cropCycles.find((c) => c.id === activeCropId) || cropCycles[0];
  }, [cropCycles, activeCropId]);

  // Filter records by current active farm/crop for precise P&L
  const filteredHarvests = useMemo(() => {
    return harvests.filter((h) => !activeFarmId || h.farmId === activeFarmId);
  }, [harvests, activeFarmId]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => !activeFarmId || s.farmId === activeFarmId);
  }, [sales, activeFarmId]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => !activeFarmId || e.farmId === activeFarmId);
  }, [expenses, activeFarmId]);

  const filteredLabour = useMemo(() => {
    return labourRecords.filter((l) => !activeFarmId || l.farmId === activeFarmId);
  }, [labourRecords, activeFarmId]);

  // Real-time financial summary
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(
      filteredHarvests,
      filteredSales,
      filteredExpenses,
      filteredLabour
    );
  }, [filteredHarvests, filteredSales, filteredExpenses, filteredLabour]);

  // CRUD actions
  const addHarvest = (record: Omit<HarvestRecord, 'id' | 'createdAt'>) => {
    const newRecord: HarvestRecord = {
      ...record,
      id: `h-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setHarvests((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const deleteHarvest = (id: string) => {
    setHarvests((prev) => prev.filter((h) => h.id !== id));
  };

  const addLabour = (record: Omit<LabourRecord, 'id' | 'createdAt'>) => {
    const newRecord: LabourRecord = {
      ...record,
      id: `labour-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLabourRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const deleteLabour = (id: string) => {
    setLabourRecords((prev) => prev.filter((l) => l.id !== id));
  };

  const addExpense = (record: Omit<ExpenseRecord, 'id' | 'createdAt'>) => {
    const newRecord: ExpenseRecord = {
      ...record,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addSale = (record: Omit<SaleRecord, 'id' | 'createdAt'>) => {
    const newRecord: SaleRecord = {
      ...record,
      id: `sale-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSales((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const markSaleReceived = (saleId: string) => {
    setSales((prev) =>
      prev.map((s) => {
        if (s.id === saleId) {
          return {
            ...s,
            amountReceived: s.netAmount,
            amountPending: 0,
            paymentStatus: 'paid',
          };
        }
        return s;
      })
    );
  };

  const deleteSale = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  const addFarm = (farmData: Omit<Farm, 'id' | 'createdAt'>) => {
    const newFarm: Farm = {
      ...farmData,
      id: `farm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFarms((prev) => [...prev, newFarm]);
    setActiveFarmId(newFarm.id);
    return newFarm;
  };

  const addCropCycle = (cropData: Omit<CropCycle, 'id' | 'createdAt'>) => {
    const newCrop: CropCycle = {
      ...cropData,
      id: `crop-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCropCycles((prev) => [...prev, newCrop]);
    setActiveCropId(newCrop.id);
    return newCrop;
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...profile }));
  };

  const resetToDemoData = () => {
    setUser(DEMO_USER);
    setFarms(DEMO_FARMS);
    setActiveFarmId('farm-1');
    setCropCycles(DEMO_CROPS);
    setActiveCropId('crop-tomato-1');
    setHarvests(DEMO_HARVESTS);
    setLabourRecords(DEMO_LABOUR);
    setExpenses(DEMO_EXPENSES);
    setSales(DEMO_SALES);
    setNotifications(DEMO_NOTIFICATIONS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const clearAllData = () => {
    setHarvests([]);
    setLabourRecords([]);
    setExpenses([]);
    setSales([]);
    setNotifications([]);
  };

  return (
    <FarmStoreContext.Provider
      value={{
        user,
        farms,
        activeFarmId,
        setActiveFarmId,
        activeFarm,
        cropCycles,
        activeCropId,
        setActiveCropId,
        activeCrop,
        harvests: filteredHarvests,
        labourRecords: filteredLabour,
        expenses: filteredExpenses,
        sales: filteredSales,
        notifications,
        financialSummary,
        isOffline,
        addHarvest,
        deleteHarvest,
        addLabour,
        deleteLabour,
        addExpense,
        deleteExpense,
        addSale,
        markSaleReceived,
        deleteSale,
        addFarm,
        addCropCycle,
        updateUserProfile,
        resetToDemoData,
        clearAllData,
      }}
    >
      {children}
    </FarmStoreContext.Provider>
  );
}

export function useFarmStore() {
  const context = useContext(FarmStoreContext);
  if (!context) {
    throw new Error('useFarmStore must be used within a FarmStoreProvider');
  }
  return context;
}
