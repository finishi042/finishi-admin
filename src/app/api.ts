/**
 * Admin API client — cookie-based authentication.
 * Uses `credentials: 'include'` so the browser sends/receives httpOnly cookies automatically.
 * No localStorage token handling needed.
 */
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Only set Content-Type for requests that have a body
  const headers: Record<string, string> = { ...(init.headers as Record<string, string> ?? {}) }
  if (init.body) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  // Handle 401 — session expired, try refresh
  if (res.status === 401 && !path.includes('/auth/')) {
    const refreshed = await adminAuthApi.refresh()
    if (refreshed) {
      const retryHeaders: Record<string, string> = { ...(init.headers as Record<string, string> ?? {}) }
      if (init.body) retryHeaders['Content-Type'] = 'application/json'
      const retry = await fetch(`${BASE}${path}`, {
        ...init,
        credentials: 'include',
        headers: retryHeaders,
      })
      const retryJson = await retry.json()
      if (!retry.ok) throw new Error(retryJson?.error?.message ?? `HTTP ${retry.status}`)
      return retryJson.data as T
    }
  }

  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`)
  return json.data as T
}

const get = <T>(path: string) => request<T>(path)
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })
const put = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
const patch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
const del = <T>(path: string) => request<T>(path, { method: 'DELETE' })

// ── Admin Auth API ────────────────────────────────────────────────────────

export interface AdminUser {
  admin_id: string
  email: string
  full_name: string
  role: 'admin' | 'super_admin'
}

export const adminAuthApi = {
  login: (body: { email: string; password: string }) =>
    post<AdminUser>('/auth/admin/login', body),

  logout: () => post<{ logged_out: true }>('/auth/admin/logout', {}),

  refresh: async (): Promise<boolean> => {
    try {
      await post<{ refreshed: true }>('/auth/refresh', {})
      return true
    } catch {
      return false
    }
  },

  me: () => get<AdminUser>('/auth/me'),

  /** Super-admin only: register a new admin */
  register: (body: { email: string; password: string; full_name: string; role?: string }) =>
    post<AdminUser>('/auth/admin/register', body),
}

// ── Admin Dashboard API ───────────────────────────────────────────────────

export const adminApi = {
  // Dashboard
  getDashboard: () => get<any>('/admin/dashboard'),

  // Users
  getUsers: (params?: { search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return get<any>(`/admin/users?${q}`)
  },
  createUser: (body: { full_name: string; email: string; role: string }) =>
    post<any>('/admin/users', body),
  updateUser: (id: string, body: Record<string, unknown>) => put<any>(`/admin/users/${id}`, body),
  suspendUser: (id: string, reason?: string) =>
    post<any>(`/admin/users/${id}/suspend`, { reason }),
  deleteUser: (id: string) => del<any>(`/admin/users/${id}`),

  // Skills
  getSkills: () => get<any>('/admin/skills'),
  createSkill: (body: { name: string; description: string; color: string }) =>
    post<any>('/admin/skills', body),
  updateSkill: (id: string, body: Record<string, unknown>) => put<any>(`/admin/skills/${id}`, body),
  deleteSkill: (id: string) => del<any>(`/admin/skills/${id}`),

  // Learning Paths
  getLearningPaths: (status?: string) => {
    const q = status ? `?status=${status}` : ''
    return get<any>(`/admin/learning-paths${q}`)
  },
  getLearningPath: (id: string) => get<any>(`/admin/learning-paths/${id}`),
  createLearningPath: (body: {
    name: string; description: string; skill_name: string; status: string
  }) => post<any>('/admin/learning-paths', body),
  updateLearningPath: (id: string, body: Record<string, unknown>) =>
    put<any>(`/admin/learning-paths/${id}`, body),
  deleteLearningPath: (id: string) => del<any>(`/admin/learning-paths/${id}`),

  // Lessons
  getLessons: (params?: { skill?: string; status?: string; search?: string; course_id?: string }) => {
    const q = new URLSearchParams()
    if (params?.skill) q.set('skill', params.skill)
    if (params?.status) q.set('status', params.status)
    if (params?.search) q.set('search', params.search)
    if (params?.course_id) q.set('course_id', params.course_id)
    return get<any>(`/admin/lessons?${q}`)
  },
  getLesson: (id: string) => get<any>(`/admin/lessons/${id}`),
  createLesson: (body: {
    title: string; skill_name: string; description: string; duration_mins: number; status: string; course_id?: string
  }) => post<any>('/admin/lessons', body),
  updateLesson: (id: string, body: Record<string, unknown>) =>
    put<any>(`/admin/lessons/${id}`, body),
  deleteLesson: (id: string) => del<any>(`/admin/lessons/${id}`),

  // Lesson Quizzes
  getLessonQuiz: (lessonId: string) => get<any>(`/admin/lessons/${lessonId}/quiz`),
  createLessonQuiz: (lessonId: string, body: { title: string; questions: any[]; passing_score: number }) =>
    post<any>(`/admin/lessons/${lessonId}/quiz`, body),
  updateLessonQuiz: (lessonId: string, body: Record<string, unknown>) =>
    put<any>(`/admin/lessons/${lessonId}/quiz`, body),
  deleteLessonQuiz: (lessonId: string) => del<any>(`/admin/lessons/${lessonId}/quiz`),

  // Courses
  getCourses: (params?: { skill?: string; published?: string; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.skill) q.set('skill', params.skill)
    if (params?.published) q.set('published', params.published)
    if (params?.search) q.set('search', params.search)
    return get<any>(`/admin/courses?${q}`)
  },
  getCourse: (id: string) => get<any>(`/admin/courses/${id}`),
  createCourse: (body: { title: string; description: string; skill_name: string; level?: string; published?: boolean }) =>
    post<any>('/admin/courses', body),
  updateCourse: (id: string, body: Record<string, unknown>) =>
    put<any>(`/admin/courses/${id}`, body),
  deleteCourse: (id: string) => del<any>(`/admin/courses/${id}`),
  assignLessonToCourse: (courseId: string, lessonId: string, orderIndex?: number) =>
    post<any>(`/admin/courses/${courseId}/lessons`, { lesson_id: lessonId, order_index: orderIndex }),
  unassignLessonFromCourse: (courseId: string, lessonId: string) =>
    del<any>(`/admin/courses/${courseId}/lessons/${lessonId}`),

  // Learning Path Courses
  getPathCourses: (pathId: string) => get<any>(`/admin/learning-paths/${pathId}/courses`),
  addCourseToPath: (pathId: string, body: { course_id: string; order_index?: number }) =>
    post<any>(`/admin/learning-paths/${pathId}/courses`, body),
  removeCourseFromPath: (pathId: string, pathCourseId: string) =>
    del<any>(`/admin/learning-paths/${pathId}/courses/${pathCourseId}`),
  reorderPathCourses: (pathId: string, courseIds: string[]) =>
    put<any>(`/admin/learning-paths/${pathId}/courses/reorder`, { course_ids: courseIds }),

  // Analytics
  getAnalytics: () => get<any>('/admin/analytics'),

  // Waitlist
  getWaitlist: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.search) q.set('search', params.search)
    return get<any>(`/admin/waitlist?${q}`)
  },
  updateWaitlistStatus: (id: string, status: 'approved' | 'rejected' | 'pending') =>
    patch<any>(`/admin/waitlist/${id}/status`, { status }),
  sendInvites: (emails: string[]) => post<any>('/admin/waitlist/invite', { emails }),

  // Events
  getEvents: (params?: { status?: string; type?: string; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.type) q.set('type', params.type)
    if (params?.search) q.set('search', params.search)
    return get<any>(`/admin/events?${q}`)
  },
  createEvent: (body: Record<string, unknown>) => post<any>('/admin/events', body),
  updateEvent: (id: string, body: Record<string, unknown>) =>
    put<any>(`/admin/events/${id}`, body),
  deleteEvent: (id: string) => del<any>(`/admin/events/${id}`),

  // Impressions
  getImpressionsStats: () => get<any>('/admin/impressions/stats'),
  getImpressions: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return get<any>(`/admin/impressions?${q}`)
  },

  // Payment Provider Config
  getPaymentConfig: () => get<any>('/admin/payment-config'),
  getPaymentProvider: (provider: string) => get<any>(`/admin/payment-config/${provider}`),
  updatePaymentProvider: (provider: string, body: Record<string, unknown>) =>
    put<any>(`/admin/payment-config/${provider}`, body),
  togglePaymentProvider: (provider: string) =>
    post<any>(`/admin/payment-config/${provider}/toggle`, {}),
  setPaymentProviderRole: (provider: string, role: 'international' | 'primary_local' | 'failover_local' | 'none') =>
    post<any>(`/admin/payment-config/${provider}/set-role`, { role }),
  testPaymentProvider: (provider: string) =>
    post<any>('/admin/payment-config/test', { provider }),
  getPaymentStats: (days?: number) => {
    const q = days ? `?days=${days}` : ''
    return get<any>(`/admin/payment-config/stats${q}`)
  },
  getPaymentTransactions: (params?: {
    page?: number; limit?: number; status?: string; provider?: string;
    user_id?: string; date_from?: string; date_to?: string; plan?: string
  }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.status) q.set('status', params.status)
    if (params?.provider) q.set('provider', params.provider)
    if (params?.user_id) q.set('user_id', params.user_id)
    if (params?.date_from) q.set('date_from', params.date_from)
    if (params?.date_to) q.set('date_to', params.date_to)
    if (params?.plan) q.set('plan', params.plan)
    return get<any>(`/admin/payment-config/transactions?${q}`)
  },

  // Subscription Plans
  getSubscriptionPlans: () => get<any>('/admin/subscription-plans'),
  getSubscriptionPlan: (id: string) => get<any>(`/admin/subscription-plans/${id}`),
  createSubscriptionPlan: (body: Record<string, unknown>) =>
    post<any>('/admin/subscription-plans', body),
  updateSubscriptionPlan: (id: string, body: Record<string, unknown>) =>
    put<any>(`/admin/subscription-plans/${id}`, body),
  deleteSubscriptionPlan: (id: string) => del<any>(`/admin/subscription-plans/${id}`),
  reorderSubscriptionPlans: (order: { id: string; sort_order: number }[]) =>
    post<any>('/admin/subscription-plans/reorder', { order }),
}

// ── Admin Notifications API ───────────────────────────────────────────────

export interface AdminNotification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  read_at: string | null
  dismissed: boolean
  ref_type: string | null
  ref_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export const adminNotificationsApi = {
  list: (params?: { type?: string; unread_only?: boolean; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.type) q.set('type', params.type)
    if (params?.unread_only) q.set('unread_only', 'true')
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return get<AdminNotification[]>(`/admin/notifications?${q}`)
  },
  getUnreadCount: () => get<{ unread: number }>('/admin/notifications/count'),
  markRead: (id: string) => patch<any>(`/admin/notifications/${id}/read`, {}),
  markAllRead: () => post<any>('/admin/notifications/read-all', {}),
  dismiss: (id: string) => del<any>(`/admin/notifications/${id}`),

  // Broadcast
  broadcast: (body: { title: string; body: string; type?: string; audience: string }) =>
    post<any>('/admin/notifications/broadcast', body),
  getBroadcasts: () => get<any>('/admin/notifications/broadcasts'),
}
