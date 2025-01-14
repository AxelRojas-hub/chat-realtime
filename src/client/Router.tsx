import React from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home.js'
import Chat from './components/Chat.js'
import SignIn from './components/SignIn.js'

const Router: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/home" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  )
}

export default Router
