import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import LandingPage from './components/LandingPage'
import './App.css'

function App() {
  const [view, setView] = useState('landing');

  const enterApp = () => {
    setView('dashboard');
  };

  return (
    <>
      {view === 'landing' ? (
        <LandingPage onEnter={enterApp} />
      ) : (
        <Dashboard />
      )}
    </>
  )
}

export default App
