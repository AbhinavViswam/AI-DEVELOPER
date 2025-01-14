import React from 'react'
import Login from '../screen/Login'
import Register from '../screen/Register'
import Home from '../screen/Home'
import Project from '../screen/Project'
import {BrowserRouter,Route, Routes} from 'react-router-dom'
import UserAuth from '../auth/UserAuth'

function AppRoutes() {
  return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
            {/* <Route path="/" element={ <Home/> } /> */}
            <Route path="/" element={ <UserAuth><Home/></UserAuth> } />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            {/* <Route path="/project" element={<Project/>} /> */}
            <Route path="/project" element={<UserAuth><Project/></UserAuth>} />
        </Routes>
        </BrowserRouter>
  )
}

export default AppRoutes