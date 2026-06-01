'use client'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useJobStore'
import Navbar from '@/components/layout/Navbar'

interface AnalysisResult {
  matchScore: number
  summary: string
  strengths: string[]
  missingSkills: string[]
  improvements: string[]
  keywords: string[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? 'Strong Match' : score >= 40 ? 'Partial Match' : 'Weak Match'
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-neutral-900">{score}%</span>
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color }}>{label}</span>
    </div>
  )
}

function Section({ icon, title, items, color }: { icon: string; title: string; items: string[]; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="font-medium text-neutral-900 text-sm">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
            <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AIPage() {
  const { isAuthenticated, token } = useAuthStore()
  const router = useRouter()
  const [resume, setResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resume.trim() || !jobDescription.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`${API_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resume, jobDescription }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Analysis failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">AI Resume Analyzer</h1>
          <p className="text-neutral-500 text-sm mt-1">Paste your resume and a job description to get an instant match analysis</p>
        </div>

        {/* Input form */}
        <form onSubmit={handleAnalyze}>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                📄 Your Resume
              </label>
              <textarea
                value={resume}
                onChange={e => setResume(e.target.value)}
                placeholder="Paste your resume text here…&#10;&#10;Include your skills, experience, education, and any other relevant information."
                className="w-full h-52 sm:h-64 px-3 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 transition placeholder:text-neutral-400"
                required
              />
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                💼 Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the job description here…&#10;&#10;Include required skills, responsibilities, and qualifications."
                className="w-full h-52 sm:h-64 px-3 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 transition placeholder:text-neutral-400"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !resume.trim() || !jobDescription.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <span>✨</span>
                Analyze Resume
              </>
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-8 animate-fadeUp">
            {/* Score + summary */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 mb-4 flex flex-col sm:flex-row items-center gap-6">
              <ScoreRing score={result.matchScore} />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-semibold text-neutral-900 mb-2">Overall Assessment</h2>
                <p className="text-sm text-neutral-600 leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Section
                icon="✅"
                title="Your Strengths"
                items={result.strengths}
                color="bg-emerald-400"
              />
              <Section
                icon="⚠️"
                title="Missing Skills"
                items={result.missingSkills}
                color="bg-amber-400"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Section
                icon="💡"
                title="How to Improve Your Resume"
                items={result.improvements}
                color="bg-blue-400"
              />
              {/* Keywords */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🔑</span>
                  <h3 className="font-medium text-neutral-900 text-sm">Keywords to Add</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
