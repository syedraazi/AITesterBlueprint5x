import { test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { LoginPage } from '../src/pages/login.page';

test('empty credentials are rejected with an actionable error', async ({ page }) => {
  await allure.epic('Authentication');
  await allure.feature('Wingify login');
  await allure.story('Invalid credentials');
  await allure.severity('normal');

  const login = new LoginPage(page);

  try {
    await login.open();
    await login.submit();
    await login.expectLoginRejected();
  } catch (error) {
    throw new Error('Invalid login test failed', { cause: error });
  }
});
