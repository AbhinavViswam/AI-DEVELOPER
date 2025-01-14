import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "../config/axios.js"
import { UserContext } from '../context/UserContext.jsx';

const Login = () => {

    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const navigate=useNavigate()
    const {setUser} =useContext(UserContext)

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            const res=await axios.post("/users/login",{
                email,
                password
            })
            console.log(res.data.o)
            localStorage.setItem('token',res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.o));
            setUser(res.data.o)
            console.log(res.data)
            navigate("/")
        } catch (error) {
            console.log(error) 
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                        <input
                            onChange={(e)=>setEmail(e.target.value)}
                            type="email"
                            id="email"
                            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
                        <input
                            onChange={(e)=>setPassword(e.target.value)}
                            type="password"
                            id="password"
                            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                        Login
                    </button>
                </form>
                <p className="text-gray-400 mt-4 text-center">
                    Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;