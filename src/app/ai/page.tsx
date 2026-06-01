'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
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
const ACCEPTED = '.pdf,.docx,.doc,.jpg,.jpeg,.png'
const ACCEPTED_TYPES = ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword','image/jpeg','image/jpg','image/png']

/* ── Score Ring ── */
function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? 'Strong Match' : score >= 40 ? 'Partial Match' : 'Weak Match'
  const r = 42, circ = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10"/>
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-bold text-neutral-900">{score}%</span>
        </div>
      </div>
      <span className="text-xs sm:text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

/* ── Result Section ── */
function ResultSection({ icon, title, items, dotColor }: { icon: string; title: string; items: string[]; dotColor: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <h3 className="font-semibold text-neutral-900 text-sm">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-600 leading-snug">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}/>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Upload Zone ── */
function UploadZone({ onExtract, disabled }: { onExtract: (text: string) => void; disabled: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)

  const processFile = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setStatus('error')
      setMessage('File too large. Max 10 MB.')
      return
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setStatus('error')
      setMessage('Unsupported format. Use PDF, DOCX, JPG, or PNG.')
      return
    }

    setStatus('uploading')
    setMessage(`Extracting text from ${file.name}…`)
    setProgress(0)

    // Fake progress animation
    const timer = setInterval(() => setProgress(p => Math.min(p + 15, 85)), 200)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_URL}/api/upload/extract-text`, { method: 'POST', body: formData })
      const data = await res.json()
      clearInterval(timer)
      setProgress(100)

      if (!res.ok) throw new Error(data.message || 'Extraction failed')

      onExtract(data.text)
      setStatus('success')
      setMessage(`✓ Text extracted from ${file.name}`)
      setTimeout(() => { setStatus('idle'); setMessage('') }, 4000)
    } catch (err) {
      clearInterval(timer)
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Failed to extract text')
    }
  }, [onExtract])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const borderColor = dragOver ? 'border-neutral-900 bg-neutral-50' :
    status === 'success' ? 'border-emerald-300 bg-emerald-50/40' :
    status === 'error' ? 'border-red-300 bg-red-50/40' :
    'border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white'

  return (
    <div>
      <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
        onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}/>

      <button type="button" disabled={disabled || status === 'uploading'}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`w-full border-2 border-dashed rounded-xl px-4 py-5 text-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${borderColor}`}>

        {status === 'uploading' ? (
          <div className="space-y-2">
            <div className="w-8 h-8 border-2 border-neutral-400/30 border-t-neutral-600 rounded-full animate-spin mx-auto"/>
            <p className="text-sm text-neutral-600">{message}</p>
            <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2">
              <div className="bg-neutral-800 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
            </div>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-1">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-emerald-600 text-sm">✓</span>
            </div>
            <p className="text-sm text-emerald-700 font-medium">{message}</p>
            <p className="text-xs text-neutral-400">Click to upload another file</p>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-1">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-500 text-sm">✕</span>
            </div>
            <p className="text-sm text-red-600 font-medium">{message}</p>
            <p className="text-xs text-neutral-400">Click to try again</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">
                <span className="text-neutral-900 underline underline-offset-2">Click to upload</span>
                {' '}<span className="hidden sm:inline">or drag & drop</span>
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">PDF, DOCX, JPG, PNG — max 10 MB</p>
            </div>
          </div>
        )}
      </button>
    </div>
  )
}

/* ── Main Page ── */
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
    setLoading(true); setError(''); setResult(null)
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
          <p className="text-neutral-500 text-sm mt-1">Upload your resume and a job description — get an instant AI-powered match report</p>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Resume card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-3">
              <div>
                <p className="text-sm font-semibold text-neutral-800 mb-1">📄 Your Resume</p>
                <p className="text-xs text-neutral-400">Upload a file or paste your resume text below</p>
              </div>
              <UploadZone onExtract={setResume} disabled={loading}/>
              <textarea
                value={resume}
                onChange={e => setResume(e.target.value)}
                placeholder="Or paste your resume text here…"
                className="w-full min-h-[180px] sm:min-h-[220px] px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 transition placeholder:text-neutral-400"
                required
              />
            </div>

            {/* Job Description card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-3">
              <div>
                <p className="text-sm font-semibold text-neutral-800 mb-1">💼 Job Description</p>
                <p className="text-xs text-neutral-400">Paste the full job posting — requirements, responsibilities, qualifications</p>
              </div>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the job description here…"
                className="w-full min-h-[280px] sm:min-h-[340px] px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 transition placeholder:text-neutral-400"
                required
              />
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit"
            disabled={loading || !resume.trim() || !jobDescription.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-900 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Analyzing your resume…
              </>
            ) : <>✨ Analyze Resume</>}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div id="results" className="mt-8 space-y-4 animate-fadeUp">

            {/* Score */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <ScoreRing score={result.matchScore}/>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="font-semibold text-neutral-900 text-base mb-1.5">Overall Assessment</h2>
                  <p className="text-sm text-neutral-600 leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </div>

            {/* Strengths + Missing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultSection icon="✅" title="Your Strengths" items={result.strengths} dotColor="bg-emerald-400"/>
              <ResultSection icon="⚠️" title="Missing Skills" items={result.missingSkills} dotColor="bg-amber-400"/>
            </div>

            {/* Improvements + Career */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultSection icon="💡" title="How to Improve Your Resume" items={result.improvements} dotColor="bg-blue-400"/>
              <ResultSection icon="🚀" title="Career Advice" items={result.careerAdvice || []} dotColor="bg-violet-400"/>
            </div>

            {/* Interview Readiness */}
            {result.interviewReadiness && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span>🎯</span>
                  <h3 className="font-semibold text-neutral-900 text-sm">Interview Readiness</h3>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">{result.interviewReadiness}</p>
              </div>
            )}

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
