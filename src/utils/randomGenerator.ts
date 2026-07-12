/**
 * Random data generator — required custom utility.
 * Used for dynamic API payloads (unique client emails, customer names)
 * and any unique UI inputs.
 */
export class RandomGenerator {
  /** Random lowercase alphanumeric string of a given length. */
  static string(length = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }

  /** Unique email — timestamp guarantees uniqueness across runs. */
  static email(): string {
    return `qa.${this.string(6)}.${Date.now()}@testmail.com`;
  }

  /** Random integer between min and max (inclusive). */
  static number(min = 1, max = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Random human-looking customer name for order payloads. */
  static customerName(): string {
    const first = ['Omar', 'Lina', 'Sami', 'Rana', 'Khaled', 'Dana'];
    const last = ['Haddad', 'Nasser', 'Khoury', 'Salem', 'Amari'];
    return `${first[this.number(0, first.length - 1)]} ${last[this.number(0, last.length - 1)]}`;
  }
}
