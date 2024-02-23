import { test, expect } from '@playwright/test';

test('app starts and has content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Et ole kirjautunut sisään')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kirjaudu sisään' })).toBeVisible();
});