/**
 * Admin API client — cookie-based authentication.
 * Uses `credentials: 'include'` so the browser sends/receives httpOnly cookies automatically.
 * No localStorage token handling needed.
 */
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  // Handle 401 — session expired, try refresh
  if (res.status === 401 && !path.includes('/auth/')) {
    const refreshed = await adminAuthApi.refresh()
    if (refreshed) {
      const retry = await fetch(`${BASE}${path}`, {
        ...init,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
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
  createLearningPath: (body: {
    name: string; description: string; skill_name: string; status: string
  }) => post<any>('/admin/learning-paths', body),
  updateLearningPath: (id: string, body: Record<string, unknown>) =>
    put<any>(`/admin/learning-paths/${id}`, body),
  deleteLearningPath: (id: string) => del<any>(`/admin/learning-paths/${id}`),

  // Lessons
  getLessons: (params?: { skill?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.skill) q.set('skill', params.skill)
    if (params?.status) q.set('status', params.status)
    if (params?.search) q.set('search', params.search)
    return get<any>(`/admin/lessons?${q}`)
  },
  createLesson: (body: {
    title: string; skill_name: string; description: string; duration_mins: number; status: string
  }) => post<any>('/admin/lessons', body),
  updateLesson: (id: string, body: Record<string, unknown>) =>
    put<any>(`/admin/lessons/${id}`, body),
  deleteLesson: (id: string) => del<any>(`/admin/lessons/${id}`),

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
}
