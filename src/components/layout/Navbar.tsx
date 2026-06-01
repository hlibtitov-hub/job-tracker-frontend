'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/store/useJobStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/ai', label: 'AI Analyzer' },
  ]

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">J</span>
            </div>
            <span className="font-semibold text-neutral-900 tracking-tight">JobTrack</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop right side */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-sm text-neutral-500">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-50"
          >
            Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-neutral-50 transition-colors"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-neutral-700 transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-neutral-700 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-neutral-700 transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-neutral-100 bg-white px-4 py-3 space-y-1 animate-fadeIn">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-neutral-100 mt-2">
            <p className="text-xs text-neutral-400 px-3 pb-1">{user?.name}</p>
            <button
              onClick={() => { setMenuOpen(false); handleLogout() }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
