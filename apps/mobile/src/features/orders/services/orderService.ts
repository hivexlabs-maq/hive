import { apiRequest } from '@/lib/api';
import type { Tables } from '@/types/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreateOrderItemPayload {
  photo_id: string;
  product_type: string;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  shipping_address?: string | null;
  notes?: string | null;
}

export interface CreateOrderResponse {
  order: Tables<'orders'>;
  items: Tables<'order_items'>[];
}

export interface OrderWithItems extends Tables<'orders'> {
  items: Tables<'order_items'>[];
}

export interface PaginatedOrdersResponse {
  orders: OrderWithItems[];
  next_cursor: string | null;
  has_more: boolean;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const orderService = {
  /**
   * Create a new order.
   *
   * The `idempotencyKey` is sent as an `X-Idempotency-Key` header so the
   * backend can safely deduplicate retried requests.
   */
  createOrder: async (
    items: CreateOrderItemPayload[],
    shippingAddress: string | null,
    notes: string | null,
    idempotencyKey: string,
  ): Promise<CreateOrderResponse> => {
    const body: CreateOrderPayload = {
      items,
      shipping_address: shippingAddress,
      notes,
    };

    return apiRequest<CreateOrderResponse>('/orders', {
      method: 'POST',
      body,
      headers: {
        'X-Idempotency-Key': idempotencyKey,
      },
    });
  },

  /**
   * Fetch a paginated list of orders for the authenticated user.
   */
  getOrders: async (
    cursor?: string,
    limit: number = 20,
  ): Promise<PaginatedOrdersResponse> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) {
      params.set('cursor', cursor);
    }

    return apiRequest<PaginatedOrdersResponse>(`/orders?${params.toString()}`);
  },

  /**
   * Fetch a single order by ID, including its items.
   */
  getOrderById: async (orderId: string): Promise<OrderWithItems> => {
    return apiRequest<OrderWithItems>(`/orders/${orderId}`);
  },
};
