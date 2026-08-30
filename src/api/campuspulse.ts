import axios from "axios";
import http from "./http";
import { AI, ATTENDANCE, AUTH, CALENDAR, CAMPUS_CONTENT, COURSES, HEALTH, NOTIFICATIONS, USER } from "./endpoint";
import type {
  ApiErrorBody,
  ApiUser,
  AttendanceInput,
  AttendanceMarkResult,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
  AttendanceUpdate,
  CampusMessage,
  CalendarEntry,
  CampusContent,
  CampusContentInput,
  Course,
  CourseInput,
  DailyBrief,
  EditableAcademic,
  StudyPlan,
  StudyPlanInput,
  EditableSettings,
  UserAcademic,
  UserNotification,
  UserSettings,
} from "./types";

export function apiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return error instanceof Error ? error.message : fallback;
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(" · ") : message || fallback;
}

export function apiStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function apiCode(error: unknown) {
  return axios.isAxiosError<ApiErrorBody>(error) ? error.response?.data?.error : undefined;
}

export function isNetworkError(error: unknown) {
  return axios.isAxiosError(error) && !error.response;
}

export const authApi = {
  health: () => http.get<{ status: string; timestamp: string }>(HEALTH).then((r) => r.data),
  signup: (payload: { firstName: string; lastName: string; addressLine: string; email: string; password: string }) =>
    http.post<{ message: string; requiresVerification: boolean; user: ApiUser }>(AUTH.signup, payload).then((r) => r.data),
  login: (payload: { email: string; password: string }) =>
    http.post<{ user: ApiUser }>(AUTH.login, payload).then((r) => r.data),
  me: () => http.get<ApiUser>(AUTH.me).then((r) => r.data),
  logout: () => http.post<{ message: string }>(AUTH.logout).then((r) => r.data),
  verifyEmail: (payload: { email: string; otp: string }) => http.post<{ message: string }>(AUTH.verifyEmail, payload).then((r) => r.data),
  resendVerification: (email: string) => http.post<{ message: string }>(AUTH.resendVerification, { email }).then((r) => r.data),
  requestPasswordReset: (email: string) => http.post<{ message: string }>(AUTH.forgotPassword, { email }).then((r) => r.data),
  resetPassword: (payload: { token: string; password: string }) => http.post<{ message: string }>(AUTH.resetPassword, payload).then((r) => r.data),
};

export const settingsApi = {
  get: () => http.get<{ settings: UserSettings }>(USER.settings).then((r) => r.data.settings),
  update: (payload: EditableSettings) => http.put<{ message: string; settings: UserSettings }>(USER.settings, payload).then((r) => r.data.settings),
};

export const academicApi = {
  get: () => http.get<{ academic: UserAcademic }>(USER.academic).then((r) => r.data.academic),
  update: (payload: EditableAcademic) => http.put<{ message: string; academic: UserAcademic }>(USER.academic, payload).then((r) => r.data.academic),
};

export interface CourseFilters { code?: string; name?: string; faculty?: string; semester?: string; academicYear?: string; tags?: string }
export const coursesApi = {
  list: (filters: CourseFilters = {}) => http.get<Course[]>(COURSES, { params: filters }).then((r) => r.data),
  byCode: (code: string) => http.get<Course>(`${COURSES}/code/${encodeURIComponent(code)}`).then((r) => r.data),
  byId: (id: string) => http.get<Course>(`${COURSES}/${id}`).then((r) => r.data),
  create: (payload: CourseInput) => http.post<Course>(COURSES, payload).then((r) => r.data),
  update: (id: string, payload: Partial<CourseInput>) => http.patch<Course>(`${COURSES}/${id}`, payload).then((r) => r.data),
  remove: (id: string) => http.delete<Course>(`${COURSES}/${id}`).then((r) => r.data),
};

export interface ContentFilters { type?: CampusContent["type"]; tag?: string; upcoming?: boolean }
export const contentApi = {
  list: (filters: ContentFilters = {}) => http.get<CampusContent[]>(CAMPUS_CONTENT, { params: filters }).then((r) => r.data),
  byId: (id: string) => http.get<CampusContent>(`${CAMPUS_CONTENT}/${id}`).then((r) => r.data),
  create: (payload: CampusContentInput) => http.post<CampusContent>(CAMPUS_CONTENT, payload).then((r) => r.data),
  update: (id: string, payload: Partial<CampusContentInput>) => http.put<CampusContent>(`${CAMPUS_CONTENT}/${id}`, payload).then((r) => r.data),
  remove: (id: string) => http.delete<CampusContent>(`${CAMPUS_CONTENT}/${id}`).then((r) => r.data),
};

export const calendarApi = {
  get: (from?: string, to?: string) => http.get<{ from: string; to: string; entries: CalendarEntry[] }>(CALENDAR, { params: { from, to } }).then((r) => r.data),
};

export interface AttendanceFilters { course?: string; from?: string; to?: string }
export const attendanceApi = {
  list: (filters: AttendanceFilters = {}) => http.get<AttendanceRecord[]>(ATTENDANCE, { params: filters }).then((r) => r.data),
  summary: () => http.get<AttendanceSummary>(`${ATTENDANCE}/summary`).then((r) => r.data),
  byId: (id: string) => http.get<AttendanceRecord>(`${ATTENDANCE}/${id}`).then((r) => r.data),
  // One-tap "attended / missed today". Normalised to the day, so tapping
  // twice edits one record, and the response already carries the course's
  // new rate - no follow-up GET needed.
  markToday: (course: string, status: AttendanceStatus = "present", date?: string) =>
    http.post<AttendanceMarkResult>(`${ATTENDANCE}/mark`, date ? { course, status, date } : { course, status }).then((r) => r.data),
  // Upsert on (user, course, date): re-posting the same session date edits
  // that record rather than adding a duplicate.
  mark: (payload: AttendanceInput) => http.post<AttendanceRecord>(ATTENDANCE, payload).then((r) => r.data),
  update: (id: string, payload: AttendanceUpdate) => http.patch<AttendanceRecord>(`${ATTENDANCE}/${id}`, payload).then((r) => r.data),
  remove: (id: string) => http.delete<AttendanceRecord>(`${ATTENDANCE}/${id}`).then((r) => r.data),
};

export const notificationsApi = {
  personalize: () => http.post<{ message: string; created: number; updated: number; skipped: number }>(`${NOTIFICATIONS}/personalize`).then((r) => r.data),
  // `content` is a populated reference. When the campus-content item behind
  // a notification no longer exists the server still returns the row, with
  // content null — and every consumer reads notification.content.*, so those
  // rows are dropped here instead of being guarded at each call site.
  list: (unread = false) => http.get<{ notifications: UserNotification[] }>(NOTIFICATIONS, { params: unread ? { unread: true } : {} })
    .then((r) => r.data.notifications.filter((notification) => notification.content)),
  dailyBrief: () => http.get<DailyBrief>(`${NOTIFICATIONS}/daily-brief`).then((r) => r.data),
  // The same feed reshaped as an inbox (channel, course, subject, preview).
  messages: () => http.get<{ messages: CampusMessage[]; unreadCount: number }>(`${NOTIFICATIONS}/messages`).then((r) => r.data),
  studyPlan: (payload: StudyPlanInput = {}) => http.post<StudyPlan>(`${NOTIFICATIONS}/study-plan`, payload).then((r) => r.data),
  explain: (id: string) => http.get<{ explanation: string; factors: string[] }>(`${NOTIFICATIONS}/${id}/explain`).then((r) => r.data),
  markRead: (id: string) => http.patch<UserNotification>(`${NOTIFICATIONS}/${id}/read`).then((r) => r.data),
  // 100 also flips completed and read on the server.
  setProgress: (id: string, progress: number) => http.patch<UserNotification>(`${NOTIFICATIONS}/${id}/progress`, { progress }).then((r) => r.data),
  // Addressed by campus-content id: creates the notification when the AI
  // never surfaced the item, so it doubles as "add this to my tasks".
  trackContent: (contentId: string, progress: number) =>
    http.patch<UserNotification>(`${NOTIFICATIONS}/by-content/${contentId}/progress`, { progress }).then((r) => r.data),
  dismiss: (id: string) => http.patch<UserNotification>(`${NOTIFICATIONS}/${id}/dismiss`).then((r) => r.data),
  // Built from the stored feed, not the AI — no body, always mails the
  // account address. `items: 0` still means the send succeeded.
  emailBrief: () => http.post<{ message: string; to: string; items: number }>(`${NOTIFICATIONS}/email-brief`).then((r) => r.data),
};

// Debug echo endpoint. Not part of the product flow; kept so the client
// covers every documented route.
export const aiApi = {
  test: (message: string) => http.post<{ response: string }>(`${AI}/test`, { message }).then((r) => r.data),
};
