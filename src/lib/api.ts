export interface User {
  id: number;
  full_name: string;
  phone: string;
  country_code: string;
  email?: string;
  neighborhood?: string;
  profession?: string;
  role?: 'user' | 'admin';
}

export interface ApiQuestion {
  id: number;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
}

export interface QuizStartResponse {
  session_id: number;
  questions: ApiQuestion[];
  total_questions: number;
  time_limit: number;
  points_per_correct: number;
}

export interface AnswerResponse {
  is_correct: boolean;
  correct_answer: number;
  points_earned: number;
}

export interface QuizResults {
  session_id: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score: number;
  total_points: number;
  percentage: number;
  time_taken: number;
  user_name?: string;
  started_at?: string;
  ended_at?: string;
}

export interface ScheduleInfo {
  enabled: boolean;
  days: number[];
  start_time: string;
  end_time: string;
  timezone: string;
  next_session: {
    date: string;
    start: string;
    end: string;
    datetime: string;
    day_of_week: number;
  } | null;
}

export interface QuizSettings {
  is_open: boolean;
  time_limit: number;
  schedule: ScheduleInfo | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  neighborhood: string;
  best_score: number;
  total_points: number;
  total_quizzes: number;
  best_time: number | null;
}

export interface UserStats {
  user: User & { member_since: string };
  stats: {
    total_quizzes: number;
    best_score: number;
    total_points: number;
    average_score: number;
    total_correct: number;
    total_wrong: number;
    accuracy: number;
    rank: number | null;
  };
  history: {
    session_id: number;
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    score: number;
    time_taken: number;
    played_at: string;
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `/api/${endpoint}`;
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    },
    ...options,
  };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    const headers = { ...((options.headers as Record<string, string>) || {}) };
    delete headers['Content-Type'];
    defaultOptions.headers = headers;
  }

  const response = await fetch(url, defaultOptions);
  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Request failed');
  }

  return data.data as T;
}

// Auth
export async function sendPasscode(body: {
  phone: string;
  country_code: string;
  type: 'login' | 'register';
  full_name?: string;
}) {
  return request<{ message: string; phone: string; country_code: string; type: string; expires_in: number }>(
    'auth/send-passcode',
    { method: 'POST', body: JSON.stringify(body) }
  );
}

export async function verifyPasscode(body: {
  phone: string;
  country_code: string;
  passcode: string;
  full_name?: string;
  email?: string;
  profession?: string;
  neighborhood?: string;
}) {
  return request<{ user: User; is_new: boolean }>(
    'auth/verify-passcode',
    { method: 'POST', body: JSON.stringify(body) }
  );
}

// Quiz
export async function getQuizSettings() {
  return request<QuizSettings>('quiz/settings');
}

export async function startQuiz(userId: number) {
  return request<QuizStartResponse>('quiz/start', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function submitAnswer(sessionId: number, questionId: number, selectedAnswer: number) {
  return request<AnswerResponse>('quiz/answer', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, question_id: questionId, selected_answer: selectedAnswer }),
  });
}

export async function completeQuiz(sessionId: number, timeTaken: number) {
  return request<{ results: QuizResults; answers: any[] }>('quiz/complete', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, time_taken: timeTaken }),
  });
}

export async function getResults(sessionId: number) {
  return request<{ results: QuizResults; answers: any[] }>(`quiz/results?session_id=${sessionId}`);
}

// Leaderboard
export async function getLeaderboard(limit = 10, userId?: number) {
  let url = `leaderboard?limit=${limit}`;
  if (userId) url += `&user_id=${userId}`;
  return request<{ leaderboard: LeaderboardEntry[]; total: number; user_rank?: { rank: number; best_score: number; best_time: number | null } }>(url);
}

// User
export async function getUserStats(userId: number) {
  return request<UserStats>(`user/stats?user_id=${userId}`);
}

// Site content
export async function getSiteContent() {
  return request<{ content: any[] }>('site-content');
}

// ==================== ADMIN ====================

function adminHeaders(userId: number): Record<string, string> {
  return { 'X-Admin-User-Id': String(userId) };
}

export async function adminGetStats(adminId: number) {
  return request<any>('admin/stats', { headers: adminHeaders(adminId) });
}

export async function adminGetUsers(adminId: number, params: { page?: number; limit?: number; search?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  return request<{ users: any[]; pagination: any }>(`admin/users?${q}`, { headers: adminHeaders(adminId) });
}

export async function adminGetUser(adminId: number, id: number) {
  return request<{ user: any }>(`admin/users/show?id=${id}`, { headers: adminHeaders(adminId) });
}

export async function adminUpdateUser(adminId: number, data: any) {
  return request<{ user: any }>('admin/users/update', { method: 'PUT', headers: adminHeaders(adminId), body: JSON.stringify(data) });
}

export async function adminDeleteUser(adminId: number, id: number) {
  return request<null>('admin/users/delete', { method: 'DELETE', headers: adminHeaders(adminId), body: JSON.stringify({ id }) });
}

export async function adminGetQuestions(adminId: number, params: { page?: number; limit?: number; search?: string; category_id?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.category_id) q.set('category_id', params.category_id);
  return request<{ questions: any[]; pagination: any }>(`admin/questions?${q}`, { headers: adminHeaders(adminId) });
}

export async function adminGetQuestion(adminId: number, id: number) {
  return request<{ question: any }>(`admin/questions/show?id=${id}`, { headers: adminHeaders(adminId) });
}

export async function adminCreateQuestion(adminId: number, data: any) {
  return request<{ question: any }>('admin/questions/create', { method: 'POST', headers: adminHeaders(adminId), body: JSON.stringify(data) });
}

export async function adminUpdateQuestion(adminId: number, data: any) {
  return request<{ question: any }>('admin/questions/update', { method: 'PUT', headers: adminHeaders(adminId), body: JSON.stringify(data) });
}

export async function adminDeleteQuestion(adminId: number, id: number) {
  return request<null>('admin/questions/delete', { method: 'DELETE', headers: adminHeaders(adminId), body: JSON.stringify({ id }) });
}

export async function adminGetCategories(adminId: number) {
  return request<{ categories: any[] }>('admin/categories', { headers: adminHeaders(adminId) });
}

export async function adminCreateCategory(adminId: number, data: { name: string; description?: string }) {
  return request<{ category: any }>('admin/categories/create', { method: 'POST', headers: adminHeaders(adminId), body: JSON.stringify(data) });
}

export async function adminUpdateCategory(adminId: number, data: { id: number; name?: string; description?: string }) {
  return request<{ category: any }>('admin/categories/update', { method: 'PUT', headers: adminHeaders(adminId), body: JSON.stringify(data) });
}

export async function adminDeleteCategory(adminId: number, id: number) {
  return request<null>('admin/categories/delete', { method: 'DELETE', headers: adminHeaders(adminId), body: JSON.stringify({ id }) });
}

export async function adminGetSessions(adminId: number, params: { page?: number; limit?: number; user_id?: string; date?: string; sort?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.user_id) q.set('user_id', params.user_id);
  if (params.date) q.set('date', params.date);
  if (params.sort) q.set('sort', params.sort);
  return request<{ sessions: any[]; pagination: any }>(`admin/sessions?${q}`, { headers: adminHeaders(adminId) });
}

export async function adminGetSession(adminId: number, id: number) {
  return request<{ session: any; answers: any[] }>(`admin/sessions/show?id=${id}`, { headers: adminHeaders(adminId) });
}

export async function adminDeleteSession(adminId: number, id: number) {
  return request<null>('admin/sessions/delete', { method: 'DELETE', headers: adminHeaders(adminId), body: JSON.stringify({ id }) });
}

export async function adminGetSettings(adminId: number) {
  return request<{ settings: any }>('admin/settings', { headers: adminHeaders(adminId) });
}

export async function adminUpdateSettings(adminId: number, data: any) {
  return request<{ settings: any }>('admin/settings-update', { method: 'PUT', headers: adminHeaders(adminId), body: JSON.stringify(data) });
}

export async function adminGetSiteContent(adminId: number) {
  return request<{ content: any[] }>('admin/site-content', { headers: adminHeaders(adminId) });
}

export async function adminUpdateSiteContent(adminId: number, items: { id: number; value: string }[]) {
  return request<{ content: any[]; updated: number }>('admin/site-content/update', { method: 'PUT', headers: adminHeaders(adminId), body: JSON.stringify({ items }) });
}

export async function adminUploadImage(adminId: number, contentId: number, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('id', String(contentId));
  return request<{ item: any; path: string }>('admin/site-content/upload', {
    method: 'POST',
    headers: { 'X-Admin-User-Id': String(adminId) },
    body: formData,
  });
}

// Page Sections (Page Builder)
export async function getPageSections() {
  return request<{ sections: any[] }>('page-sections');
}

export async function adminGetPageSections(adminId: number) {
  return request<{ sections: any[] }>('admin/page-sections', { headers: adminHeaders(adminId) });
}

export async function adminCreatePageSection(adminId: number, data: { section_type: string; title?: string; content?: string; settings?: any; sort_order?: number }) {
  return request<{ section: any }>('admin/page-sections/create', { method: 'POST', headers: adminHeaders(adminId), body: JSON.stringify(data) });
}

export async function adminUpdatePageSection(adminId: number, data: { id: number; title?: string; content?: string; image_url?: string; settings?: any; is_visible?: boolean }) {
  return request<{ section: any }>('admin/page-sections/update', { method: 'PUT', headers: adminHeaders(adminId), body: JSON.stringify(data) });
}

export async function adminDeletePageSection(adminId: number, id: number) {
  return request<null>('admin/page-sections/delete', { method: 'DELETE', headers: adminHeaders(adminId), body: JSON.stringify({ id }) });
}

export async function adminReorderPageSections(adminId: number, order: number[]) {
  return request<{ sections: any[] }>('admin/page-sections/reorder', { method: 'PUT', headers: adminHeaders(adminId), body: JSON.stringify({ order }) });
}

export async function adminUploadSectionImage(adminId: number, sectionId: number, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('section_id', String(sectionId));
  return request<{ section: any; path: string }>('admin/page-sections/upload', {
    method: 'POST',
    headers: { 'X-Admin-User-Id': String(adminId) },
    body: formData,
  });
}
