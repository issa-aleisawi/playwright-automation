import { test, expect, request, APIRequestContext } from '@playwright/test';
import { BooksApiClient } from '../../src/api/BooksApiClient';
import { RandomGenerator } from '../../src/utils/randomGenerator';
import testData from '../../src/data/testData.json';

/**
 * API order lifecycle: create → read → update → delete.
 *
 * describe.serial because these four TCs intentionally share state
 * (the orderId from TC_API_001) and must run in order — the assessment
 * defines them as a dependent chain.
 */
test.describe.serial('Simple Books API - Order lifecycle', () => {
  let apiContext: APIRequestContext;
  let client: BooksApiClient;
  let orderId: string;

  const customerName = RandomGenerator.customerName();
  const updatedCustomerName = `${RandomGenerator.customerName()} (updated)`;

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL: 'https://simple-books-api.click',
    });
    client = new BooksApiClient(apiContext);
    // Dynamic email from our required utility → token is fresh every run
    await client.authenticate('QA Automation', RandomGenerator.email());
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('TC_API_001 - [POST] Authenticate and create a new book order', async () => {
    const response = await client.createOrder({
      bookId: testData.api.bookId,
      customerName,
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as { created: boolean; orderId: string };
    expect(body.created).toBe(true);
    expect(body.orderId).toEqual(expect.any(String));
    expect(body.orderId.length).toBeGreaterThan(0);

    orderId = body.orderId; // shared with the tests below
  });

  test('TC_API_002 - [GET] Fetch the newly created order', async () => {
    const response = await client.getOrder(orderId);

    expect(response.status()).toBe(200);

    const order = (await response.json()) as { id: string; bookId: number; customerName: string };
    expect(order.id).toBe(orderId);
    expect(order.bookId).toBe(testData.api.bookId);
    expect(order.customerName).toBe(customerName);
  });

  test('TC_API_003 - [PATCH] Update customer name and verify persistence', async () => {
    const patchResponse = await client.updateOrder(orderId, updatedCustomerName);
    expect(patchResponse.status()).toBe(204);

    // Follow-up GET proves the change was actually persisted
    const getResponse = await client.getOrder(orderId);
    expect(getResponse.status()).toBe(200);
    const order = (await getResponse.json()) as { customerName: string };
    expect(order.customerName).toBe(updatedCustomerName);
  });

  test('TC_API_004 - [DELETE] Remove order and verify 404 on follow-up GET', async () => {
    const deleteResponse = await client.deleteOrder(orderId);
    expect(deleteResponse.status()).toBe(204);

    const getResponse = await client.getOrder(orderId);
    expect(getResponse.status()).toBe(404);
  });
});
