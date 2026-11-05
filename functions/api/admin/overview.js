import { requireRole } from '../../_shared/auth.js';
import { error, json } from '../../_shared/http.js';

export async function onRequestGet({ request, env }) {
  if (!env.DB) return error('Admin database is not configured.', 503);
  const access = await requireRole(request, env, ['admin', 'principal']);
  if (access.response) return access.response;
  const [students, applications, payments, donations, courses, services] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'student' AND status = 'active'").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM enrollments WHERE status IN ('submitted', 'under_review')").first(),
    env.DB.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid'").first(),
    env.DB.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM donations WHERE status = 'paid'").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM courses WHERE status = 'active'").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM services WHERE status = 'active'").first(),
  ]);
  const recent = await env.DB.prepare(`
    SELECT enrollments.id, enrollments.full_name, courses.title AS course, enrollments.status,
      enrollments.payment_status, enrollments.created_at
    FROM enrollments JOIN courses ON courses.id = enrollments.course_id
    ORDER BY enrollments.created_at DESC LIMIT 10
  `).all();
  return json({
    students: Number(students?.count ?? 0),
    applications: Number(applications?.count ?? 0),
    verifiedPayments: Number(payments?.total ?? 0),
    verifiedDonations: Number(donations?.total ?? 0),
    courses: Number(courses?.count ?? 0),
    services: Number(services?.count ?? 0),
    recentApplications: recent.results ?? [],
  });
}