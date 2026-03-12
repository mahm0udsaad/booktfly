import type { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookitfly.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/ar`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/ar/trips`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/en/trips`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/ar/become-provider`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/en/become-provider`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const { data: trips } = await supabaseAdmin
    .from('trips')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(500)

  const tripRoutes: MetadataRoute.Sitemap = (trips || []).flatMap((trip) => [
    {
      url: `${baseUrl}/ar/trips/${trip.id}`,
      lastModified: new Date(trip.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/trips/${trip.id}`,
      lastModified: new Date(trip.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ])

  return [...staticRoutes, ...tripRoutes]
}
