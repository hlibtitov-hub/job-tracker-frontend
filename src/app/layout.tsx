import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JobTrack — Track Your Applications',
  description: 'Stay on top of every job application in one clean dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f8f7f4] min-h-screen">
        {children}
      </body>
    </html>
  )
}
