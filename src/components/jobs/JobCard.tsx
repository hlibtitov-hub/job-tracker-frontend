'use client'
import { useState } from 'react'
import { Job, JobStatus, STATUS_CONFIG } from '@/types'
import { useJobStore } from '@/store/useJobStore'
import StatusBadge from '@/components/ui/StatusBadge'
import JobModal from './JobModal'

const STATUSES: JobStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected']

export default function JobCard({ job }: { job: Job }) {
  const { updateJob, deleteJob } = useJobStore()
  const [editing, setEditing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  return (
    <>
      <div className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 hover:shadow-sm transition-all group animate-fadeUp">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0">
                {job.company[0]}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-neutral-900 text-sm truncate">{job.company}</p>
                <p className="text-xs text-neutral-500 truncate">{job.role}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={job.status} />
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 text-lg leading-none"
              >
                ···
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-neutral-200 rounded-xl shadow-lg z-10 overflow-hidden min-w-[130px] animate-fadeIn">
                  <button onClick={() => { setEditing(true); setShowMenu(false) }}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                    Edit
                  </button>
                  <button onClick={() => { deleteJob(job.id); setShowMenu(false) }}
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {(job.location || job.salary) && (
          <div className="flex items-center gap-3 mt-2.5 text-xs text-neutral-400">
            {job.location && <span>📍 {job.location}</span>}
            {job.salary && <span>💰 {job.salary}</span>}
          </div>
        )}

        {job.notes && (
          <p className="mt-2.5 text-xs text-neutral-400 line-clamp-2 leading-relaxed">{job.notes}</p>
        )}

        <div className="mt-3 pt-3 border-t border-neutral-50 flex items-center justify-between">
          <span className="text-xs text-neutral-300">{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>

          <div className="flex gap-1">
            {STATUSES.map(s => (
              <button key={s}
                onClick={() => updateJob(job.id, { status: s })}
                title={`Mark as ${s}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  job.status === s
                    ? STATUS_CONFIG[s].dot + ' scale-125'
                    : 'bg-neutral-200 hover:bg-neutral-300'
                }`}
              />
            ))}
          </div>

          {job.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
              View →
            </a>
          )}
        </div>
      </div>

      {editing && <JobModal job={job} onClose={() => setEditing(false)} />}
    </>
  )
}
