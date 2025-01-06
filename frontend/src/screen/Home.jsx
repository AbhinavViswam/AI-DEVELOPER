import React, { useContext, useState } from 'react'
import { UserContext } from '../context/UserContext'
import axios from "../config/axios"

function Home() {
  const {user}=useContext(UserContext);
  const [isModal ,setIsModal]=useState(false);
  const [projectName, setProjectName]=useState("");
  const createProject=async(e)=>{
    e.preventDefault();
    await axios.post("/project/create",{
      projectName
    })
    setProjectName("")
    setIsModal(false);
  }
  return (
    <div>
      <button onClick={()=>setIsModal(true)}>hello</button>
      {isModal && (
        <div>
          <form onSubmit={createProject}>
            <input type="text" placeholder='Project name' value={projectName} onChange={(e)=>setProjectName(e.target.value)} />
            <button>Create</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Home