import { test, expect } from './fixtures';

test('app starts and has content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Surma', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kirjaudu sisään' })).toBeVisible();
});