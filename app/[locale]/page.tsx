import { getTranslations, getLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/home/hero-section'
import { StatsSection } from '@/components/home/stats-section'
import { FeaturedTrips } from '@/components/home/featured-trips'
import { HowItWorks } from '@/components/home/how-it-works'
import { BecomeProviderCTA } from '@/components/home/become-provider-cta'
import { TrendingDestinations } from '@/components/home/trending-destinations'
import { ValueProposition } from '@/components/home/value-proposition'
import { Testimonials } from '@/components/home/testimonials'

export default async function HomePage() {
  const locale = await getLocale()
  const supabase = await createClient()

  // Fetch featured trips
  const { data: featuredTrips } = await supabase
    .from('trips')
    .select('*, provider:providers(company_name_ar, company_name_en, provider_type)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch stats
  const [tripsCount, providersCount, bookingsCount] = await Promise.all([
    supabase.from('trips').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('providers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
  ])

  return (
    <main className="overflow-x-hidden">
      <HeroSection locale={locale} />
      
      <StatsSection 
        tripsCount={tripsCount.count || 0}
        providersCount={providersCount.count || 0}
        bookingsCount={bookingsCount.count || 0}
      />

      <TrendingDestinations locale={locale} />

      <FeaturedTrips 
        trips={featuredTrips || []} 
        locale={locale} 
      />

      <ValueProposition locale={locale} />

      <HowItWorks />

      <Testimonials locale={locale} />

      <BecomeProviderCTA locale={locale} />
    </main>
  )
}
