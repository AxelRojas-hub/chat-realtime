import React from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home.js'
import Chat from './components/Chat.js'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  )
}

export default App
