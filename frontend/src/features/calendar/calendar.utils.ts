import { CALENDAR } from "./calendar.constants";
/** Formats a local calendar date without UTC day shifts.
 * @param {Date} date - Local day, preferably midday for DST-stable arithmetic.
 * @returns {string} ISO calendar date.
 */
export function localDateKey(date: Date): string {
  return (
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(CALENDAR.dateDigits, "0")}-` +
    String(date.getDate()).padStart(CALENDAR.dateDigits, "0")
  );
}
/** Produces six Monday-start weeks for consistent month navigation.
 * @param {Date} month - Selected local month.
 * @returns {{date: string, number: number, isCurrentMonth: boolean}[]} Visible days.
 */
export function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, CALENDAR.middayHour);
  const offset = (first.getDay() + CALENDAR.mondayOffset) % CALENDAR.daysPerWeek;
  return Array.from({ length: CALENDAR.cells }, (_, index) => {
    const date = new Date(month.getFullYear(), month.getMonth(), 1 - offset + index, CALENDAR.middayHour);
    return { date: localDateKey(date), number: date.getDate(), isCurrentMonth: date.getMonth() === month.getMonth() };
  });
}
/** Moves from a month anchor without end-of-month overflow.
 * @param {Date} month - Current month.
 * @param {number} offset - Signed month count.
 * @returns {Date} First day of the destination month at midday.
 */
export function shiftMonth(month: Date, offset: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + offset, 1, CALENDAR.middayHour);
}
