import { test, expect } from '@playwright/test';

test('visitor can open the home page and navigate to login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'conduit', exact: true })).toBeVisible();
  await expect(page.getByText('A place to share your knowledge.')).toBeVisible();
  await page.getByRole('link', { name: /Login$/ }).click();
  await expect(page).toHaveURL(/#\/login$/);
  await expect(page.getByPlaceholder('Email', { exact: true })).toBeVisible();
});
