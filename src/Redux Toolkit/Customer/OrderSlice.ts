// src/Redux Toolkit/slices/orderSlice.ts

import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import axios from "axios";
import { type RootState } from "../Store";
import {
  type Order,
  type OrderItem,
  type OrderState,
} from "../../types/orderTypes";
import { type Address } from "../../types/userTypes";
import { api } from "../../Config/Api";
import { type ApiResponse } from "../../types/authTypes";

const API_URL = "/api/orders";

const initialState: OrderState = {
  orders: [],
  orderItem: null,
  currentOrder: null,
  paymentOrder: null,
  loading: false,
  error: null,
  orderCanceled: false,
};

/* ============================
   Fetch user order history
============================ */
export const fetchUserOrderHistory = createAsyncThunk<
  Order[],
  string,
  { rejectValue: string }
>("orders/fetchUserOrderHistory", async (jwt, { rejectWithValue }) => {
  try {
    const response = await api.get<Order[]>(`${API_URL}/user`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.error || "Failed to fetch order history"
    );
  }
});

/* ============================
   Fetch order by ID
============================ */
export const fetchOrderById = createAsyncThunk<
  Order,
  { orderId: string; jwt: string },
  { rejectValue: string }
>("orders/fetchOrderById", async ({ orderId, jwt }, { rejectWithValue }) => {
  try {
    const response = await api.get<Order>(`${API_URL}/${orderId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch {
    return rejectWithValue("Failed to fetch order");
  }
});

/* ============================
   Create order
============================ */
export const createOrder = createAsyncThunk<
  Order,
  { address: Address; jwt: string; paymentGateway: string },
  { rejectValue: string }
>("orders/createOrder", async ({ address, jwt, paymentGateway }, { rejectWithValue }) => {
  try {
    const response = await api.post<Order>(
      API_URL,
      { shippingAddress: address },
      {
        headers: { Authorization: `Bearer ${jwt}` },
        params: { paymentMethod: paymentGateway },
      }
    );

    if ((response.data as any)?.payment_link_url) {
      window.location.href = (response.data as any).payment_link_url;
    }

    return response.data;
  } catch {
    return rejectWithValue("Failed to create order");
  }
});

/* ============================
   Fetch order item
============================ */
export const fetchOrderItemById = createAsyncThunk<
  OrderItem,
  { orderItemId: string; jwt: string },
  { rejectValue: string }
>("orders/fetchOrderItemById", async ({ orderItemId, jwt }, { rejectWithValue }) => {
  try {
    const response = await api.get<OrderItem>(
      `${API_URL}/item/${orderItemId}`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data;
  } catch {
    return rejectWithValue("Failed to fetch order item");
  }
});

/* ============================
   Payment success
============================ */
export const paymentSuccess = createAsyncThunk<
  ApiResponse,
  { paymentId: string; jwt: string; paymentLinkId: string },
  { rejectValue: string }
>("orders/paymentSuccess", async ({ paymentId, jwt, paymentLinkId }, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse>(
      `/api/payment/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
        params: { paymentLinkId },
      }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Payment failed"
    );
  }
});

/* ============================
   Cancel order
============================ */
export const cancelOrder = createAsyncThunk<
  Order,
  { orderId: string; jwt: string },
  { rejectValue: string }
>("orders/cancelOrder", async ({ orderId, jwt }, { rejectWithValue }) => {
  try {
    const response = await api.put<Order>(
      `${API_URL}/${orderId}/cancel`,
      {},
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data || "Cancel order failed"
      );
    }
    return rejectWithValue("Cancel order failed");
  }
});

/* ============================
   Slice
============================ */
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // order history
      .addCase(fetchUserOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // order by id
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      // order item
      .addCase(fetchOrderItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.orderItem = action.payload;
      })

      // payment
      .addCase(paymentSuccess.fulfilled, (state) => {
        state.loading = false;
      })

      // cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderCanceled = true;
        state.currentOrder = action.payload;
        state.orders = state.orders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
      });
  },
});

export default orderSlice.reducer;

/* ============================
   Selectors
============================ */
export const selectOrders = (state: RootState) => state.orders.orders;
export const selectCurrentOrder = (state: RootState) =>
  state.orders.currentOrder;
export const selectPaymentOrder = (state: RootState) =>
  state.orders.paymentOrder;
export const selectOrdersLoading = (state: RootState) =>
  state.orders.loading;
export const selectOrdersError = (state: RootState) =>
  state.orders.error;
