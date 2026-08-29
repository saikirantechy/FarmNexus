'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  CropCycle,
  ExpenseRecord,
  Farm,
  FarmFinancialSummary,
  FarmTask,
  HarvestRecord,
  InventoryItem,
  InventoryTransaction,
  LabourRecord,
  NotificationItem,
  OpsActivity,
  SaleRecord,
  UserProfile,
} from '@/types';
import {
  DEMO_ACTIVITIES,
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
  inventoryItems: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  tasks: FarmTask[];
  activities: OpsActivity[];

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
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => InventoryItem;
  recordInventoryTransaction: (
    transaction: Omit<InventoryTransaction, 'id' | 'createdAt'>
  ) => InventoryTransaction;
  deleteInventoryItem: (id: string) => void;
  addTask: (task: Omit<FarmTask, 'id' | 'createdAt' | 'completed' | 'completedAt'>) => FarmTask;
  toggleTaskCompleted: (id: string) => void;
  deleteTask: (id: string) => void;

  addActivity: (activity: Omit<OpsActivity, 'id' | 'createdAt'>) => OpsActivity;
  toggleActivityStatus: (id: string) => void;
  deleteActivity: (id: string) => void;
  
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
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [activities, setActivities] = useState<OpsActivity[]>(DEMO_ACTIVITIES);
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
        if (parsed.inventoryItems) setInventoryItems(parsed.inventoryItems);
        if (parsed.inventoryTransactions) setInventoryTransactions(parsed.inventoryTransactions);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.activities) setActivities(parsed.activities);
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
        inventoryItems,
        inventoryTransactions,
        tasks,
        activities,
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
    inventoryItems,
    inventoryTransactions,
    tasks,
    activities,
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

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inventory-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInventoryItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const recordInventoryTransaction = (
    transaction: Omit<InventoryTransaction, 'id' | 'createdAt'>
  ) => {
    const newTransaction: InventoryTransaction = {
      ...transaction,
      id: `inventory-tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const quantityChange = transaction.type === 'usage' ? -transaction.quantity : transaction.quantity;
    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === transaction.inventoryItemId
          ? {
              ...item,
              currentQuantity: Math.max(0, item.currentQuantity + quantityChange),
              supplier: transaction.supplier || item.supplier,
            }
          : item
      )
    );
    setInventoryTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction;
  };

  const deleteInventoryItem = (id: string) => {
    setInventoryItems((prev) => prev.filter((item) => item.id !== id));
    setInventoryTransactions((prev) => prev.filter((transaction) => transaction.inventoryItemId !== id));
  };

  const addTask = (task: Omit<FarmTask, 'id' | 'createdAt' | 'completed' | 'completedAt'>) => {
    const newTask: FarmTask = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task
      )
    );
  };

  const deleteTask = (id: string) => setTasks((prev) => prev.filter((task) => task.id !== id));

  const addActivity = (activity: Omit<OpsActivity, 'id' | 'createdAt'>) => {
    const newActivity: OpsActivity = {
      ...activity,
      id: `ops-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);
    return newActivity;
  };

  const toggleActivityStatus = (id: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? { ...activity, status: activity.status === 'completed' ? 'planned' : 'completed' }
          : activity
      )
    );
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
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
    setInventoryItems([]);
    setInventoryTransactions([]);
    setTasks([]);
    setActivities(DEMO_ACTIVITIES);
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
    setInventoryItems([]);
    setInventoryTransactions([]);
    setTasks([]);
    setActivities([]);
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
        inventoryItems: inventoryItems.filter((item) => item.farmId === activeFarmId),
        inventoryTransactions: inventoryTransactions.filter(
          (transaction) => transaction.farmId === activeFarmId
        ),
        tasks: tasks.filter((task) => task.farmId === activeFarmId),
        activities: activities.filter((activity) => activity.farmId === activeFarmId),
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
        addInventoryItem,
        recordInventoryTransaction,
        deleteInventoryItem,
        addTask,
        toggleTaskCompleted,
        deleteTask,
        addActivity,
        toggleActivityStatus,
        deleteActivity,
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
