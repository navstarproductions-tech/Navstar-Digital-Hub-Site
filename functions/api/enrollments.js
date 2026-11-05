import { getSession } from '../_shared/auth.js';
import { error, isSameOrigin, json, normalizePhone, readJson, safeString, uuid } from '../_shared/http.js';
import { rateLimited } from '../_shared/rate-limit.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Admissions service is not configured.', 503);
  if (await rateLimited(env.DB, request, 'enrollment', { maximum: 5, minutes: 30 })) return error('Too many applications from this connection. Try again later.', 429);

  let body;
  try { body = await readJson(request, 16384); } catch { return error('Invalid request body.'); }
  const courseId = safeString(body.courseId, 80);
  const course = await env.DB.prepare('SELECT id, title, price FROM courses WHERE id = ? AND status = ?').bind(courseId, 'active').first();
  if (!course) return error('Selected course is not available.', 404);

  const fullName = safeString(body.fullName, 120);
  const email = safeString(body.email, 254).toLowerCase();
  const phone = normalizePhone(body.phone);
  const dateOfBirth = safeString(body.dateOfBirth, 10);
  const studyMode = safeString(body.studyMode, 40);
  const educationLevel = safeString(body.educationLevel, 40);
  const county = safeString(body.county, 80);
  const town = safeString(body.town, 80);
  const emergencyContactName = safeString(body.emergencyContactName, 120);
  const emergencyContactPhone = normalizePhone(body.emergencyContactPhone);
  const consent = body.consent === true || body.consent === 'on';
  if (fullName.length < 2 || !emailPattern.test(email) || !phone || !datePattern.test(dateOfBirth) || !studyMode || !educationLevel || !county || !town || !emergencyContactName || !emergencyContactPhone || !consent) {
    return error('Complete all required fields with valid contact details.');
  }

  const id = uuid();
  await env.DB.prepare(`
    INSERT INTO enrollments (
      id, course_id, full_name, email, phone, date_of_birth, identity_number, gender, nationality,
      study_mode, education_level, preferred_intake, experience, county, town, address,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, support_needs, consent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    id, course.id, fullName, email, phone, dateOfBirth, safeString(body.identityNumber, 80) || null,
    safeString(body.gender, 40) || null, safeString(body.nationality, 80) || null, studyMode, educationLevel,
    safeString(body.preferredIntake, 20) || null, safeString(body.experience, 2000) || null, county, town,
    safeString(body.address, 250) || null, emergencyContactName, emergencyContactPhone,
    safeString(body.emergencyContactRelationship, 80) || null, safeString(body.supportNeeds, 2000) || null,
  ).run();

  const staff = await env.DB.prepare("SELECT id FROM users WHERE role IN ('admin', 'admissions') AND status = 'active'").all();
  if (staff.results?.length) {
    await env.DB.batch(staff.results.map((user) => env.DB.prepare('INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)')
      .bind(uuid(), user.id, 'New application', `An application was received for ${course.title}.`)));
  }
  return json({ id, status: 'submitted', course: { id: course.id, title: course.title, amount: course.price } }, 201);
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return error('Admissions service is not configured.', 503);
  const user = await getSession(request, env);
  if (!user) return error('Sign in required.', 401);
  let query;
  if (['admin', 'admissions', 'principal'].includes(user.role)) {
    query = env.DB.prepare(`SELECT id, course_id, full_name, email, phone, status, payment_status, created_at FROM enrollments ORDER BY created_at DESC LIMIT 200`);
  } else if (user.role === 'student') {
    query = env.DB.prepare(`SELECT id, course_id, full_name, email, phone, status, payment_status, created_at FROM enrollments WHERE email = ? ORDER BY created_at DESC`).bind(user.email);
  } else {
    return error('Tutor access must be assigned to specific classes before student records are visible.', 403);
  }
  const result = await query.all();
  return json({ enrollments: result.results ?? [] });
}