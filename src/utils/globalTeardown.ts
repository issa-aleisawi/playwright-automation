/**
 * Runs exactly once after the entire test suite completes.
 * Satisfies the "Global Logging" requirement (suite finish).
 */
async function globalTeardown(): Promise<void> {
  console.log('='.repeat(60));
  console.log(`[GLOBAL TEARDOWN] Test suite execution FINISHED at ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default globalTeardown;
