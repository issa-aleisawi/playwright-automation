import { test, expect } from '../../src/fixtures/pomFixtures';
import testData from '../../src/data/testData.json';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('TC_UI_001 - Valid Login navigates to Products page', async ({ loginPage, productsPage }) => {
    await loginPage.login(testData.validUser.username, testData.validUser.password);
    await productsPage.assertLoaded();
  });

  /**
   * TC_UI_002 — Data-driven: the scenarios live in testData.json,
   * so adding a new negative case requires zero code changes.
   */
  for (const scenario of testData.invalidLoginScenarios) {
    test(`TC_UI_002 - Invalid Login: ${scenario.scenario}`, async ({ loginPage }) => {
      await loginPage.login(scenario.username, scenario.password);
      await loginPage.assertErrorMessage(scenario.expectedError);
    });
  }
});
