export type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected'

export interface Job {
  id: string
  company: string
  role: string
  status: JobStatus
  location: string
  salary: string
  url: string
  notes: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
}

export const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  Applied: {
    label: 'Applied',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    dot: 'bg-blue-500',
  },
  Interview: {
    label: 'Interview',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
  },
  Offer: {
    label: 'Offer',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    dot: 'bg-red-400',
  },
}
