import React from 'react'
import TacticsBoard from './components/TacticsBoard'
import './App.css'

function App() {
  return (
    <>
      <header className="top-bar">
        <div className="contact-info">
          <span>📞 Contact: +91 8882493607</span>
          <span className="separator">|</span>
          <span>✉️ contact@stratgen.com</span>
        </div>
      </header>
      <div className="card glass-panel">
        <h1 className="app-title">StratGen</h1>
        <TacticsBoard />
      </div>
    </>
  )
}

export default App
