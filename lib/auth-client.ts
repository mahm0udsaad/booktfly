import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserRole } from '@/types'

type RedirectOptions = {
  locale: string
  redirectTo?: string | null
  role?: UserRole | null
}

export function getPostLoginRedirect({
  locale,
  redirectTo,
  role,
}: RedirectOptions) {
  if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
    return redirectTo
  }

  if (role === 'admin') return `/${locale}/admin`
  if (role === 'provider') return `/${locale}/provider/dashboard`
  return `/${locale}`
}

export function navigateAfterLogin(
  router: AppRouterInstance,
  options: RedirectOptions
) {
  router.replace(getPostLoginRedirect(options))
  router.refresh()
}

export async function signOutAndRedirect(
  supabase: SupabaseClient,
  locale: string
) {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  window.location.replace(`/${locale}`)
}
