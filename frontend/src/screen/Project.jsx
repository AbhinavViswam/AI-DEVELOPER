import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FaUsers } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdOutlineMessage } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";
import axios from "../config/axios";
import { inititializeSocket, sendMessage, recieveMessage } from '../config/socket';
import { UserContext } from '../context/UserContext';
import Markdown from 'markdown-to-jsx';

function Project() {
    const location = useLocation();
    const [messageBar, setMessageBar]=useState(false)
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
    function WriteAiMessage({ message }) {
        try {
            const messageObject = JSON.parse(message);       
            return (
                <div className='overflow-auto p-2'>
                    <Markdown children={messageObject.text} />
                </div>
            );
        } catch (err) {
            setError("Failed to parse AI message.");
            setShowError(true);
            console.error(err);
            return <div className='text-red-500'>Error parsing AI message.</div>;
        }
    }

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
    useEffect(() => {
        if (!location.state?.project) {
            setError("no project data found");
            setShowError(true);
        }
    }, []);
    
    const fetchFileTree = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/project/showmyproject/${location.state.project._id}`);
            const fileTreee = res.data.o.fileTree || {};
            setFileTree(fileTreee);
        } catch (err) {
            setError("Failed to fetch file tree.");
            setShowError(true);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFileTree();
    }, []);

    const showCollaborators = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/project/showmyproject/${location.state.project._id}`);
            setOwner(res.data.o.owner[0].ownerEmail);
            setUsers(res.data.o.users);
        } catch (err) {
            setError("Failed to load collaborators.");
            setShowError(true);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        showCollaborators();
    }, []);

    useEffect(() => {
        const socket = inititializeSocket(location.state.project._id);

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
            socket.disconnect();
        };
    }, []);

    const addCollab = async (e) => {
        e.preventDefault();
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
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
    const updatedFileTree = JSON.parse(JSON.stringify(fileTree));
    updatedFileTree[file] = {
        ...updatedFileTree[file],
        file: {
            ...updatedFileTree[file]?.file,
            contents,
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
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Loading and Error Modals */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div>Loading...</div>
            </div>
          </div>
        )}
        {showError && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="flex justify-between items-center">
                <span className="text-red-600 font-semibold">{error}</span>
                <button
                  onClick={closeErrorModal}
                  className="text-red-500 text-lg hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        )}
    
        {/* Sidebar Section (File Tree and Messages) */}
        <aside className="lg:w-1/3 bg-gray-50 p-4 overflow-auto flex flex-col gap-4">
          {/* Project Header */}
          <section className=" bg-blue-100 rounded-md shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="font-bold text-lg text-gray-800">{location.state.project.name}</h1>
              <div className="flex gap-5">
                <button className="text-lg" onClick={openModal}>
                  <FaUsers />
                </button>
                <button className="text-lg" onClick={() => setMessageBar(true)}>
                  <MdOutlineMessage />
                </button>
              </div>
            </div>
    
            {/* Message Bar */}
            {messageBar && (
              <div className="p-4">
                <div ref={messageBox} className="min-h-[60vh] max-h-[60vh] overflow-auto">
                  <button
                    className="min-w-full text-center py-2 bg-red-600 text-white rounded-md"
                    onClick={() => setMessageBar(false)}
                  >
                    Close
                  </button>
                  {messages.map((msg, index) => (
                    <div key={index} className="py-2">
                      <p className="text-sm font-semibold">
                        {msg.sender.email === user.email ? "You" : msg.sender.email}
                      </p>
                      {msg.sender.email === "AI" ? (
                        <WriteAiMessage message={msg.message} />
                      ) : (
                        <Markdown>{msg.message}</Markdown>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    type="text"
                    placeholder="Enter a message"
                    className="flex-grow border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={send}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </section>
    
          {/* File Tree */}
          <section className="bg-blue-50 p-4 flex-grow">
            <div className=" p-4">
              <div className="flex gap-2 md:flex md:flex-col">
                {Object.keys(fileTree || {}).map((file) => (
                  <div key={file} className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setCurrentFile(file);
                        setOpenFiles(new Set([...openFiles, file]));
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      {file}
                    </button>
                    <button
                      onClick={() => deleteFileFromTree(file)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MdDeleteForever />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="New file name"
                  className="flex-grow border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addFileToTree}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Add File
                </button>
              </div>
            </div>
          </section>
        </aside>
    
        {/* Main Section (Code Editor) */}
        <main className="lg:w-2/3 flex flex-col h-full bg-white p-4">
          <div className="flex gap-2">
            {Array.from(openFiles).map((file, i) => (
              <div key={i} className="flex justify-between">
                <button
                  onClick={() => setCurrentFile(file)}
                  className="text-blue-500 hover:underline"
                >
                  {file}
                </button>
                <button
                  onClick={() => closeFile(file)}
                  className="text-red-500 hover:text-red-700"
                >
                  <IoIosClose />
                </button>
              </div>
            ))}
          </div>
          <textarea
            value={fileTree[currentFile]?.file?.contents || ""}
            onChange={(e) => updateFileContents(currentFile, e.target.value)}
            placeholder="Select or create a file to edit"
            className="w-full flex-grow border px-4 py-2 rounded-md outline-none shadow-lg"
          />
        </main>
    
        {/* Modal for Adding Collaborators */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              {isLoading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <div>
                  <form onSubmit={addCollab} className="space-y-4">
                    <input
                      type="text"
                      value={partner}
                      onChange={(e) => setPartner(e.target.value)}
                      placeholder="Enter collaborator email"
                      className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Add Collaborator
                    </button>
                  </form>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="mt-4 w-full bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Close
                  </button>
                  <h1 className="mt-4 font-bold">Owner: {owner}</h1>
                  <ul className="mt-2 space-y-2">
                    {users.map((user, i) => (
                      <li key={i} className="text-gray-700">
                        {user.userEmail}
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
