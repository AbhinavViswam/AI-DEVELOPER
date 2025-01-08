import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FaUsers } from "react-icons/fa";

function Project() {
    const location = useLocation()
    console.log(location.state)

    const [selectedUserId, setSelectedUserId] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const users = [
        { id: 1, email: 'user1@mail.com', description: 'User 1 description' },
        { id: 2, email: 'user2@mail.com', description: 'User 2 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
        { id: 3, email: 'user3@mail.com', description: 'User 3 description' },
    ]

    const handleUserClick = (id) => {
        setSelectedUserId(id)
    }

    return (
        <div className='flex w-screen h-screen'>
            <section className='h-screen min-w-96 bg-green-100'>
                <div className='min-h-16 w-96 bg-green-300 relative'>
                    <button 
                        className='absolute right-2 top-2 text-black px-2 py-2 rounded-[50%] bg-white'
                        onClick={() => setIsModalOpen(true)}
                    >
                        <FaUsers className='text-2xl'/>
                    </button>
                </div>
                <div className='max-w-[250px] bg-white min-h-10 flex flex-col rounded-xl py-1 px-2 mt-3 ml-1'>
                    <p className='text-xs opacity-50'>user123@mail.com</p> 
                    <p className='text-sm'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p> 
                </div>
            </section>

            {isModalOpen && (
                <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center'>
                    <div className='bg-white rounded-lg py-6 px-4 w-3/4 max-w-md max-h-96 overflow-y-auto flex flex-col'>
                        <ul>
                            {users.map(user => (
                                <li 
                                    key={user.id} 
                                    className='p-2 border-b cursor-pointer hover:bg-gray-200'
                                    onClick={() => handleUserClick(user.id)}
                                >
                                    <p className='text-sm'>{user.email}</p>
                                    <p className='text-xs opacity-50'>{user.description}</p>
                                </li>
                            ))}
                        </ul>
                        <button 
                            className='mt-4 bg-red-500 text-white px-4 py-2 rounded'
                            onClick={() => setIsModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Project