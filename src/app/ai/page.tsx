'use client'
import { useState, useEffect, useRef } from 'react'
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
  interviewReadiness: string
  careerAdvice: string[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? 'Strong Match' : score >= 40 ? 'Partial Match' : 'Weak Match'
  const r = 42
  const circ = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-bold text-neutral-900">{score}%</span>
        </div>
      </div>
      <span className="text-xs sm:text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

function ResultSection({ icon, title, items, dotColor }: {
  icon: string; title: string; items: string[]; dotColor: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <h3 className="font-semibold text-neutral-900 text-sm">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-600 leading-snug">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function UploadButton({ onExtract, disabled }: {
  onExtract: (text: string) => void
  disabled: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')

  const handleFile = async (file: File) => {
    setExtracting(true)
    setExtractError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${API_URL}/api/upload/extract-text`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Extraction failed')
      onExtract(data.text)
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : 'Failed to extract text')
    } finally {
      setExtracting(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || extracting}
        className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 border border-neutral-200 hover:border-neutral-300 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
      >
        {extracting ? (
          <>
            <div className="w-3 h-3 border-2 border-neutral-400/30 border-t-neutral-500 rounded-full animate-spin" />
            Extracting…
          </>
        ) : (
          <>
            <span>📎</span>
            Upload file
          </>
        )}
      </button>
      {extractError && (
        <p className="mt-1 text-xs text-red-500">{extractError}</p>
      )}
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resume, jobDescription }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Analysis failed')
      setResult(data)
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">AI Resume Analyzer</h1>
          <p className="text-neutral-500 text-sm mt-1">Upload or paste your resume to get an instant match analysis</p>
        </div>

        {/* Form */}
        <form onSubmit={handleAnalyze} className="space-y-4">

          {/* Inputs — stacked on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Resume */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-neutral-700">📄 Your Resume</label>
                <UploadButton onExtract={setResume} disabled={loading} />
              </div>
              <textarea
                value={resume}
                onChange={e => setResume(e.target.value)}
                placeholder="Paste your resume text here, or upload a PDF / DOCX / image above…"
                className="w-full flex-1 min-h-[200px] sm:min-h-[260px] px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 transition placeholder:text-neutral-400"
                required
              />
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 flex flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-700">💼 Job Description</label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the job description here — requirements, responsibilities, and qualifications…"
                className="w-full flex-1 min-h-[200px] sm:min-h-[260px] px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 transition placeholder:text-neutral-400"
                required
              />
            </div>
          </div>

          {/* Supported formats hint */}
          <p className="text-xs text-neutral-400">
            Supported upload formats: PDF, DOCX, JPG, PNG (max 10 MB)
          </p>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
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
                Analyzing your resume…
              </>
            ) : (
              <>✨ Analyze Resume</>
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div id="results" className="mt-8 space-y-4 animate-fadeUp">

            {/* Score card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <ScoreRing score={result.matchScore} />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="font-semibold text-neutral-900 text-base mb-1.5">Overall Assessment</h2>
                  <p className="text-sm text-neutral-600 leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </div>

            {/* Strengths + Missing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultSection icon="✅" title="Your Strengths" items={result.strengths} dotColor="bg-emerald-400" />
              <ResultSection icon="⚠️" title="Missing Skills" items={result.missingSkills} dotColor="bg-amber-400" />
            </div>

            {/* Improvements + Career Advice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultSection icon="💡" title="How to Improve Your Resume" items={result.improvements} dotColor="bg-blue-400" />
              <ResultSection icon="🚀" title="Career Advice" items={result.careerAdvice} dotColor="bg-violet-400" />
            </div>

            {/* Interview Readiness */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <span>🎯</span>
                <h3 className="font-semibold text-neutral-900 text-sm">Interview Readiness</h3>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">{result.interviewReadiness}</p>
            </div>

            {/* Keywords */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <span>🔑</span>
                <h3 className="font-semibold text-neutral-900 text-sm">Keywords to Add</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-full transition-colors cursor-default">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
