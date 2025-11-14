import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface CreateByOrUpdatedBy {
  user_id: number;
  Name: string;
  email: string;
}

export interface ClockRecord {
  _id: string;
  date: string;
  in_time: string;
  out_time: string | null;
  user_id: number;
  Status: boolean;
  CreateBy: CreateByOrUpdatedBy;
  UpdatedAt: string | null;
  CreateAt: string;
  Clock_in_id: number;
  UpdatedBy: CreateByOrUpdatedBy | null;
}

interface ClockRecordsResponse {
  success: boolean;
  count: number;
  data: ClockRecord[];
}

interface RootState {
  auth: {
    token: string | null;
  };
}

export const clockApi = createApi({
  reducerPath: "clockApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_API_BASE_URL ||
      "https://vercel-mr-clement-pos-backend.vercel.app",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ClockRecords"],
  endpoints: (builder) => ({
    getClockRecordsByAuth: builder.query<ClockRecordsResponse, void>({
      query: () => "/api/master/clock/getbyauth",
      providesTags: ["ClockRecords"],
    }),
  }),
});

export const { useGetClockRecordsByAuthQuery } = clockApi;
