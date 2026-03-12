import { Star } from 'lucide-react'

interface TestimonialsProps {
  locale: string
}

const reviews = [
  {
    nameEn: 'Ahmad Al-Dosari',
    nameAr: 'أحمد الدوسري',
    roleEn: 'Frequent Traveler',
    roleAr: 'مسافر دائم',
    textEn: 'The easiest way to book domestic flights in Saudi Arabia. Highly recommended!',
    textAr: 'أسهل طريقة لحجز رحلات الطيران الداخلية في السعودية. أوصي بها بشدة!',
    rating: 5
  },
  {
    nameEn: 'Sarah Khalid',
    nameAr: 'سارة خالد',
    roleEn: 'Business Owner',
    roleAr: 'صاحبة عمل',
    textEn: 'I love how transparent the pricing is. No hidden fees at checkout.',
    textAr: 'أحب شفافية الأسعار. لا توجد رسوم خفية عند الدفع.',
    rating: 5
  },
  {
    nameEn: 'Mohammed Ali',
    nameAr: 'محمد علي',
    roleEn: 'Travel Agency Partner',
    roleAr: 'شريك سياحي',
    textEn: 'As a provider, BooktFly has doubled our bookings. Great platform.',
    textAr: 'كمزود، ساعدتنا المنصة في مضاعفة حجوزاتنا. منصة رائعة جداً.',
    rating: 5
  },
  {
    nameEn: 'Faisal Omar',
    nameAr: 'فيصل عمر',
    roleEn: 'Tourist',
    roleAr: 'سائح',
    textEn: 'Customer support is incredibly fast. They resolved my issue in minutes.',
    textAr: 'دعم العملاء سريع بشكل لا يصدق. قاموا بحل مشكلتي في دقائق.',
    rating: 5
  },
  {
    nameEn: 'Noura S.',
    nameAr: 'نورة س.',
    roleEn: 'Family Traveler',
    roleAr: 'مسافرة مع العائلة',
    textEn: 'Booking for my family of 5 was seamless and very organized.',
    textAr: 'حجزت لعائلتي المكونة من 5 أشخاص وكان الأمر سلساً ومنظماً للغاية.',
    rating: 5
  }
]

export function Testimonials({ locale }: TestimonialsProps) {
  const isAr = locale === 'ar'
  
  // Duplicate array to create an infinite loop effect
  const marqueeReviews = [...reviews, ...reviews]

  return (
    <section className="py-24 bg-slate-50 overflow-hidden relative border-t border-slate-100">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 relative z-10">
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
          {isAr ? 'ماذا يقول عملاؤنا' : 'What Our Users Say'}
        </h2>
        <div className="flex items-center justify-center gap-2 text-xl font-bold text-slate-600">
          <span className="text-accent">4.9/5</span>
          <span>{isAr ? 'تقييم من آلاف المسافرين' : 'Rating from thousands of travelers'}</span>
        </div>
      </div>

      <div className="relative flex w-full group py-8">
        {/* Left and Right Fade Gradients */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        <div className="flex w-fit animate-marquee hover:[animation-play-state:paused]" style={{
            animationDirection: isAr ? 'reverse' : 'normal'
        }}>
          {marqueeReviews.map((review, idx) => (
            <div
              key={idx}
              className="w-[320px] md:w-[420px] flex-shrink-0 bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mx-3"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-lg font-medium text-slate-800 mb-8 whitespace-normal leading-relaxed">
                "{isAr ? review.textAr : review.textEn}"
              </p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-lg border border-slate-200">
                  {isAr ? review.nameAr[0] : review.nameEn[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {isAr ? review.nameAr : review.nameEn}
                  </h4>
                  <p className="text-sm font-medium text-slate-500">
                    {isAr ? review.roleAr : review.roleEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add custom CSS for animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
          .rtl .animate-marquee {
            animation-direction: reverse;
          }
        `}} />
      </div>
    </section>
  )
}
