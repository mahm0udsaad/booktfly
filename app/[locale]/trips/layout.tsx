import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تصفح الرحلات - Browse Trips',
  description: 'تصفح واحجز رحلات الطيران بأفضل الأسعار من مزودي خدمات السفر المعتمدين - Browse and book flights at the best prices from verified travel providers',
}

export default function TripsLayout({ children }: { children: React.ReactNode }) {
  return children
}
