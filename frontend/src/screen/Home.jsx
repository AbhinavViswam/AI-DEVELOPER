import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext'

function Home() {
  const {user}=useContext(UserContext)
  
  return (
    <div>
      {JSON.stringify(user)}
    </div>
  )
}

export default Home