import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FaUsers } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import axios from "../config/axios";
import { inititializeSocket, sendMessage, recieveMessage } from '../config/socket';
import { UserContext } from '../context/UserContext';
import Markdown from 'markdown-to-jsx';

function Project() {
    const location = useLocation();
    const [partner, setPartner] = useState("");
    const [owner, setOwner] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentFile,setCurrentFile]=useState(null)
    const [openFiles,setOpenFiles]=useState([])

    const [fileTree,setFileTree] = useState({
        "app.js":{
            content:'const express=require("express");'
        },
        "package.json":{
            content:`{
            "name": "project",
            }`
        }
    });
   
    const messageBox = useRef(null);
    
    const { user } = useContext(UserContext);

    const openModal = () => {
        setIsModalOpen(true);
    };

    function WriteAiMessage({ message }) {
        const messageObject=JSON.parse(message);
        return (
            <div className='overflow-auto p-2'>
                <Markdown
                    children={messageObject.text}
                />
            </div>
        );
    }

    const showCollaborators = async () => {
        const res = await axios.get(`/project/showmyproject/${location.state.project._id}`);
        setOwner(res.data.o.owner);
        setUsers(res.data.o.users);
        console.log(users);
    };

    const addCollab = async (e) => {
        e.preventDefault();
        await axios.put(`/project/addpartner/${location.state.project._id}`, {
            partnerEmail: partner 
        });
        setPartner("");
        await showCollaborators();
    };

    function send() {
        const newMessage = {
            message,
            sender: user
        };
        sendMessage("project-message", newMessage);
        appendOutgoingMessages(newMessage);
        setMessage("");
    }

    useEffect(() => {
        async function loadCollabs() {
            setIsLoading(true);
            await showCollaborators();
            setIsLoading(false);
        }
        loadCollabs();
    }, []);

    useEffect(() => {
        console.log("project id", location.state.project._id);
        inititializeSocket(location.state.project._id);

        recieveMessage('project-message', (data) => {
            console.log(data);
            appendIncomingMessages(data);
        });
    }, []);

    function scrolltoBottom() { 
        messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }

    function appendIncomingMessages(messageObject) {
        setMessages((prevMessages) => [...prevMessages, messageObject]);
        scrolltoBottom();
    }
    
    function appendOutgoingMessages(messageObject) {
        setMessages((prevMessages) => [...prevMessages, messageObject]);
        scrolltoBottom();
    }

    return (
        <div className='flex w-screen h-screen'>
            <section className='left h-screen min-w-96 bg-green-100'>
                <div className='min-h-16 w-96 bg-green-300 relative'>
                    <button 
                        className='absolute right-2 top-2 text-black px-2 py-2 rounded-[50%] bg-white'
                        onClick={openModal}
                    >
                        <FaUsers className='text-2xl'/>
                    </button>
                </div>
                <div className='message-box bg-green-50 min-w-96 max-w-96 flex flex-col py-1 px-2 min-h-[84vh] max-h-[84vh] overflow-y-auto scroll-smooth' ref={messageBox}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`max-w-[250px] w-full flex flex-col rounded-xl px-2 py-1 mt-3 ${msg.sender.email === user.email ? 'bg-blue-100 ml-auto mr-1' : msg.sender.email === 'AI' ? 'bg-gray-800 text-white max-w-[400px] overflow-x-auto min-h-max' : 'bg-green-300 ml-0'}`}>
                            <p className={`text-xs opacity-50 ${msg.sender.email === user.email ? 'text-right' : 'text-left'}`}>{msg.sender.email === user.email ? 'You' : msg.sender.email}</p>
                            {msg.sender.email === 'AI' ? (
                                <WriteAiMessage message={msg.message} />
                            ) : (
                                <Markdown className={`text-sm ${msg.sender.email === user.email ? 'text-right' : 'text-left'}`}>{msg.message}</Markdown>
                            )}
                        </div>
                    ))}
                </div>
                <div className="inputField max-w-96 min-w-96 flex absolute bottom-0">
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className='p-2 px-4 outline-none flex-grow border-2 border-black' type="text" placeholder='Enter a message' />
                    <button
                        onClick={send}
                        className='px-5 bg-slate-950 text-white'>send</button>
                </div>
            </section>

            <section className='right h-full flex flex-grow bg-green-50'>
                <div className='FileExplorer bg-green-100 min-w-60'>
                    <div className="filetree flex flex-col gap-1">
                        {
                            Object.keys(fileTree).map((file,index)=>(
                                <button onClick={() => {
                                    setCurrentFile(file)
                                    setOpenFiles([...new Set([...openFiles, file])])
                                }

                                } key={index} className="tree-element bg-slate-200 p-2">
                            <p>{file}</p>
                        </button>
                            ))
                        }
                    </div>
                </div>
                {
                    currentFile &&(
                
                <div className='code-editor flex flex-col flex-grow h-full'>
                    <div className="top flex items-center justify-between bg-slate-200 p-2 max-w-max">
                    {
                        openFiles.map((file,index)=>(
                            <div>
                                <button onClick={()=>setCurrentFile(file)} key={index} className="p-2">{file}</button>
                                <button onClick={()=>setCurrentFile(null)}><IoIosClose/></button>
                            </div>
                        ))  
                    }
                    </div>
                    <div className="bottom flex flex-grow">
                        {
                            fileTree[currentFile] && (
                                <textarea value={fileTree[currentFile].content} onChange={(e)=>setFileTree({...fileTree,[currentFile]:{content:e.target.value}})} className="w-full h-full p-2 outline-none" />

                        )}
                    </div>

                </div>
)}

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
                                        <input type="text" value={partner} onChange={(e) => setPartner(e.target.value)} className='border-2 border-green-500 mt-4 px-4 py-2 rounded outline-none'  />
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
                                    {users.map((user, i) => (
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
    );
}

export default Project;
