import React from 'react'
import { usePageNav } from '../../context/PageNavContext'

export default function PageNav() {
  const { currentPage, goToPage, totalPages } = usePageNav()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none"
      aria-label="Page navigation"
    >
      <div className="pointer-events-auto flex items-center gap-4">
        {currentPage > 0 ? (
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-white/90 text-gray-800 shadow-lg hover:bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <span aria-hidden>←</span>
            Previous
          </button>
        ) : (
          <span className="w-24" />
        )}
      </div>

      {/* Page dots */}
      <div className="pointer-events-auto flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToPage(i)}
            aria-label={`Go to page ${i + 1}`}
            aria-current={currentPage === i ? 'true' : undefined}
            className="w-2.5 h-2.5 rounded-full transition-all duration-200 hover:scale-125"
            style={{
              background: currentPage === i ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
              transform: currentPage === i ? 'scale(1.25)' : undefined,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-auto flex items-center gap-4">
        {currentPage < totalPages - 1 ? (
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-white/90 text-gray-800 shadow-lg hover:bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Next
            <span aria-hidden>→</span>
          </button>
        ) : (
          <span className="w-20" />
        )}
      </div>
    </nav>
  )
}
