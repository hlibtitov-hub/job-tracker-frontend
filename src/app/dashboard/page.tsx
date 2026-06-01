'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useJobStore } from '@/store/useJobStore'
import Navbar from '@/components/layout/Navbar'
import { JobStatus, STATUS_CONFIG } from '@/types'

const STATUSES: JobStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected']

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore()
  const { jobs } = useJobStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const total = jobs.length
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: jobs.filter(j => j.status === s).length }), {} as Record<JobStatus, number>)
  const recentJobs = [...jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  const responseRate = total > 0 ? Math.round(((counts.Interview + counts.Offer) / total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Here&apos;s your job search overview</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s]
            return (
              <div key={s} className={`bg-white rounded-xl border p-4 ${cfg.bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-medium ${cfg.color}`}>{s}</span>
                </div>
                <p className="text-2xl font-semibold text-neutral-900">{counts[s]}</p>
              </div>
            )
          })}
        </div>

        {/* Two columns */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="font-medium text-neutral-900 mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Total applications</span>
                <span className="font-semibold text-neutral-900">{total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Response rate</span>
                <span className="font-semibold text-neutral-900">{responseRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Offers received</span>
                <span className="font-semibold text-emerald-600">{counts.Offer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Active (Applied + Interview)</span>
                <span className="font-semibold text-neutral-900">{counts.Applied + counts.Interview}</span>
              </div>
            </div>

            {/* Progress bar */}
            {total > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-50">
                <p className="text-xs text-neutral-400 mb-2">Pipeline breakdown</p>
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                  {STATUSES.map(s => {
                    const pct = (counts[s] / total) * 100
                    const colors: Record<JobStatus, string> = {
                      Applied: 'bg-blue-400', Interview: 'bg-amber-400',
                      Offer: 'bg-emerald-400', Rejected: 'bg-red-300'
                    }
                    return pct > 0 ? (
                      <div key={s} className={`${colors[s]} rounded-full`} style={{ width: `${pct}%` }} title={`${s}: ${counts[s]}`} />
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Recent */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="font-medium text-neutral-900 mb-4">Recent Applications</h2>
            {recentJobs.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">No jobs yet. Add your first one!</p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map(job => {
                  const cfg = STATUS_CONFIG[job.status]
                  return (
                    <div key={job.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0">
                          {job.company[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">{job.company}</p>
                          <p className="text-xs text-neutral-400 truncate">{job.role}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${cfg.color} shrink-0`}>{job.status}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
