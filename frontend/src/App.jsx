import React, { useEffect } from 'react'
import { PageNavProvider, usePageNav } from './context/PageNavContext'
import PageNav from './components/ui/PageNav'
import Page1Intro from './components/pages/Page1Intro'
import Page2NYC from './components/pages/Page2NYC'
import Page3Dashboard from './components/pages/Page3Dashboard'
import Page4Devices from './components/pages/Page4Devices'
import Page5Features from './components/pages/Page5Features'
import Page6Outro from './components/pages/Page6Outro'

function AppContent() {
  const { currentPage } = usePageNav()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <main className="w-full overflow-hidden" style={{ minHeight: '100vh' }}>
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{
            width: '600vw',
            transform: `translateX(-${currentPage * 100}vw)`,
          }}
        >
          <div id="page1" className="w-screen min-h-screen flex-shrink-0">
            <Page1Intro />
          </div>
          <div id="page2" className="w-screen min-h-screen flex-shrink-0">
            <Page2NYC />
          </div>
          <div id="page3" className="w-screen min-h-screen flex-shrink-0">
            <Page3Dashboard />
          </div>
          <div id="page4" className="w-screen min-h-screen flex-shrink-0">
            <Page4Devices />
          </div>
          <div id="page5" className="w-screen min-h-screen flex-shrink-0">
            <Page5Features />
          </div>
          <div id="page6" className="w-screen min-h-screen flex-shrink-0">
            <Page6Outro />
          </div>
        </div>
      </main>
      <PageNav />
    </>
  )
}

export default function App() {
  return (
    <PageNavProvider>
      <AppContent />
    </PageNavProvider>
  )
}
