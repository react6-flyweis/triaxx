import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const orderHistoryApi = createApi({
  reducerPath: 'orderHistoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://vercel-mr-clement-pos-backend.vercel.app',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllOrderHistory: builder.query<any, any>({
      query: ({ page = 1, limit = 10, search = '', order_status = '', client_mobile_no = '', table_id = '', floor_id = '' }) =>
        `/api/employee/order_history/getall?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&order_status=${encodeURIComponent(order_status)}&client_mobile_no=${encodeURIComponent(client_mobile_no)}&table_id=${encodeURIComponent(table_id)}&floor_id=${encodeURIComponent(floor_id)}`,
      transformResponse: (response: any) => response,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.data.orders.map((order: any) => ({ type: 'OrderHistory' as const, id: order.order.order_id })),
              { type: 'OrderHistory' as const, id: 'LIST' },
            ]
          : [{ type: 'OrderHistory' as const, id: 'LIST' }],
    }),
  }),
});

export const { useGetAllOrderHistoryQuery } = orderHistoryApi;