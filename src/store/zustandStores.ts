import { create } from "zustand";
import getCookie from "@/utils/getCookie";
import { removeCookie } from "@/utils/removeCookie";
import userIcon from "@/assets/employeeImage.png";
import {
  fetchEmployeeWorkSummary,
  type WorkSummaryData,
  getCurrentEmployeeProfile,
  updateCurrentEmployeeProfile,
  changePassword,
  getCurrentEmployeePerformance,
  getCurrentEmployeeSchedule,
  getCurrentEmployeeOrders,
  getCurrentEmployeeNotifications,
  markNotificationAsRead,
  clockInEmployee,
  clockOutEmployee,
} from "@/api/employeeApi";
import type { Order } from "@/types/order";
import * as orderApi from "@/api/orderApi";
import type { OrderItem } from "@/types/order";
import * as menuApi from "@/api/menuApi";
import {
  createSupportTicket,
  type CreateSupportTicketPayload,
  type SupportTicketResponse,
  getSupportTicketId,
  fetchSupportTickets,
  type SupportTicket,
} from "@/api/supportApi";

interface WorkDetails {
  onboardingDate: string;
  yearsWithUs: number;
  shiftTimings: string;
  totalLeaves: number;
  leavesLeft: number;
}

interface TodayProgress {
  remainingTime: string;
  workedTime: string;
}

interface WeeklySummary {
  [day: string]: {
    orders: number;
  };
}

interface MonthlyData {
  totalPresent: number;
  leaves: number;
  leavesLeft: number;
  lateIn: number;
  earlyOut: number;
  workingHours: string;
}

interface WorkSummary {
  today: TodayProgress;
  weekly: WeeklySummary;
  customersHandled: {
    morning: number;
    noon: number;
    evening: number;
  };
  totalOrdersServed: number;
  monthly: MonthlyData;
}

export interface UserProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  profilePic: string;
  recoveryMail: string;
  status: string;
  role: string;
  department: string;
  responsibilities: string;
  joinDate: string;
  workDetails: WorkDetails;
  workSummary: WorkSummary;
}

interface Activity {
  date: string;
  text: string;
  ago: string;
}

interface UserStoreState {
  // Authentication
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  checkAuth: () => void;

  // User Profile
  user: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Work Summary
  workSummary: WorkSummaryData | null;

  // User Actions
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changeUserPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
  fetchWorkSummary: () => Promise<void>;
  fetchUserPerformance: (
    period?: "daily" | "weekly" | "monthly"
  ) => Promise<Record<string, unknown>>;
  fetchUserSchedule: (weekStart: string) => Promise<Record<string, unknown>>;
  fetchUserOrders: (params?: {
    status?: string;
    dateRange?: string;
    limit?: number;
  }) => Promise<unknown>;
  fetchUserNotifications: () => Promise<unknown>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;

  // Clock In/Out
  isClockedIn: boolean;
  lastClockIn: string | null;
  lastClockOut: string | null;
  activities: Activity[];
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  fetchActivities: () => Promise<void>;
}

interface OrderStoreState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: (params?: {
    status?: string;
    dateRange?: string;
  }) => Promise<void>;
  createOrder: (order: Order) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

interface MenuStoreState {
  menuItems: OrderItem[];
  loading: boolean;
  error: string | null;
  fetchMenuItems: () => Promise<void>;
}

interface CurrentOrder {
  tableId: string;
  floor: number;
  persons: number;
  items: OrderItem[];
}

interface OrderFlowStoreState {
  currentOrder: CurrentOrder | null;
  pendingItem: OrderItem | null;
  pendingCustomizedItem: OrderItem | null;
  startOrder: (data: {
    tableId: string;
    floor: number;
    persons: number;
    orderId?: string;
  }) => void;
  setPendingItem: (item: OrderItem) => void;
  clearPendingItem: () => void;
  setPendingCustomizedItem: (item: OrderItem) => void;
  clearPendingCustomizedItem: () => void;
  addItemToOrder: (item: OrderItem) => void;
  updateOrderItem: (itemId: string, updates: Partial<OrderItem>) => void;
  removeOrderItem: (itemId: string) => void;
  resetOrder: () => void;
  setCurrentOrderId: (orderId: string) => void;
  floor: number;
  persons: number;
  isInOrderFlow: boolean;
  setFloor: (floor: number) => void;
  setPersons: (persons: number) => void;
  setInOrderFlow: (inOrderFlow: boolean) => void;
}

interface SupportTicketStoreState {
  email: string;
  businessName: string;
  subject: string;
  message: string;
  images: File[];
  ticketNumber: string | null;
  createdAt: string | null;
  loading: boolean;
  error: string | null;
  setField: (field: keyof SupportTicketStoreState, value: unknown) => void;
  setImages: (images: File[]) => void;
  fetchTicketId: () => Promise<void>;
  createTicket: () => Promise<void>;
  reset: () => void;
}

interface SupportTicketListStoreState {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  filter: "all" | "ongoing" | "resolved";
  period: "week" | "day" | "month";
  search: string;
  fetchTickets: () => Promise<void>;
  setFilter: (filter: "all" | "ongoing" | "resolved") => void;
  setPeriod: (period: "week" | "day" | "month") => void;
  setSearch: (search: string) => void;
}

interface WalkthroughUIState {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

// Consolidated User Store (replaces useAuthStore and useStore)
export const useUserStore = create<UserStoreState>((set, get) => ({
  // Authentication
  isAuthenticated: false,
  login: () => {
    console.log("Setting authenticated state to true");
    set({ isAuthenticated: true });
  },
  logout: () => {
    console.log("Logging out, removing cookie and setting state to false");
    removeCookie("authToken");
    set({ isAuthenticated: false, user: null, workSummary: null });
  },
  checkAuth: () => {
    const token = getCookie("authToken");
    console.log("Checking auth, token found:", !!token);
    set({ isAuthenticated: !!token });
  },

  // User Profile
  user: null,
  loading: false,
  error: null,

  // Work Summary
  workSummary: null,

  // User Actions
  fetchUserProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await getCurrentEmployeeProfile();
      // Transform API response to match our UserProfile interface
      const userProfile: UserProfile = {
        id: profile.id,
        employeeId: profile.employeeId,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        profilePic: profile.avatar || userIcon,
        recoveryMail: profile.email,
        status: "Active",
        role: profile.role,
        department: profile.department,
        responsibilities: "Order's and Reservations",
        joinDate: profile.joinDate,
        workDetails: {
          onboardingDate: profile.joinDate,
          yearsWithUs: Math.floor(
            (Date.now() - new Date(profile.joinDate).getTime()) /
              (1000 * 60 * 60 * 24 * 365)
          ),
          shiftTimings: "9:00 AM - 6:00 PM",
          totalLeaves: 24,
          leavesLeft: 12,
        },
        workSummary: {
          today: {
            remainingTime: "2h 30m",
            workedTime: "5h 30m",
          },
          weekly: {
            Monday: { orders: 12 },
            Tuesday: { orders: 15 },
            Wednesday: { orders: 10 },
            Thursday: { orders: 18 },
            Friday: { orders: 20 },
            Saturday: { orders: 22 },
            Sunday: { orders: 8 },
          },
          customersHandled: {
            morning: 15,
            noon: 20,
            evening: 25,
          },
          totalOrdersServed: 60,
          monthly: {
            totalPresent: 22,
            leaves: 2,
            leavesLeft: 10,
            lateIn: 1,
            earlyOut: 0,
            workingHours: "160h",
          },
        },
      };
      set({ user: userProfile, loading: false });
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user profile",
        loading: false,
      });
    }
  },

  updateUserProfile: async (updates) => {
    set({ loading: true, error: null });
    try {
      const result = await updateCurrentEmployeeProfile(updates);
      if (result.success && get().user) {
        set({ user: { ...get().user!, ...updates }, loading: false });
      }
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update profile",
        loading: false,
      });
    }
  },

  changeUserPassword: async () =>
    // currentPassword, newPassword
    {
      set({ loading: true, error: null });
      try {
        const result = await changePassword();
        // currentPassword, newPassword
        set({ loading: false });
        return result;
      } catch (error: unknown) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to change password",
          loading: false,
        });
        throw error;
      }
    },

  fetchWorkSummary: async () => {
    try {
      const data = await fetchEmployeeWorkSummary("current");
      set({ workSummary: data });
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch work summary",
      });
    }
  },

  fetchUserPerformance: async () =>
    // period = 'weekly'
    {
      try {
        return await getCurrentEmployeePerformance();
        // period
      } catch (error: unknown) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch performance",
        });
        throw error;
      }
    },

  fetchUserSchedule: async (weekStart) => {
    try {
      return await getCurrentEmployeeSchedule(weekStart);
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch schedule",
      });
      throw error;
    }
  },

  fetchUserOrders: async () =>
    // params
    {
      try {
        return await getCurrentEmployeeOrders();
        // params
      } catch (error: unknown) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch user orders",
        });
        throw error;
      }
    },

  fetchUserNotifications: async () => {
    try {
      return await getCurrentEmployeeNotifications();
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications",
      });
      throw error;
    }
  },

  markNotificationAsRead: async () =>
    // notificationId
    {
      try {
        await markNotificationAsRead();
        // notificationId
      } catch (error: unknown) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to mark notification as read",
        });
        throw error;
      }
    },

  // Clock In/Out
  isClockedIn: false,
  lastClockIn: null,
  lastClockOut: null,
  activities: [],
  clockIn: async () => {
    const { success, time } = await clockInEmployee();
    if (success) {
      set((state) => ({
        isClockedIn: true,
        lastClockIn: time,
        activities: [
          {
            date: new Date(time).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
            }),
            text: "Clocked in",
            ago: "Just now",
          },
          ...state.activities,
        ],
      }));
    }
  },
  clockOut: async () => {
    const { success, time } = await clockOutEmployee();
    if (success) {
      set((state) => ({
        isClockedIn: false,
        lastClockOut: time,
        activities: [
          {
            date: new Date(time).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
            }),
            text: "Clocked out",
            ago: "Just now",
          },
          ...state.activities,
        ],
      }));
    }
  },
  fetchActivities: async () => {
    // Dummy activities
    set({
      activities: [
        {
          date: "14 Apr",
          text: "Brian Griffin wants to collaborate",
          ago: "5 days ago",
        },
        {
          date: "14 Apr",
          text: "Brian Griffin wants to collaborate",
          ago: "5 days ago",
        },
        {
          date: "14 Apr",
          text: "Brian Griffin wants to collaborate",
          ago: "5 days ago",
        },
        {
          date: "14 Apr",
          text: "Brian Griffin wants to collaborate",
          ago: "5 days ago",
        },
      ],
    });
  },
}));

// Legacy compatibility - redirect to new store
export const useAuthStore = useUserStore;
export const useStore = useUserStore;

export const useOrderStore = create<OrderStoreState>((set) => ({
  orders: [],
  loading: false,
  error: null,
  fetchOrders: async (params) => {
    set({ loading: true, error: null });
    try {
      const orders = await orderApi.fetchOrders(params);
      console.log(orders);
      set({ orders, loading: false });
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch orders",
        loading: false,
      });
    }
  },
  createOrder: async (order) => {
    set({ loading: true, error: null });
    try {
      await orderApi.createOrder(order);
      set((state) => ({ orders: [...state.orders, order], loading: false }));
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create order",
        loading: false,
      });
    }
  },
  updateOrder: async (orderId, updates) => {
    set({ loading: true, error: null });
    try {
      await orderApi.updateOrder(orderId, updates);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.orderId === orderId ? { ...order, ...updates } : order
        ),
        loading: false,
      }));
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update order",
        loading: false,
      });
    }
  },
  deleteOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      await orderApi.deleteOrder(orderId);
      set((state) => ({
        orders: state.orders.filter((order) => order.orderId !== orderId),
        loading: false,
      }));
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete order",
        loading: false,
      });
    }
  },
}));

export const useMenuStore = create<MenuStoreState>((set) => ({
  menuItems: [],
  loading: false,
  error: null,
  fetchMenuItems: async () => {
    set({ loading: true, error: null });
    try {
      const menuItems = await menuApi.getMenuItems();
      set({ menuItems, loading: false });
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch menu items",
        loading: false,
      });
    }
  },
}));

export const useOrderFlowStore = create<OrderFlowStoreState>((set) => ({
  currentOrder: null,
  pendingItem: null,
  pendingCustomizedItem: null,
  startOrder: ({ tableId, floor, persons, orderId }) =>
    set((state) => {
      let items = state.currentOrder?.items || [];
      if (state.pendingCustomizedItem) {
        items = [...items, state.pendingCustomizedItem];
      }
      return {
        currentOrder: {
          tableId,
          floor,
          persons,
          items,
          ...(orderId ? { orderId } : {}),
        },
        pendingItem: null,
        pendingCustomizedItem: null,
      };
    }),
  setPendingItem: (item) => set(() => ({ pendingItem: item })),
  clearPendingItem: () => set(() => ({ pendingItem: null })),
  setPendingCustomizedItem: (item) =>
    set(() => ({ pendingCustomizedItem: item })),
  clearPendingCustomizedItem: () =>
    set(() => ({ pendingCustomizedItem: null })),
  addItemToOrder: (item) =>
    set((state) => {
      if (!state.currentOrder) return {};
      return {
        currentOrder: {
          ...state.currentOrder,
          items: [...state.currentOrder.items, item],
        },
      };
    }),
  updateOrderItem: (itemId, updates) =>
    set((state) => {
      if (!state.currentOrder) return {};
      return {
        currentOrder: {
          ...state.currentOrder,
          items: state.currentOrder.items.map((item) =>
            item.itemId === itemId ? { ...item, ...updates } : item
          ),
        },
      };
    }),
  removeOrderItem: (itemId) =>
    set((state) => {
      if (!state.currentOrder) return {};
      return {
        currentOrder: {
          ...state.currentOrder,
          items: state.currentOrder.items.filter(
            (item) => item.itemId !== itemId
          ),
        },
      };
    }),
  resetOrder: () =>
    set(() => ({
      currentOrder: null,
      pendingItem: null,
      pendingCustomizedItem: null,
      floor: 1,
      persons: 1,
      isInOrderFlow: false,
    })),
  setCurrentOrderId: (orderId) =>
    set((state) => {
      if (!state.currentOrder) return {};
      return {
        currentOrder: {
          ...state.currentOrder,
          orderId,
        },
      };
    }),
  floor: 1,
  persons: 1,
  isInOrderFlow: false,
  setFloor: (floor) => set({ floor }),
  setPersons: (persons) => set({ persons }),
  setInOrderFlow: (isInOrderFlow) => set({ isInOrderFlow }),
}));

export const useSupportTicketStore = create<SupportTicketStoreState>(
  (set, get) => ({
    email: "",
    businessName: "",
    subject: "",
    message: "",
    images: [],
    ticketNumber: null,
    createdAt: null,
    loading: false,
    error: null,
    setField: (field: keyof SupportTicketStoreState, value: unknown) =>
      set({ [field]: value }),
    setImages: (images) => set({ images }),
    fetchTicketId: async () => {
      set({ loading: true });
      try {
        const ticketId = await getSupportTicketId();
        set({ ticketNumber: ticketId, loading: false });
      } catch (error) {
        console.error(error);
        set({ error: "Failed to fetch ticket ID", loading: false });
      }
    },
    createTicket: async () => {
      set({ loading: true, error: null });
      try {
        const { email, businessName, subject, message, images } = get();
        const payload: CreateSupportTicketPayload = {
          email,
          businessName,
          subject,
          message,
          images,
        };
        const res: SupportTicketResponse = await createSupportTicket(payload);
        set({
          ticketNumber: res.ticketNumber,
          createdAt: res.createdAt,
          loading: false,
        });
      } catch (error: unknown) {
        if (typeof error === "object" && error && "message" in error) {
          set({
            error:
              (error as { message: string }).message ||
              "Failed to create ticket",
            loading: false,
          });
        } else {
          set({ error: "Failed to create ticket", loading: false });
        }
      }
    },
    reset: () =>
      set({
        email: "",
        businessName: "",
        subject: "",
        message: "",
        images: [],
        ticketNumber: null,
        createdAt: null,
        loading: false,
        error: null,
      }),
  })
);

export const useSupportTicketListStore = create<SupportTicketListStoreState>(
  (set, get) => ({
    tickets: [],
    loading: false,
    error: null,
    filter: "all",
    period: "week",
    search: "",
    fetchTickets: async () => {
      set({ loading: true, error: null });
      try {
        const {
          filter,
          period,
          //  search
        } = get();
        const tickets = await fetchSupportTickets(
          filter,
          period
          //  search
        );
        set({ tickets, loading: false });
      } catch (error: unknown) {
        console.error(error);
        set({ error: "Failed to fetch tickets", loading: false });
      }
    },
    setFilter: (filter) => set({ filter }),
    setPeriod: (period) => set({ period }),
    setSearch: (search) => set({ search }),
  })
);

export const useWalkthroughUIStore = create<WalkthroughUIState>((set) => ({
  selectedCategory: "all",
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
