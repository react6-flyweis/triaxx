import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types based on the API response
interface CreateByUser {
  user_id: number;
  Name: string;
  email: string;
}

interface Customer {
  Customer_id: number;
  Name: string;
  phone: string;
}

interface SupportTicket {
  _id: string;
  support_ticket_type_id: number;
  question: string;
  customer_id: number;
  Ticket_status: string;
  Status: boolean;
  CreateBy: CreateByUser | null;
  CreateAt: string;
  UpdatedAt: string;
  support_ticket_id: number;
  UpdatedBy: CreateByUser | null;
  Customer: Customer;
  SupportTicketType: Record<string, unknown> | null;
}

interface GetAllSupportTicketsResponse {
  success: boolean;
  count: number;
  data: SupportTicket[];
}

interface GetAllSupportTicketsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

interface SupportTicketType {
  _id: string;
  Name: string;
  nodes: string;
  Status: boolean;
  CreateBy: CreateByUser | null;
  CreateAt: string;
  UpdatedAt: string;
  support_ticket_type_id: number;
  UpdatedBy: number | null;
}

interface GetSupportTicketTypesResponse {
  success: boolean;
  count: number;
  data: SupportTicketType[];
}

interface CreateSupportTicketPayload {
  support_ticket_type_id: number;
  question: string;
  customer_id: number;
  Ticket_status: string;
  Status: boolean;
}

interface CreateSupportTicketResponse {
  success: boolean;
  data: SupportTicket;
}

export interface TicketReply {
  _id?: string;
  support_ticket_id?: number;
  reply?: string;
  employee_id?: number;
  Ticket_status?: string;
  Status?: boolean;
  CreateBy?: { user_id?: number; Name?: string } | null;
  CreateAt?: string;
  UpdatedAt?: string;
  support_ticket_reply_id?: number;
  UpdatedBy?: unknown;
  Employee?: { user_id?: number; Name?: string; email?: string } | null;
  SupportTicket?: { support_ticket_id?: number; question?: string } | null;
}

export const supportTicketsApi = createApi({
  reducerPath: "supportTicketsApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_API_BASE_URL ||
      "https://vercel-mr-clement-pos-backend.vercel.app",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["SupportTickets"],
  endpoints: (builder) => ({
    getAllSupportTickets: builder.query<
      GetAllSupportTicketsResponse,
      GetAllSupportTicketsParams | void
    >({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        const search = params?.search ?? "";
        const status = params?.status ?? "";

        const queryParams = new URLSearchParams();
        queryParams.append("page", page.toString());
        queryParams.append("limit", limit.toString());
        if (search) queryParams.append("search", search);
        if (status) queryParams.append("status", status);

        return `/api/restaurant/support_ticket/getall?${queryParams.toString()}`;
      },
      transformResponse: (response: GetAllSupportTicketsResponse) => response,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((ticket) => ({
                type: "SupportTickets" as const,
                id: ticket.support_ticket_id,
              })),
              { type: "SupportTickets" as const, id: "LIST" },
            ]
          : [{ type: "SupportTickets" as const, id: "LIST" }],
    }),
    getSupportTicketById: builder.query<
      { success: boolean; data: SupportTicket },
      number | string
    >({
      query: (id) => `/api/restaurant/support_ticket/getbyid/${id}`,
      transformResponse: (response: {
        success: boolean;
        data: SupportTicket;
      }) => response,
      providesTags: (_result, _error, id) => [
        { type: "SupportTickets" as const, id },
      ],
    }),
    createSupportTicketReply: builder.mutation<
      { success: boolean; data: Record<string, unknown> },
      {
        support_ticket_id: number;
        reply: string;
        employee_id: number;
        Ticket_status?: string;
        Status?: boolean;
      }
    >({
      query: (body) => ({
        url: "/api/restaurant/support_ticket_reply/create",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "SupportTickets" as const, id: arg.support_ticket_id },
      ],
    }),
    getSupportTicketReplies: builder.query<
      { success: boolean; count: number; data: TicketReply[] },
      number | string
    >({
      query: (ticketId) =>
        `/api/restaurant/support_ticket_reply/getall?ticket_id=${ticketId}`,
      transformResponse: (response: {
        success: boolean;
        count: number;
        data: TicketReply[];
      }) => response,
      providesTags: (_result, _error, id) => [
        { type: "SupportTickets" as const, id },
      ],
    }),
    getSupportTicketTypes: builder.query<GetSupportTicketTypesResponse, void>({
      query: () => "/api/restaurant/support_ticket_type/getall",
      transformResponse: (response: GetSupportTicketTypesResponse) => response,
    }),
    createSupportTicket: builder.mutation<
      CreateSupportTicketResponse,
      CreateSupportTicketPayload
    >({
      query: (body) => ({
        url: "/api/restaurant/support_ticket/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SupportTickets" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllSupportTicketsQuery,
  useGetSupportTicketByIdQuery,
  useCreateSupportTicketReplyMutation,
  useGetSupportTicketRepliesQuery,
  useGetSupportTicketTypesQuery,
  useCreateSupportTicketMutation,
} = supportTicketsApi;

// Export types for use in components
export type {
  SupportTicket,
  GetAllSupportTicketsResponse,
  GetAllSupportTicketsParams,
};
