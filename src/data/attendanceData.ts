// Faculty attendance policy. These are institution rules, not backend data:
// the API reports rates and session counts, the thresholds below decide how
// a rate is presented to the student.
export const ATTENDANCE_DEDUCTION = 7.14;
export const ATTENDANCE_BAR_THRESHOLD = 70;

export type AttendanceLevel = "good" | "notice" | "warning" | "elevated" | "critical" | "barred";

/**
 * Escalates on the absence count the API reports, except that any course
 * under the bar threshold is barred regardless of how it got there.
 */
export function attendanceLevel(absences: number, rate: number): AttendanceLevel {
  if (rate < ATTENDANCE_BAR_THRESHOLD) return "barred";
  if (absences >= 4) return "critical";
  if (absences === 3) return "elevated";
  if (absences === 2) return "warning";
  if (absences === 1) return "notice";
  return "good";
}
