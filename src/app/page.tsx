'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useJobStore'

export default function Home() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    router.replace(isAuthenticated ? '/dashboard' : '/login')
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
    </div>
  )
}
