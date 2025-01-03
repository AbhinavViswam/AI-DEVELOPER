import React from 'react'
import Login from '../screen/Login'
import Register from '../screen/Register'
import Home from '../screen/Home'
import {BrowserRouter,Route, Routes} from 'react-router-dom'

function AppRoutes() {
  return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={ <Home/> } />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
        </Routes>
        </BrowserRouter>
  )
}

export default AppRoutes