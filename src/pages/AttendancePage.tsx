import { useMemo, useState } from "react";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ATTENDANCE_BAR_THRESHOLD, ATTENDANCE_DEDUCTION, attendanceLevel } from "../data/attendanceData";
import { useCampusTranslation } from "../i18n/campusTranslations";
import { attendanceApi } from "../api/campuspulse";
import type { AttendanceStatus, AttendanceSummary } from "../api/types";
import PageLoading from "../components/PageLoading";
import { ApiEmpty, ApiError } from "../components/ApiState";

export default function AttendancePage() {
  const { text } = useCampusTranslation();
  const [marking, setMarking] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const summary = useQuery({ queryKey: ["attendance", "summary"], queryFn: attendanceApi.summary, retry: false });
  const records = useQuery({ queryKey: ["attendance", "records"], queryFn: () => attendanceApi.list(), retry: false });

  // The summary rollup carries the counts but not the faculty; the record
  // list populates it, so the two are joined on the course id.
  const facultyByCourse = useMemo(() => {
    const map = new Map<string, string>();
    for (const record of records.data ?? []) {
      if (typeof record.course === "object" && record.course.faculty) map.set(record.course._id, record.course.faculty);
    }
    return map;
  }, [records.data]);

  const courses = useMemo(() => summary.data?.courses ?? [], [summary.data]);

  // Weighted across every session rather than an average of the per-course
  // rates, so a course with two sessions cannot outweigh one with twenty.
  const overall = useMemo(() => {
    const totals = courses.reduce(
      (running, course) => ({
        attended: running.attended + course.present + course.late + course.excused,
        total: running.total + course.total,
      }),
      { attended: 0, total: 0 },
    );
    return totals.total ? Number(((totals.attended / totals.total) * 100).toFixed(2)) : null;
  }, [courses]);

  const barredCount = courses.filter((course) => course.attendanceRate < ATTENDANCE_BAR_THRESHOLD).length;

  // One tap per class. The response already carries the course's fresh
  // rollup, so the meter is updated straight from it instead of costing a
  // second round trip; the record list is refetched in the background.
  const mark = async (courseId: string, status: AttendanceStatus) => {
    if (marking) return;
    setMarking(courseId);
    try {
      const result = await attendanceApi.markToday(courseId, status);
      if (result.courseSummary) {
        queryClient.setQueryData<AttendanceSummary>(["attendance", "summary"], (current) => current && ({
          courses: current.courses.map((entry) => entry.course._id === courseId ? result.courseSummary! : entry),
        }));
      } else {
        await queryClient.invalidateQueries({ queryKey: ["attendance", "summary"] });
      }
      queryClient.invalidateQueries({ queryKey: ["attendance", "records"] });
    } finally {
      setMarking(null);
    }
  };

  if (summary.isLoading || records.isLoading) return <PageLoading />;
  if (summary.isError) return <ApiError error={summary.error} onRetry={() => summary.refetch()} />;
  if (records.isError) return <ApiError error={records.error} onRetry={() => records.refetch()} />;

  return (
    <div className="attendance-page">
      <section className="page-heading">
        <div><span className="page-kicker">{text("attendance.kicker")}</span><h1>{text("attendance.title")}</h1><p>{text("attendance.subtitle")}</p></div>
      </section>

      <section className="attendance-summary surface-card">
        <div className="attendance-score"><span>{text("attendance.overall")}</span><strong>{overall === null ? "—" : `${overall}%`}</strong><small>{text("attendance.courseCount", { count: courses.length })}</small></div>
        <div className="attendance-rule"><SchoolRoundedIcon /><span><strong>{ATTENDANCE_DEDUCTION}%</strong>{text("attendance.deduction")}</span></div>
        <div className={`bar-status ${barredCount ? "has-bar" : ""}`}><WarningAmberRoundedIcon /><span><strong>{barredCount}</strong>{text("attendance.barCourses")}</span></div>
      </section>

      <section className="section-heading-row compact"><div><span>{text("attendance.monitoring")}</span><h2>{text("attendance.byCourse")}</h2></div><small>{text("attendance.threshold")}</small></section>

      <section className="attendance-course-list">
        {courses.map((course) => {
          const level = attendanceLevel(course.absent, course.attendanceRate);
          return (
            <article className={`attendance-course-row severity-${level}`} key={course.course._id}>
              <div className="course-identity"><span>{course.course.code}</span><strong>{course.course.name}</strong><small>{facultyByCourse.get(course.course._id) ?? ""}</small></div>
              <div className="course-attendance-meter"><div><span>{text("attendance.attendance")}</span><strong>{course.attendanceRate}%</strong></div><div className="attendance-track"><i style={{ width: `${course.attendanceRate}%` }} /></div></div>
              <div className="absence-count"><strong>{course.absent}</strong><span>{text("attendance.absences")}</span></div>
              <div className="attendance-alert"><span>{text(`attendance.level.${level}`)}</span><p>{text(`attendance.message.${level}`)}</p></div>
              <div className="attendance-actions">
                <button onClick={() => mark(course.course._id, "present")} disabled={marking !== null}>{marking === course.course._id ? text("attendance.marking") : text("attendance.attended")}</button>
                <button onClick={() => mark(course.course._id, "absent")} disabled={marking !== null}>{text("attendance.missed")}</button>
              </div>
            </article>
          );
        })}
      </section>
      {!courses.length ? <ApiEmpty title="No attendance data" description="Attendance appears after the backend provisions courses for your academic profile." /> : null}
    </div>
  );
}
