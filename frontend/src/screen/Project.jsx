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
    const [fileTree, setFileTree] = useState({});
    const [currentFile, setCurrentFile] = useState("newFile");
    const [openFiles, setOpenFiles] = useState(new Set());
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);
    const messageBox = useRef(null);
    const [newFileName, setNewFileName] = useState("");

    const { user } = useContext(UserContext);

    const openModal = () => setIsModalOpen(true);

    const closeErrorModal = () => {
        setShowError(false);
        setError(null);
    };

    const saveFileTree = async (ft) => {
        try {
            await axios.put("/project/updatefiletree", {
                projectId: location.state.project._id,
                fileTree: ft,
            });
        } catch (err) {
            setError("Failed to save file tree.");
            setShowError(true);
            console.error(err);
        }
    };

    const fetchFileTree = async () => {
        try {
            const res = await axios.get(`/project/showmyproject/${location.state.project._id}`);
            const fileTreee = res.data.o.fileTree || {};
            setFileTree(fileTreee);
        } catch (err) {
            setError("Failed to fetch file tree.");
            setShowError(true);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFileTree();
    }, []);

    const showCollaborators = async () => {
        try {
            const res = await axios.get(`/project/showmyproject/${location.state.project._id}`);
            setOwner(res.data.o.owner[0].ownerEmail);
            setUsers(res.data.o.users);
        } catch (err) {
            setError("Failed to load collaborators.");
            setShowError(true);
            console.error(err);
        }
    };

    useEffect(() => {
        showCollaborators();
    }, []);

    useEffect(() => {
        inititializeSocket(location.state.project._id);

        recieveMessage('project-message', (data) => {
            try {
                const message = JSON.parse(data.message);
                appendIncomingMessages(data);
                if (message.fileTree) {
                    setFileTree(message.fileTree);
                }
            } catch (e) {
                appendIncomingMessages(data);
            }
        });

        return () => {
        };
    }, []);

    const addCollab = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/project/addpartner/${location.state.project._id}`, {
                partnerEmail: partner,
            });
            setPartner("");
            await showCollaborators();
        } catch (err) {
            setError("Failed to add collaborator.");
            setShowError(true);
            console.error(err);
        }
    };

    const send = () => {
        try {
            const newMessage = {
                message,
                sender: user,
            };
            sendMessage("project-message", newMessage);
            appendOutgoingMessages(newMessage);
            setMessage("");
        } catch (err) {
            setError("Failed to send message.");
            setShowError(true);
            console.error(err);
        }
    };

    const scrolltoBottom = () => {
        messageBox.current.scrollTop = messageBox.current.scrollHeight;
    };

    const appendIncomingMessages = (messageObject) => {
        setMessages((prevMessages) => [...prevMessages, messageObject]);
        scrolltoBottom();
    };

    const appendOutgoingMessages = (messageObject) => {
        setMessages((prevMessages) => [...prevMessages, messageObject]);
        scrolltoBottom();
    };

    const closeFile = (file) => {
        setOpenFiles((prevOpenFiles) => {
            const newOpenFiles = new Set(prevOpenFiles);
            newOpenFiles.delete(file);
            return newOpenFiles;
        });
        setCurrentFile((prevCurrentFile) => (prevCurrentFile === file ? null : prevCurrentFile));
    };

    const addFileToTree = () => {
        if (newFileName.trim() === "") {
            setError("File name cannot be empty.");
            setShowError(true);
            return;
        }
        if (fileTree[newFileName]) {
            setError("File already exists.");
            setShowError(true);
            return;
        }
        const updatedFileTree = {
            ...fileTree,
            [newFileName]: {
                file: {
                    contents: "",
                },
            },
        };
        setFileTree(updatedFileTree);
        saveFileTree(updatedFileTree);
        setNewFileName("");
    };

    const updateFileContents = (file, contents) => {
        const updatedFileTree = {
            ...fileTree,
            [file]: {
                ...fileTree[file],
                file: {
                    ...fileTree[file]?.file,
                    contents,
                },
            },
        };
        setFileTree(updatedFileTree);
        saveFileTree(updatedFileTree);
    };

    const deleteFileFromTree = (fileName) => {
        const updatedFileTree = { ...fileTree };
        delete updatedFileTree[fileName];
        setFileTree(updatedFileTree);
        saveFileTree(updatedFileTree);
        if (currentFile === fileName) {
            setCurrentFile(null);
        }
        setOpenFiles((prevOpenFiles) => {
            const newOpenFiles = new Set(prevOpenFiles);
            newOpenFiles.delete(fileName);
            return newOpenFiles;
        });
    };


    return (
        <div className='flex w-screen h-screen'>
            {showError && (
                <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg">
                    <div className="flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={closeErrorModal} className="ml-4 text-lg font-bold">&times;</button>
                    </div>
                </div>
            )}
            <section className='h-screen min-w-96 bg-gray-900'>
                <div className='min-h-16 w-96 bg-gray-900 relative'>
                    <h1 className='text-2xl text-white p-2'>{location.state.project.name}</h1>
                    <button
                        className='absolute right-2 top-2 text-white px-2 py-2 rounded-[50%] bg-gray-700'
                        onClick={openModal}
                    >
                        <FaUsers className='text-2xl' />
                    </button>
                </div>
                <div className='message-box bg-gray-800 min-w-96 max-w-96 flex flex-col py-1 px-2 min-h-[84vh] max-h-[84vh] overflow-y-auto scroll-smooth' ref={messageBox}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`max-w-[250px] w-full flex flex-col rounded-xl px-2 py-1 mt-3 ${msg.sender.email === user.email ? 'bg-white text-dark-green ml-auto mr-1' : msg.sender.email === 'AI' ? 'bg-gray-950 text-white max-w-[400px] overflow-x-auto min-h-max' : 'bg-white text-black ml-0'}`}>
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
                        className='p-2 px-4 outline-none flex-grow border-2 border-gray-700 bg-gray-800 text-white' type="text" placeholder='Enter a message' />
                    <button
                        onClick={send}
                        className='px-5 bg-gray-700 text-white'>send</button>
                </div>
            </section>

            <section className='right w-screen h-screen bg-gray-800 flex flex-grow'>
                <div className="file-tree flex flex-col min-w-60 max-w-60 h-screen overflow-y-auto bg-gray-600">
                    {Object.keys(fileTree || {}) .map((file) => (
                        <div key={file} className="flex justify-between items-center bg-gray-950 min-h-10 border-b border-b-white text-sm text-white">
                            <button className='flex-grow text-left p-2' onClick={() => {
                                setCurrentFile(file);
                                setOpenFiles(new Set([...openFiles, file]));
                            }}>{file}</button>
                            <button className='p-2 text-red-500' onClick={() => deleteFileFromTree(file)}>
                                <IoIosClose />
                            </button>
                        </div>
                    ))}
                    <div className="p-2">
                        <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            className='p-2 border-2 border-gray-700 bg-gray-800 text-white rounded-md w-full'
                            placeholder='New file name'
                        />
                        <button
                            onClick={addFileToTree}
                            className='mt-2 w-full bg-gray-700 text-white p-2 rounded-md'
                        >
                            Add File
                        </button>
                    </div>
                </div>
                <div className="code-editor flex-grow flex flex-col">
                    <div className='top flex justify-between'>
                        <div className="files flex">
                        {
                            Array.from(openFiles).map((file, i) => (
                                <div key={i} className="code-editor-header border-r border-r-white max-w-max flex justify-between items-center p-2 bg-gray-900">
                                    <button className='text-sm font-semibold text-white' onClick={() => setCurrentFile(file)}>{file}</button>
                                    <button onClick={() => closeFile(file)} className='p-2 text-white'>
                                        <IoIosClose />
                                    </button>
                                </div>
                            ))
                        }
                        </div>
                    </div>
                    <textarea
                        className="w-full h-full p-2 border-2 border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none"
                        value={fileTree[currentFile]?.file?.contents || ''}
                        onChange={(e) => updateFileContents(currentFile, e.target.value)}
                    />
                </div>
            </section>

            {isModalOpen && (
                <div className='fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center'>
                    <div className='bg-gray-900 rounded-lg py-6 px-4 w-3/4 max-w-md max-h-96 overflow-y-auto flex flex-col'>
                        {isLoading ? (
                            <div className='flex justify-center items-center h-full'>
                                <div className='loader'>loading...</div> {/* Add your loader component or CSS here */}
                            </div>
                        ) : (
                            <div>
                                <div className='flex flex-col justify-center px-4 py-2'>
                                    <form onSubmit={addCollab} className='flex justify-around'>
                                        <input type="text" value={partner} onChange={(e) => setPartner(e.target.value)} className='border-2 border-gray-700 bg-gray-800 text-white mt-4 px-4 py-2 rounded outline-none' />
                                        <button className='mt-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600'>Add Collaborator</button>
                                    </form>
                                    <button
                                        className='mt-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600'
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                                <h1 className='text-white'>Owner:{owner}</h1>
                                <ul>
                                    {users.map((user, i) => (
                                        <li
                                            key={i}
                                            className='p-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800'
                                        >
                                            <p className='text-sm text-white'>{user.userEmail}</p>
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
