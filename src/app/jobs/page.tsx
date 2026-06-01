'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useJobStore } from '@/store/useJobStore'
import Navbar from '@/components/layout/Navbar'
import JobCard from '@/components/jobs/JobCard'
import JobModal from '@/components/jobs/JobModal'
import { JobStatus } from '@/types'

const FILTERS: (JobStatus | 'all')[] = ['all', 'Applied', 'Interview', 'Offer', 'Rejected']

export default function JobsPage() {
  const { isAuthenticated } = useAuthStore()
  const { jobs, searchQuery, statusFilter, setSearch, setFilter } = useJobStore()
  const [showAdd, setShowAdd] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const filtered = jobs.filter(job => {
    const matchSearch = !searchQuery ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchFilter = statusFilter === 'all' || job.status === statusFilter
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Applications</h1>
            <p className="text-neutral-500 text-sm mt-0.5">{jobs.length} total · {filtered.length} shown</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-neutral-900 text-white px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all shrink-0"
          >
            <span className="text-lg leading-none">+</span>
            <span className="hidden xs:inline sm:inline">Add Job</span>
            <span className="xs:hidden sm:hidden">Add</span>
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">🔍</span>
            <input
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search company, role, location…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors">
                ×
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {FILTERS.map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                  statusFilter === f
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Job grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium text-neutral-700">
              {jobs.length === 0 ? 'No applications yet' : 'No results found'}
            </p>
            <p className="text-neutral-400 text-sm mt-1">
              {jobs.length === 0
                ? 'Add your first job application to get started'
                : 'Try a different search or filter'}
            </p>
            {jobs.length === 0 && (
              <button onClick={() => setShowAdd(true)}
                className="mt-4 bg-neutral-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition">
                Add First Job
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </main>

      {showAdd && <JobModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
