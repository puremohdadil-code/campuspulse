export interface ApiUser {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

export interface UserSettings {
  _id: string;
  user: string;
  interfaceLanguage: "en" | "ms" | "ar";
  timezone: string;
  dailySummary: boolean;
  deadlineNotifications: boolean;
  courseNotifications: boolean;
  eventNotifications: boolean;
  scholarshipNotifications: boolean;
  notificationFrequency: "all" | "important" | "critical";
  preferredNotificationTime: string;
  createdAt: string;
  updatedAt: string;
}

export type EditableSettings = Partial<Pick<UserSettings,
  "interfaceLanguage" | "timezone" | "dailySummary" | "deadlineNotifications" |
  "courseNotifications" | "eventNotifications" | "scholarshipNotifications" |
  "notificationFrequency" | "preferredNotificationTime"
>>;

export interface UserAcademic {
  _id: string;
  user: string;
  studentId?: string;
  university?: string;
  faculty?: string;
  major?: string;
  yearOfStudy?: number;
  courses: string[];
  interests: string[];
  /** True once the backend auto-generated this student's content + attendance. */
  provisioned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EditableAcademic = Partial<Pick<UserAcademic,
  "studentId" | "university" | "faculty" | "major" | "yearOfStudy" | "courses" | "interests"
>>;

export interface Course {
  _id: string;
  code: string;
  name: string;
  description?: string;
  faculty?: string;
  tags: string[];
  creditHours?: number;
  semester?: string;
  academicYear?: string;
  user?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CourseInput = Pick<Course, "code" | "name"> & Partial<Pick<Course,
  "description" | "faculty" | "tags" | "creditHours" | "semester" | "academicYear"
>>;

export type CampusContentType = "announcement" | "deadline" | "event" | "scholarship";

/** Delivery channel an item arrived through. Auto-generated items use one of
 *  these; a hand-created item may carry any string. */
export type CampusSource = "Microsoft Teams" | "Outlook" | "Blackboard" | "Moodle" | "Student Portal" | "Email";

/** The caller's own state on a campus-content item, derived from their
 *  notification. `null` when the AI never surfaced it to them. */
export interface ContentMyState {
  notificationId: string;
  read: boolean;
  dismissed: boolean;
  progress: number;
  completed: boolean;
  relevanceScore: number | null;
  priority: NotificationPriority | null;
}

export interface CampusContent {
  _id: string;
  title: string;
  description?: string;
  type: CampusContentType;
  source?: string;
  course?: string | null;
  startDate?: string | null;
  deadline?: string | null;
  location?: string;
  url?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  /** Present only on GET /campus-content responses. */
  myState?: ContentMyState | null;
}

export type CampusContentInput = Pick<CampusContent, "title" | "type"> & Partial<Pick<CampusContent,
  "description" | "source" | "course" | "startDate" | "deadline" | "location" | "url" | "tags"
>>;

export interface CalendarEntry {
  contentId: string;
  title: string;
  type: CampusContentType;
  kind: "start" | "deadline";
  date: string;
  location: string | null;
}

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface UserNotification {
  _id: string;
  user: string;
  content: CampusContent;
  relevanceScore: number;
  priority: NotificationPriority;
  reason?: string;
  read: boolean;
  dismissed: boolean;
  /** 0-100, student-controlled; 100 also marks the item read. */
  progress: number;
  completed: boolean;
  completedAt?: string | null;
  readAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyBrief {
  summary: string;
  items: Array<{ notificationId: string; title: string; summary: string; priority: NotificationPriority }>;
}

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

/** GET /attendance populates `course` with code, name and faculty. */
export interface AttendanceCourseRef {
  _id: string;
  code?: string;
  name?: string;
  faculty?: string;
}

export interface AttendanceRecord {
  _id: string;
  user: string;
  course: string | AttendanceCourseRef;
  date: string;
  status: AttendanceStatus;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceCourseSummary {
  course: { _id: string; code?: string; name?: string };
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  /** Integer percentage; (present + late + excused) / total, 100 when total is 0. */
  attendanceRate: number;
}

export interface AttendanceSummary {
  courses: AttendanceCourseSummary[];
}

export interface AttendanceInput {
  course: string;
  date: string;
  status?: AttendanceStatus;
  note?: string;
}

export type AttendanceUpdate = Partial<Pick<AttendanceRecord, "date" | "status" | "note">>;

/** GET /notifications/messages — the feed reshaped as an inbox. */
export interface CampusMessage {
  /** The notification _id — use it for read / progress / dismiss. */
  id: string;
  contentId: string | null;
  source: CampusSource;
  type: CampusContentType | null;
  courseCode: string | null;
  courseName: string | null;
  subject: string;
  preview: string;
  priority: NotificationPriority;
  relevanceScore: number;
  reason: string | null;
  unread: boolean;
  progress: number;
  completed: boolean;
  /** True for deadline items — render a progress bar. */
  trackable: boolean;
  receivedAt: string;
  startDate: string | null;
  deadline: string | null;
}

export interface StudyPlanTask {
  title: string;
  course: string;
  durationMinutes: number;
  priority: NotificationPriority;
}

export interface StudyPlanDay {
  date: string;
  tasks: StudyPlanTask[];
}

export interface StudyPlan {
  plan: StudyPlanDay[];
}

export interface StudyPlanInput {
  availableHoursPerDay?: number;
  preferredStudyTime?: string;
}

/** POST /attendance/mark — the write plus the course's fresh rate. */
export interface AttendanceMarkResult {
  record: AttendanceRecord;
  courseSummary: AttendanceCourseSummary | null;
}
