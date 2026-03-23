'use client'

import { cn } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border bg-card p-5 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  )
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function TripDetailPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 md:pt-32 lg:pt-36 lg:pb-12 space-y-6">
      <Skeleton className="h-8 w-28 rounded-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-[2rem] border bg-card p-6 md:p-10 space-y-6">
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-44 rounded-full" />
            <div className="rounded-[1.75rem] border p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-12 w-40" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-12 ms-auto" />
                  <Skeleton className="h-12 w-40 ms-auto" />
                  <Skeleton className="h-6 w-20 rounded-full ms-auto" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border p-4 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
            <div className="rounded-[1.5rem] border p-5 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-44" />
            </div>
          </div>
          <div className="rounded-[1.5rem] border bg-card p-6 md:p-8 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-9/12" />
          </div>
        </div>
        <div className="hidden lg:block lg:col-span-4">
          <div className="rounded-[2.25rem] border bg-card overflow-hidden">
            <div className="p-8 space-y-4 bg-muted/40">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
            <div className="p-8 space-y-6">
              <div className="rounded-[1.5rem] border p-5 space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="rounded-[1.5rem] border p-5 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RoomDetailPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 md:pt-32 lg:pt-36 lg:pb-12 space-y-6">
      <Skeleton className="h-8 w-28 rounded-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="overflow-hidden rounded-[2rem] border bg-card">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="space-y-6 p-6 md:p-10">
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-4 w-80" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border p-4 space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
              <div className="rounded-[1.5rem] border p-5 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border bg-card p-6 md:p-8 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
          </div>
        </div>
        <div className="hidden lg:block lg:col-span-4">
          <div className="rounded-[2.25rem] border bg-card overflow-hidden">
            <div className="p-8 space-y-4 bg-muted/40">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-48" />
            </div>
            <div className="p-8 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-[1.5rem] border p-5 space-y-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-14 w-full rounded-2xl" />
                </div>
              ))}
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BookingPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 md:pt-32 lg:pt-36 lg:pb-12 space-y-6">
      <Skeleton className="h-8 w-28 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-[1.5rem] border bg-card p-6 h-36" />
          <div className="rounded-[1.5rem] border bg-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-[1.5rem] border bg-card p-6 sm:p-8 md:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-8 w-40" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Array.from({ length: 5 }).map((__, j) => (
                  <Skeleton key={j} className="h-14 w-full rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block lg:col-span-4">
          <div className="rounded-[2.5rem] border bg-card p-8 space-y-6">
            <Skeleton className="h-4 w-32" />
            <div className="rounded-2xl border p-5 space-y-4">
              <Skeleton className="h-4 w-28 mx-auto" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function RoomBookingPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 md:pt-32 lg:pt-36 lg:pb-12 space-y-6">
      <Skeleton className="h-8 w-28 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-[1.5rem] border bg-card p-6 h-36" />
          <div className="rounded-[1.5rem] border bg-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Skeleton className="h-14 w-full rounded-2xl md:col-span-2" />
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
          <div className="rounded-[1.5rem] border bg-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:col-span-4">
          <div className="rounded-[2.5rem] border bg-card p-8 space-y-6">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
              ))}
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CheckoutPageSkeleton() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 pt-24 pb-12 md:pt-32 lg:pt-36 space-y-6">
      <Skeleton className="h-8 w-28 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="rounded-[1.5rem] border bg-card p-6 space-y-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="rounded-[1.5rem] border bg-card p-6 md:p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
      <div className="rounded-[1.5rem] border bg-card p-6 md:p-8 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  )
}

export function BookingDetailPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Skeleton className="h-6 w-24" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-36" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export { Skeleton }
