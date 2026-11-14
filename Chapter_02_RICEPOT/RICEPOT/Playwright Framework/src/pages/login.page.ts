import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;
  private readonly loginError: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByRole('textbox', { name: 'Email address' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign in', exact: true });
    this.loginError = page.getByText(
      'Your email, password, IP address or location did not match',
      { exact: true },
    );
  }

  async open(): Promise<void> {
    try {
      await this.page.goto('/#/login');
      await expect(this.emailInput).toBeVisible();
      await expect(this.passwordInput).toBeVisible();
      await expect(this.signInButton).toBeVisible();
    } catch (error) {
      throw new Error('Unable to open the Wingify login page', { cause: error });
    }
  }

  async enterCredentials(email: string, password: string): Promise<void> {
    try {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
    } catch (error) {
      throw new Error('Unable to enter login credentials', { cause: error });
    }
  }

  async submit(): Promise<void> {
    try {
      await this.signInButton.click();
    } catch (error) {
      throw new Error('Unable to submit the login form', { cause: error });
    }
  }

  async expectLoginRejected(): Promise<void> {
    try {
      await expect(this.loginError).toBeVisible();
    } catch (error) {
      throw new Error('The expected login rejection message was not displayed', {
        cause: error,
      });
    }
  }

  async expectLoginAccepted(): Promise<void> {
    try {
      await expect(this.page).not.toHaveURL(/#\/login(?:$|[?&])/);
    } catch (error) {
      throw new Error('Login did not navigate away from the login page', {
        cause: error,
      });
    }
  }
}
