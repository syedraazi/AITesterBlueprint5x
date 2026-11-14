import { test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { LoginPage } from '../src/pages/login.page';

test('valid credentials allow access beyond the login page', async ({ page }) => {
  await allure.epic('Authentication');
  await allure.feature('Wingify login');
  await allure.story('Valid credentials');
  await allure.severity('critical');

  const email = process.env.WINGIFY_EMAIL;
  const password = process.env.WINGIFY_PASSWORD;
  if (!email || !password) {
    test.skip(true, 'Set WINGIFY_EMAIL and WINGIFY_PASSWORD to run this test');
    return;
  }

  const login = new LoginPage(page);

  try {
    await login.open();
    await login.enterCredentials(email, password);
    await login.submit();
    await login.expectLoginAccepted();
  } catch (error) {
    throw new Error('Valid login test failed', { cause: error });
  }
});
