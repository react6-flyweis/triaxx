import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface User {
  _id: string;
  Name: string;
  Responsibility_id: {
    Responsibility_id: number;
    Responsibility_name: string;
  };
  Role_id: {
    Role_id: number;
    role_name: string;
  };
  Language_id: {
    Language_id: number;
    Language_name: string;
  };
  Country_id: {
    Country_id: number;
    Country_name: string;
    code: string;
  };
  State_id: {
    State_id: number;
    state_name: string;
    Code: string;
  };
  City_id: {
    City_id: number;
    City_name: string;
    Code: string;
  };
  Employee_id: string;
  email: string;
  phone: string;
  gender: string;
  user_image: string;
  OnboardingDate: string;
  yearsWithus: number;
  isLoginPermission: boolean;
  Status: boolean;
  resetPasswordToken: string | null;
  resetPasswordExpires: string | null;
  mood: string | null;
  deleteAccountOtp: string | null;
  deleteAccountOtpExpires: string | null;
  deleteAccountReason: string | null;
  deleteAccountRequested: boolean;
  deleteAccountRequestedAt: string | null;
  deleteAccountApproved: boolean;
  deleteAccountApprovedBy: string | null;
  deleteAccountApprovedAt: string | null;
  deleteAccountRejected: boolean;
  deleteAccountRejectedBy: string | null;
  deleteAccountRejectedAt: string | null;
  loginOtp: string | null;
  loginOtpExpires: string | null;
  CreateAt: string;
  UpdatedAt: string;
  user_id: number;
  UpdatedBy: {
    user_id: number;
    Name: string;
    email: string;
  } | null;
  CreateBy: string | null;
}

interface UserResponse {
  success: boolean;
  data: User;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_API_BASE_URL ||
      "https://vercel-mr-clement-pos-backend.vercel.app",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUserByAuth: builder.query<UserResponse, void>({
      query: () => "/api/user/getbyauth",
    }),
  }),
});

export const { useGetUserByAuthQuery } = userApi;
