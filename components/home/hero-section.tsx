import { getTranslations } from 'next-intl/server'
import { HeroSectionClient } from './hero-section-client'

interface HeroSectionProps {
  locale: string
}

export async function HeroSection({ locale }: HeroSectionProps) {
  const t = await getTranslations('homepage')
  const navT = await getTranslations('nav')

  return (
    <HeroSectionClient
      locale={locale}
      heroTitle={t('hero_title')}
      heroSubtitle={t('hero_subtitle')}
      searchFrom={t('search_from')}
      searchTo={t('search_to')}
      searchButton={t('search_button')}
      providerCta={navT('become_provider')}
    />
  )
}
