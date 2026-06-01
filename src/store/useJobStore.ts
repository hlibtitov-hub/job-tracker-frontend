import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Job, JobStatus, User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

interface JobState {
  jobs: Job[]
  isLoading: boolean
  searchQuery: string
  statusFilter: JobStatus | 'all'
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  deleteJob: (id: string) => void
  setSearch: (q: string) => void
  setFilter: (s: JobStatus | 'all') => void
}

const MOCK_USER: User = {
  id: '1',
  name: 'Alex Ivanov',
  email: 'alex@example.com',
}

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    company: 'Google',
    role: 'Frontend Engineer',
    status: 'Interview',
    location: 'Remote',
    salary: '$120k–$160k',
    url: 'https://careers.google.com',
    notes: 'Technical screen passed, waiting for onsite',
    createdAt: '2026-05-20',
  },
  {
    id: '2',
    company: 'Stripe',
    role: 'Full Stack Developer',
    status: 'Applied',
    location: 'San Francisco, CA',
    salary: '$130k–$180k',
    url: 'https://stripe.com/jobs',
    notes: 'Applied via LinkedIn',
    createdAt: '2026-05-22',
  },
  {
    id: '3',
    company: 'Vercel',
    role: 'Software Engineer',
    status: 'Offer',
    location: 'Remote',
    salary: '$140k–$190k',
    url: 'https://vercel.com/careers',
    notes: 'Offer received! Reviewing details.',
    createdAt: '2026-05-15',
  },
  {
    id: '4',
    company: 'Airbnb',
    role: 'React Developer',
    status: 'Rejected',
    location: 'New York, NY',
    salary: '$110k–$150k',
    url: 'https://careers.airbnb.com',
    notes: 'Skills mismatch — good experience anyway',
    createdAt: '2026-05-10',
  },
  {
    id: '5',
    company: 'Notion',
    role: 'Product Engineer',
    status: 'Applied',
    location: 'Remote',
    salary: '$115k–$155k',
    url: 'https://notion.so/careers',
    notes: '',
    createdAt: '2026-05-28',
  },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 800))
        if (email === 'alex@example.com' && password === 'password') {
          set({ user: MOCK_USER, token: 'mock-jwt-token', isAuthenticated: true })
          return true
        }
        return false
      },
      register: async (name, email, _password) => {
        await new Promise((r) => setTimeout(r, 800))
        set({
          user: { id: '2', name, email },
          token: 'mock-jwt-token',
          isAuthenticated: true,
        })
        return true
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
)

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: MOCK_JOBS,
      isLoading: false,
      searchQuery: '',
      statusFilter: 'all',
      addJob: (job) => {
        const newJob: Job = {
          ...job,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split('T')[0],
        }
        set({ jobs: [newJob, ...get().jobs] })
      },
      updateJob: (id, updates) => {
        set({
          jobs: get().jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
        })
      },
      deleteJob: (id) => {
        set({ jobs: get().jobs.filter((j) => j.id !== id) })
      },
      setSearch: (searchQuery) => set({ searchQuery }),
      setFilter: (statusFilter) => set({ statusFilter }),
    }),
    { name: 'jobs-storage' }
  )
)
