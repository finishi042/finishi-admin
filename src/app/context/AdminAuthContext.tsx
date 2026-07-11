import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { adminAuthApi, type AdminUser } from '../api'

interface AdminAuthState {
  admin: AdminUser | null
  loading: boolean
  error: string | null
}

interface AdminAuthContextValue extends AdminAuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>({ admin: null, loading: true, error: null })

  // Check session on mount
  useEffect(() => {
    adminAuthApi.me()
      .then((data) => {
        // Map /auth/me response to AdminUser shape
        const admin: AdminUser = {
          admin_id: (data as any).user_id ?? (data as any).admin_id ?? '',
          email: (data as any).email ?? '',
          full_name: (data as any).full_name ?? '',
          role: (data as any).role ?? 'admin',
        }
        setState({ admin, loading: false, error: null })
      })
      .catch(() => setState({ admin: null, loading: false, error: null }))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const admin = await adminAuthApi.login({ email, password })
      setState({ admin, loading: false, error: null })
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e.message ?? 'Login failed' }))
      throw e
    }
  }, [])

  const logout = useCallback(async () => {
    await adminAuthApi.logout()
    setState({ admin: null, loading: false, error: null })
  }, [])

  return (
    <AdminAuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
