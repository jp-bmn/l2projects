import React, { createContext, useContext, useState } from 'react'

const PageNavContext = createContext(null)

export function usePageNav() {
  const ctx = useContext(PageNavContext)
  if (!ctx) throw new Error('usePageNav must be used within PageNavProvider')
  return ctx
}

const TOTAL_PAGES = 6

export function PageNavProvider({ children }) {
  const [currentPage, setCurrentPage] = useState(0)

  const goToPage = (index) => {
    const next = Math.max(0, Math.min(TOTAL_PAGES - 1, index))
    setCurrentPage(next)
  }

  return (
    <PageNavContext.Provider value={{ currentPage, goToPage, totalPages: TOTAL_PAGES }}>
      {children}
    </PageNavContext.Provider>
  )
}
