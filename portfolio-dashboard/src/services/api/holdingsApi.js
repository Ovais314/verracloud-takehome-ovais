import { baseApi } from './baseApi';

export const holdingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHoldings: builder.query({
      query: () => '/api/holdings',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Holdings', id })),
              { type: 'Holdings', id: 'LIST' },
            ]
          : [{ type: 'Holdings', id: 'LIST' }],
    }),
    addHolding: builder.mutation({
      query: (body) => ({
        url: '/api/holdings',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      invalidatesTags: [{ type: 'Holdings', id: 'LIST' }],
    }),
    deleteHolding: builder.mutation({
      query: (id) => ({
        url: `/api/holdings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Holdings', id },
        { type: 'Holdings', id: 'LIST' },
      ],
    }),
    getPrices: builder.query({
      query: () => '/api/prices',
      providesTags: [{ type: 'Prices', id: 'LIST' }],
    }),
    refreshPrices: builder.mutation({
      query: () => ({
        url: '/api/prices/refresh',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Prices', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetHoldingsQuery,
  useAddHoldingMutation,
  useDeleteHoldingMutation,
  useGetPricesQuery,
  useRefreshPricesMutation,
} = holdingsApi;
