import { test, expect } from '@playwright/test';

test('tags API returns tags from the database', async ({ request }) => {
  const response = await request.get('/api/tags');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ tags: expect.any(Array) });
});
