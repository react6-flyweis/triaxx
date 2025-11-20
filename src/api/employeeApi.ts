/* eslint-disable @typescript-eslint/no-unused-vars */
// src/api/authService.ts
// import api from './axios';

// import api from './axios';
import setCookie from "@/utils/setCookie";
import api from "@/api/axios";

export interface EmployeeLoginPayload {
  employeeId: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    employeeId: string;
    name: string;
  };
}

export async function loginEmployee(
  payload: EmployeeLoginPayload
): Promise<AuthResponse> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (payload.employeeId === "testuser" && payload.password === "password") {
    const response: AuthResponse = {
      token: "dummy-auth-token-employee",
      user: {
        id: "emp123",
        employeeId: payload.employeeId,
        name: "Test Employee",
      },
    };
    setCookie("token", response.token);
    // localStorage.setItem('token', response.token);
    return response;
  } else {
    throw new Error("Invalid employee ID or password");
  }
  // In a real scenario:
  // const { data } = await axiosInstance.post<AuthResponse>('/auth/employee/login', payload);
  // localStorage.setItem('token', data.token);
  // return data;
}

// Dummy social login functions
export async function loginWithFacebook(): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const response: AuthResponse = {
    token: "dummy-fb-token",
    user: { id: "fb123", employeeId: "fb_user", name: "FB User" },
  };
  localStorage.setItem("token", response.token);
  return response;
}

export async function loginWithGoogle(): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const response: AuthResponse = {
    token: "dummy-google-token",
    user: { id: "google123", employeeId: "google_user", name: "Google User" },
  };
  localStorage.setItem("token", response.token);
  return response;
}

export async function loginWithApple(): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const response: AuthResponse = {
    token: "dummy-apple-token",
    user: { id: "apple123", employeeId: "apple_user", name: "Apple User" },
  };
  localStorage.setItem("token", response.token);
  return response;
}

export function logout() {
  localStorage.removeItem("token");
}

// Get current logged-in employee profile
export const getCurrentEmployeeProfile = async (): Promise<{
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  avatar?: string;
}> => {
  // try {
  //   const response =
  //   // await
  //    api.get('/employee/profile');
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching current employee profile:', error);
  //   // Fallback to dummy data for current user
  return {
    id: "emp123",
    employeeId: "testuser",
    name: "Test Employee",
    email: "test.employee@restaurant.com",
    phone: "+1234567890",
    role: "Waiter",
    department: "Service",
    joinDate: "2023-01-15",
    avatar: "",
  };
  // }
};

// Update current employee profile
export const updateCurrentEmployeeProfile = async (updates: {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}): Promise<{ success: boolean; profile: typeof updates }> => {
  // try {
  //   const response = await api.patch('/employee/profile', updates);
  //   return response.data;
  // } catch (error) {
  //   console.error('Error updating current employee profile:', error);
  //   // Fallback to dummy success
  return { success: true, profile: updates };
  // }
};

// Change password for current employee
export const changePassword =
  async (): // currentPassword: string, newPassword: string
  Promise<{ success: boolean; message: string }> => {
    // try {
    //   const response = await api.post('/employee/change-password', {
    //     currentPassword,
    //     newPassword,
    //   });
    //   return response.data;
    // } catch (error) {
    //   console.error('Error changing password:', error);
    //   // Fallback to dummy success
    return { success: true, message: "Password changed successfully" };
    // }
  };

export interface WorkSummaryData {
  today: {
    workedTime: string;
    remainingTime: string;
  };
  weekly: { [day: string]: { orders: number } };
  customersHandled: {
    morning: number;
    noon: number;
    evening: number;
    night?: number;
  };
  totalOrdersServed: number;
  totalCustomers: number;
  totalTips: number;
  growthPercent: number;
  weeklyEarnings: { [day: string]: number };
}

export async function fetchEmployeeWorkSummary(
  employeeId: string
): Promise<WorkSummaryData> {
  // Simulate API call
  console.log(employeeId);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    today: {
      workedTime: "05:45 hrs",
      remainingTime: "03:00 hrs",
    },
    weekly: {
      S: { orders: 8 },
      M: { orders: 12 },
      T: { orders: 15 },
      W: { orders: 10 },
      T2: { orders: 18 },
      F: { orders: 20 },
      S2: { orders: 22 },
    },
    customersHandled: {
      morning: 80,
      noon: 100,
      evening: 90,
      night: 52,
    },
    totalOrdersServed: 322,
    totalCustomers: 322,
    totalTips: 960,
    growthPercent: 12.4,
    weeklyEarnings: {
      S: 1200,
      M: 1500,
      T: 1800,
      W: 1600,
      T2: 2000,
      F: 2200,
      S2: 2400,
    },
  };
}

// Fetch weekly orders summary for an employee from the backend
export async function fetchEmployeeWeeklyOrders(
  employeeId: string | number
): Promise<{
  week_range?: { start: string; end: string };
  filter?: { employee_id: string | number };
  chart?: { [day: string]: { day: string; orders: number } };
  employees?: unknown[];
  total_orders?: number;
  summary?: {
    totalCustomer?: number;
    totalOrderServed?: number;
    todayWorkingHour?: number;
  };
}> {
  try {
    const res = await api.get("/api/employee/order_history/weeklysummary", {
      params: { employee_id: employeeId },
    });
    return res.data?.data ?? {};
  } catch (error) {
    console.error("fetchEmployeeWeeklyOrders error:", error);
    return {};
  }
}

// Get current employee's performance metrics
export const getCurrentEmployeePerformance =
  async (): // period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  Promise<{
    ordersHandled: number;
    customerSatisfaction: number;
    averageOrderValue: number;
    tipsEarned: number;
    efficiency: number;
  }> => {
    // try {
    //   const response = await api.get('/employee/performance', { params: { period } });
    //   return response.data;
    // } catch (error) {
    //   console.error('Error fetching current employee performance:', error);
    //   // Fallback to dummy data
    return {
      ordersHandled: Math.floor(Math.random() * 50) + 20,
      customerSatisfaction: Math.floor(Math.random() * 20) + 80,
      averageOrderValue: Math.floor(Math.random() * 500) + 1000,
      tipsEarned: Math.floor(Math.random() * 200) + 100,
      efficiency: Math.floor(Math.random() * 20) + 80,
    };
    // }
  };

// Get current employee's schedule
export const getCurrentEmployeeSchedule = async (
  weekStart: string
): Promise<{
  employeeId: string;
  weekStart: string;
  shifts: Array<{
    day: string;
    startTime: string;
    endTime: string;
    role: string;
  }>;
}> => {
  // try {
  //   const response = await api.get('/employee/schedule', { params: { weekStart } });
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching current employee schedule:', error);
  //   // Fallback to dummy schedule
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return {
    employeeId: "testuser",
    weekStart,
    shifts: days.map((day) => ({
      day,
      startTime: "09:00",
      endTime: "17:00",
      role: "Waiter",
    })),
    // };
  };
};

// Get current employee's orders (orders they've handled)
export const getCurrentEmployeeOrders = async (): //   params?: {
//   status?: string;
//   dateRange?: string;
//   limit?: number;
// }
Promise<
  Array<{
    orderId: string;
    status: string;
    tableInfo: { tableId: string; floor: string; status: string };
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    createdAt: string;
  }>
> => {
  // try {
  //   const response = await api.get('/employee/orders', { params });
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching current employee orders:', error);
  //   // Fallback to dummy orders
  return [
    {
      orderId: "EMP_001",
      status: "Completed",
      tableInfo: { tableId: "T1", floor: "1", status: "Available" },
      items: [{ name: "Burger", quantity: 2, price: 500 }],
      totalAmount: 1000,
      createdAt: new Date().toISOString(),
    },
    {
      orderId: "EMP_002",
      status: "Preparing",
      tableInfo: { tableId: "T3", floor: "1", status: "Occupied" },
      items: [{ name: "Pizza", quantity: 1, price: 800 }],
      totalAmount: 800,
      createdAt: new Date().toISOString(),
    },
  ];
  // }
};

// Get current employee's notifications
export const getCurrentEmployeeNotifications = async (): Promise<
  Array<{
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error";
    isRead: boolean;
    createdAt: string;
  }>
> => {
  // try {
  //   const response = await api.get('/employee/notifications');
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching current employee notifications:', error);
  //   // Fallback to dummy notifications
  const now = new Date();
  // Helper to set a specific time today in local time string
  const todayAt = (h: number, m: number) => {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    // Use local time string in sortable format
    return d.toLocaleString("sv-SE");
  };
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };
  return [
    // Today
    {
      id: "1",
      title: "New Order",
      message: "You have a new order from Table 5",
      type: "info",
      isRead: false,
      createdAt: todayAt(9, 15), // 09:15 AM
    },
    {
      id: "2",
      title: "Brian Griffin",
      message: "wants to collaborate",
      type: "info",
      isRead: false,
      createdAt: todayAt(12, 40), // 12:40 PM
    },
    {
      id: "3",
      title: "Order Ready",
      message: "Order #5678 is ready to serve",
      type: "success",
      isRead: false,
      createdAt: todayAt(16, 5), // 04:05 PM
    },
    // Yesterday
    {
      id: "4",
      title: "Shift Reminder",
      message: "Your shift starts in 30 minutes",
      type: "warning",
      isRead: true,
      createdAt: daysAgo(1),
    },
    {
      id: "5",
      title: "Order Completed",
      message: "Order #1234 has been completed",
      type: "success",
      isRead: false,
      createdAt: daysAgo(1),
    },
    // This Week
    {
      id: "6",
      title: "Table Request",
      message: "Table 7 requested assistance",
      type: "info",
      isRead: true,
      createdAt: daysAgo(3),
    },
    {
      id: "7",
      title: "Brian Griffin",
      message: "wants to collaborate",
      type: "info",
      isRead: false,
      createdAt: daysAgo(4),
    },
    // This Month
    {
      id: "8",
      title: "Performance Review",
      message: "Your monthly review is available",
      type: "info",
      isRead: true,
      createdAt: daysAgo(10),
    },
    {
      id: "9",
      title: "Brian Griffin",
      message: "wants to collaborate",
      type: "info",
      isRead: true,
      createdAt: daysAgo(20),
    },
  ];
  // }
};

// Mark notification as read
export const markNotificationAsRead = async (): // notificationId: string
Promise<{ success: boolean }> => {
  // try {
  //   const response = await api.patch(`/employee/notifications/${notificationId}/read`);
  //   return response.data;
  // } catch (error) {
  //   console.error('Error marking notification as read:', error);
  return { success: true };
  // }
};

// Dummy clock in/out API
export async function clockInEmployee(): Promise<{
  success: boolean;
  time: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true, time: new Date().toISOString() };
}

export async function clockOutEmployee(): Promise<{
  success: boolean;
  time: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true, time: new Date().toISOString() };
}
