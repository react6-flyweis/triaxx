import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/redux/store";
import {
  fetchEmployeeWorkSummary as fetchEmployeeWorkSummaryFn,
  fetchEmployeeWeeklyOrders as fetchEmployeeWeeklyOrdersFn,
} from "@/api/employeeApi";
import type { WorkSummaryData } from "@/api/employeeApi";

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state?.auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getEmployeeWorkSummary: builder.query<WorkSummaryData, string>({
      // we use queryFn to call the existing helper in api/employeeApi which may be mocked
      async queryFn(employeeId) {
        try {
          const data = await fetchEmployeeWorkSummaryFn(employeeId);
          return { data };
        } catch (error) {
          console.error("getEmployeeWorkSummary error:", error);
          return { error: { status: 500, data: error } };
        }
      },
    }),
    getEmployeeWeeklyOrders: builder.query<
      {
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
      },
      string | number
    >({
      async queryFn(employeeId) {
        try {
          const data = await fetchEmployeeWeeklyOrdersFn(
            employeeId as string | number
          );
          return { data };
        } catch (error) {
          console.error("getEmployeeWeeklyOrders error:", error);
          return { error: { status: 500, data: error } };
        }
      },
    }),
  }),
});

export const {
  useGetEmployeeWorkSummaryQuery,
  useGetEmployeeWeeklyOrdersQuery,
} = employeeApi;
