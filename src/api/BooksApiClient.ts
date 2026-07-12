import { APIRequestContext, APIResponse } from '@playwright/test';

/** Typed payloads for the Simple Books API. */
export interface OrderPayload {
  bookId: number;
  customerName: string;
}

/**
 * Thin client around the Simple Books API.
 *
 * Same philosophy as POM: endpoints and auth handling live here,
 * tests only express intent + assertions. If an endpoint changes,
 * we update one class.
 */
export class BooksApiClient {
  private readonly request: APIRequestContext;
  private token = '';

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /** POST /api-clients — register a client and store the Bearer token. */
  async authenticate(clientName: string, clientEmail: string): Promise<void> {
    const response = await this.request.post('/api-clients/', {
      data: { clientName, clientEmail },
    });
    if (!response.ok()) {
      throw new Error(`Auth failed: ${response.status()} ${await response.text()}`);
    }
    const body = (await response.json()) as { accessToken: string };
    this.token = body.accessToken;
  }

  private authHeader(): Record<string, string> {
    return { Authorization: `Bearer ${this.token}` };
  }

  /** POST /orders */
  async createOrder(payload: OrderPayload): Promise<APIResponse> {
    return this.request.post('/orders', {
      headers: this.authHeader(),
      data: payload,
    });
  }

  /** GET /orders/:orderId */
  async getOrder(orderId: string): Promise<APIResponse> {
    return this.request.get(`/orders/${orderId}`, {
      headers: this.authHeader(),
    });
  }

  /** PATCH /orders/:orderId */
  async updateOrder(orderId: string, customerName: string): Promise<APIResponse> {
    return this.request.patch(`/orders/${orderId}`, {
      headers: this.authHeader(),
      data: { customerName },
    });
  }

  /** DELETE /orders/:orderId */
  async deleteOrder(orderId: string): Promise<APIResponse> {
    return this.request.delete(`/orders/${orderId}`, {
      headers: this.authHeader(),
    });
  }
}
