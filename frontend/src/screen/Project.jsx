import React, { useState, useEffect ,useContext,useRef} from 'react'
import { useLocation } from 'react-router-dom'
import { FaUsers } from "react-icons/fa";
import axios from "../config/axios"
import { inititializeSocket, sendMessage, recieveMessage } from '../config/socket';
import { UserContext } from '../context/UserContext';

function Project() {
    const location = useLocation()
    const [partner,setPartner]=useState("")
    const [owner,setOwner]=useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [users,setUsers]=useState([])
    const [message,setMessage]=useState("")
   
    const messageBox = useRef(null);
    
    const {user}=useContext(UserContext)

    const openModal = () => {
        setIsModalOpen(true)
    }
    const showCollaborators=async()=>{
        const res=await axios.get(`/project/showmyproject/${location.state.project._id}`)
        setOwner(res.data.o.owner)
            setUsers(res.data.o.users);
            console.log(users)
    }

    const addCollab=async(e)=>{
        e.preventDefault()
      
        await axios.put(`/project/addpartner/${location.state.project._id}`,{
            partnerEmail:partner 
        })
        setPartner("")
        await showCollaborators();
    }

    function send(){
        sendMessage("project-message",{
            message,
            sender:user
        })
        console.log(user)
        appendOutgoingMessages(message)
        setMessage("")
    }

    useEffect(()=>{
        async function loadCollabs(){
            setIsLoading(true)
            await showCollaborators()
            setIsLoading(false)
        };
        loadCollabs()
    },[])

    useEffect(()=>{
        console.log("project id",location.state.project._id)
        inititializeSocket(location.state.project._id)

        recieveMessage('project-message',(data)=>{
            console.log(data)
            appendIncomingMessages(data)
        })

    },[])

    function appendIncomingMessages(messageObject) {
      
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('max-w-[250px]', 'bg-white', 'min-h-10', 'flex', 'flex-col', 'rounded-xl', 'py-1', 'px-2', 'mt-3', 'ml-1');
        
        messageDiv.innerHTML = `            
            <p class='text-xs opacity-50 text-right'>${messageObject.sender.email}</p>
            <p class='text-sm text-right'>${messageObject.message}</p>
        `;
        messageBox.current.appendChild(messageDiv);
    }
    
    function appendOutgoingMessages(messageText) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(
            'max-w-[250px]',
            'bg-blue-100',
            'min-h-10',
            'flex',
            'flex-col',
            'rounded-xl',
            'py-1',
            'px-2',
            'mt-3',
            'ml-auto', // Aligns to the right for outgoing messages
            'mr-1' // Adds a margin from the edge
        );
    
        messageDiv.innerHTML = `
            <p class='text-xs opacity-50 text-right'>You</p>
            <p class='text-sm text-right'>${messageText}</p>
        `;
    
        messageBox.current.appendChild(messageDiv);
    }


    return (
        <div className='flex w-screen h-screen'>
            <section className='h-screen min-w-96 bg-green-100'>
                <div className='min-h-16 w-96 bg-green-300 relative'>
                    <button 
                        className='absolute right-2 top-2 text-black px-2 py-2 rounded-[50%] bg-white'
                        onClick={openModal}
                    >
                        <FaUsers className='text-2xl'/>
                    </button>
                </div>
                <div className='message-box max-w-[250px] bg-white min-h-10 flex flex-col rounded-xl py-1 px-2 mt-3 ml-1 h-[calc(100vh-200px)] overflow-y-auto' ref={messageBox}>
                    {/* Messages will be appended here */}
                </div>
                <div className="inputField max-w-96 min-w-96 flex absolute bottom-0">
                        <input
                        value={message}
                        onChange={(e)=>setMessage(e.target.value)}
                            className='p-2 px-4 outline-none flex-grow border-2 border-black' type="text" placeholder='Enter a message' />
                        <button
                            onClick={send}
                            className='px-5 bg-slate-950 text-white'>send</button>
                    </div>
            </section>

            {isModalOpen && (
                <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center'>
                    <div className='bg-white rounded-lg py-6 px-4 w-3/4 max-w-md max-h-96 overflow-y-auto flex flex-col'>
                        {isLoading ? (
                            <div className='flex justify-center items-center h-full'>
                                <div className='loader'>loading...</div> {/* Add your loader component or CSS here */}
                            </div>
                        ) : (
                            <div>
                                <div className='flex flex-col justify-center px-4 py-2'>
                                    <form onSubmit={addCollab} className='flex justify-around'>
                                        <input type="text" value={partner} onChange={(e)=>setPartner(e.target.value)} className='border-2 border-green-500 mt-4 px-4 py-2 rounded outline-none'  />
                                        <button className='mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700'>Add Collaborator</button>
                                    </form>
                                <button 
                                    className='mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700'
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Close
                                </button>
                                </div>
                                <h1>Owner:{JSON.stringify(owner)}</h1>
                                <ul>
                                    {users.map((user,i) => (
                                        <li 
                                            key={i} 
                                            className='p-2 border-b cursor-pointer hover:bg-gray-200'
                                        >
                                            <p className='text-sm'>{user.userEmail}</p>
                                        </li>
                                    ))}
                                </ul>
                               
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Project