"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  X,
  Plus,
  Save,
  RotateCcw,
  FileText,
  Users,
  MessageSquare,
  Trash2,
  Folder,
  MoveLeft,
  RefreshCcw,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  useAddPartner,
  useDeletePartner,
  useProfile,
  useShowMyProject,
  useUpdateFileTree,
} from "@/backend/query";
import {
  disconnectSocket,
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "@/socket";
import Markdown from "markdown-to-jsx";

export default function Page() {
  const [newFileName, setNewFileName] = useState("");
  const [fileTree, setFileTree] = useState<Record<string, any>>({});
  const [currentFile, setCurrentFile] = useState<string | null>("newFile");
  const [openFiles, setOpenFiles] = useState<Set<string>>(new Set());
  const [content, setContent] = useState<string>(
    "Create or select a file to edit"
  );

  // modal / partner state
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerError, setPartnerError] = useState<string | null>(null);
  const [partnerSuccess, setPartnerSuccess] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messageBoxRef = useRef<HTMLDivElement | null>(null);

  const param = useParams();
  const rawId = param?.projectid;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { data } = useShowMyProject(id);
  const { data: userData } = useProfile();
  const { mutate: mutateUpdateFileTree, isPending } = useUpdateFileTree();
  const { mutate: mutateAddPartner, isPending: isAddPartnerPending } =
    useAddPartner();
  const { mutate: mutateDeletePartner, isPending: isDeletePartnerPending } =
    useDeletePartner();

  // sync fileTree when project data loads
  useEffect(() => {
    const fileTreeFromApi = data?.o?.fileTree || {};
    setFileTree(fileTreeFromApi);
    if (!currentFile || !fileTreeFromApi[currentFile]) {
      const keys = Object.keys(fileTreeFromApi);
      setCurrentFile(keys.length > 0 ? keys[0] : "newFile");
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // update content when currentFile or fileTree changes
  useEffect(() => {
    if (!currentFile) {
      setContent("Create or select a file to edit");
      return;
    }
    const contents = fileTree[currentFile]?.file?.contents;
    setContent(
      typeof contents === "string"
        ? contents
        : "Create or select a file to edit"
    );
  }, [currentFile, fileTree]);

  // file tree actions (unchanged)
  const addFileToTree = async () => {
    const name = (newFileName || "").trim();
    if (!name) return;
    if (fileTree[name]) return;

    const updatedFileTree = { ...fileTree, [name]: { file: { contents: "" } } };
    const previous = fileTree;
    setFileTree(updatedFileTree);
    setNewFileName("");
    setOpenFiles((prev) => new Set([...prev, name]));
    setCurrentFile(name);

    mutateUpdateFileTree(
      { ft: updatedFileTree, id },
      {
        onError: () => {
          setFileTree(previous);
          setOpenFiles((prev) => {
            const next = new Set(prev);
            next.delete(name);
            return next;
          });
        },
      }
    );
  };

  const deleteFileFromTree = (fileName: string) => {
    const updatedFileTree = { ...fileTree };
    delete updatedFileTree[fileName];

    const previous = fileTree;
    setFileTree(updatedFileTree);

    if (currentFile === fileName) setCurrentFile(null);
    setOpenFiles((prev) => {
      const next = new Set(prev);
      next.delete(fileName);
      return next;
    });

    mutateUpdateFileTree(
      { ft: updatedFileTree, id },
      {
        onError: () => {
          setFileTree(previous);
          setOpenFiles((prev) => new Set(prev).add(fileName));
        },
      }
    );
  };

  const closeFile = (file: string) => {
    setOpenFiles((prevOpenFiles) => {
      const newOpenFiles = new Set(prevOpenFiles);
      newOpenFiles.delete(file);
      return newOpenFiles;
    });
    setCurrentFile((prevCurrentFile) =>
      prevCurrentFile === file ? null : prevCurrentFile
    );
  };

  const saveCurrentFile = () => {
    if (!currentFile) return;
    const prev = fileTree;
    const updated = {
      ...fileTree,
      [currentFile]: {
        ...fileTree[currentFile],
        file: { ...(fileTree[currentFile]?.file || {}), contents: content },
      },
    };
    setFileTree(updated);
    mutateUpdateFileTree(
      { ft: updated, id },
      {
        onError: () => {
          setFileTree(prev); // rollback
        },
      }
    );
  };

  // ---- Partner modal handlers ----
  const openPartnerModal = () => {
    setPartnerEmail("");
    setPartnerError(null);
    setPartnerSuccess(null);
    setIsPartnerModalOpen(true);
  };

  const closePartnerModal = () => {
    setIsPartnerModalOpen(false);
  };

  const handleAddPartner = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPartnerError(null);
    setPartnerSuccess(null);

    const email = (partnerEmail || "").trim();
    if (!email) {
      setPartnerError("Partner email is required.");
      return;
    }
    // basic email validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      setPartnerError("Please enter a valid email address.");
      return;
    }

    // call mutation
    mutateAddPartner(
      { id, partnerEmail: email },
      {
        onSuccess: (res: any) => {
          setPartnerSuccess("Partner added successfully.");
          // optionally invalidate or refetch happens inside hook
          setTimeout(() => {
            setIsPartnerModalOpen(false);
            setPartnerSuccess(null);
          }, 800);
        },
        onError: (err: any) => {
          const serverMsg = err?.response?.data?.e || "Failed to add partner.";
          setPartnerError(serverMsg);
        },
      }
    );
  };

  //@ts-ignore
  function WriteAiMessage({ message }) {
    try {
      const messageObject = message;
      return (
        <div className="overflow-auto p-2">
          <Markdown children={messageObject.text} />
        </div>
      );
    } catch (err) {
      console.error(err);
      return <div className="text-red-500">Error parsing AI message.</div>;
    }
  }

  useEffect(() => {
    if (!id) return; // wait until id is defined

    const socket = initializeSocket(id);
    if (!socket) return;

    // connection debug
    socket.on("connect", () => console.log("socket connected:", socket.id));
    socket.on("connect_error", (err: any) =>
      console.error("socket connect_error:", err?.message || err)
    );

    // stable handler so we can remove it on cleanup
    const handler = (data: any) => {
      try {
        // server might send { message: "<json-string>" } or { message: {...} }
        if (data && typeof data.message === "string") {
          const parsed = JSON.parse(data.message);
          appendIncomingMessages({ ...data, message: parsed });
          if (parsed.fileTree) setFileTree(parsed.fileTree);
        } else {
          appendIncomingMessages(data);
          if (data?.message?.fileTree) setFileTree(data.message.fileTree);
        }
      } catch (err) {
        // fallback: append raw
        appendIncomingMessages(data);
      }
    };

    receiveMessage("project-message", handler);

    return () => {
      // remove this listener and disconnect
      try {
        socket.off("project-message", handler);
      } catch (e) {}
      try {
        socket.disconnect();
      } catch (e) {}
    };
  }, [id]); // <- run again whenever project id changes

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  const appendIncomingMessages = (messageObject: any) => {
    setMessages((prevMessages) => [...prevMessages, messageObject]);
    scrollToBottom();
  };

  const appendOutgoingMessages = (messageObject: any) => {
    setMessages((prevMessages) => [...prevMessages, messageObject]);
    scrollToBottom();
  };

  const handleSend = () => {
    if (!message.trim()) return;
    const newMessage = {
      message,
      sender: userData?.data?.o?.name || userData?.data?.o?.email,
    };
    sendMessage("project-message", newMessage);
    appendOutgoingMessages(newMessage);
    setMessage("");
    scrollToBottom();
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="w-10 h-10 bg-linear-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center shadow-lg"
                onClick={() => router.push("/main")}
              >
                <MoveLeft color="white" />
              </button>
              <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Folder className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  {data?.o?.name || "PROJECT"}
                </h1>
                <p className="text-sm text-slate-500">
                  Collaborative workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatOpen((p) => !p)}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium"
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline">
                  {isChatOpen ? "Close Chat" : "Open Chat"}
                </span>
              </button>

              <button
                onClick={openPartnerModal}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium"
              >
                <Users size={16} />
                <span className="hidden sm:inline">Add Partner</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* New File Input */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                placeholder="Enter filename (e.g., index.js, styles.css)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFileToTree()}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            <button
              onClick={addFileToTree}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm"
            >
              <Plus size={18} />
              <span>Create File</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Team Members</h2>
              <p className="text-sm text-slate-500">Project collaborators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Owner Section */}
            <div className="bg-linear-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-linear-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">★</span>
                </div>
                <h3 className="font-semibold text-slate-700">Owner</h3>
              </div>
              <div className="space-y-2">
                {data?.o?.owner?.map((owner: any) => (
                  <div
                    key={owner._id}
                    className="bg-white rounded-lg p-3 shadow-sm border border-slate-200"
                  >
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {owner.ownerName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {owner.ownerEmail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members Section */}
            <div className="bg-linear-to-br from-slate-50 to-gray-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-linear-to-br from-slate-600 to-gray-600 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-slate-700">
                  Collaborators ({data?.o?.users?.length || 0})
                </h3>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {data?.o?.users && data.o.users.length > 0 ? (
                  data.o.users.map((user: any) => (
                    <div
                      key={user._id}
                      className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800 truncate">
                        {user.userName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {user.userEmail}
                      </p>
                      </div>

                      <button
                        onClick={() => mutateDeletePartner({id:id,partnerEmail:user.userEmail})}
                      >
                        <Trash2 color="red" size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-400">
                      No collaborators yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Add team members to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Files and Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Files Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* All Files */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-linear-to-r from-slate-700 to-slate-800 px-4 py-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FileText size={16} />
                  All Files
                </h3>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {Object.keys(fileTree || {}).length === 0 ? (
                  <div className="text-sm text-slate-400 text-center py-8">
                    No files yet. Create one to start.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.keys(fileTree || {}).map((file) => (
                      <div
                        key={file}
                        className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors duration-150"
                      >
                        <button
                          onClick={() => {
                            setCurrentFile(file);
                            setOpenFiles((prev) => new Set([...prev, file]));
                          }}
                          className="flex-1 text-left text-sm text-indigo-600 hover:text-indigo-800 font-medium truncate"
                        >
                          {file}
                        </button>
                        <button
                          onClick={() => deleteFileFromTree(file)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded transition-all duration-150"
                          title="Delete file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Open Files */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Folder size={16} />
                  Open Files
                </h3>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {Array.from(openFiles).length === 0 ? (
                  <div className="text-sm text-slate-400 text-center py-8">
                    No open files
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Array.from(openFiles).map((file) => (
                      <div
                        key={file}
                        className={`group flex items-center justify-between p-2 rounded-lg transition-all duration-150 ${
                          currentFile === file
                            ? "bg-indigo-50 border border-indigo-200"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <button
                          onClick={() => setCurrentFile(file)}
                          className={`flex-1 text-left text-sm font-medium truncate ${
                            currentFile === file
                              ? "text-indigo-700"
                              : "text-slate-700 hover:text-indigo-600"
                          }`}
                        >
                          {file}
                        </button>
                        <button
                          onClick={() => closeFile(file)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-150"
                          title="Close file"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-linear-to-r from-slate-700 to-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="ml-3 text-sm text-slate-300 font-medium">
                    {currentFile || "No file selected"}
                  </span>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  <RefreshCcw />
                </button>
              </div>

              <div className="p-6">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Select or create a file to start editing..."
                  className="w-full h-96 border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-mono text-sm resize-none"
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    disabled={!currentFile || isPending}
                    onClick={saveCurrentFile}
                    className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    <Save size={16} />
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    disabled={!currentFile}
                    onClick={() => {
                      const contents = fileTree[currentFile!]?.file?.contents;
                      setContent(typeof contents === "string" ? contents : "");
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    <RotateCcw size={16} />
                    Revert Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-md z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mx-4 sm:mx-0">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Project Chat</h3>
                  <p className="text-xs text-blue-100">
                    Collaborate in real-time
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-150"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div
              ref={messageBoxRef}
              className="p-4 space-y-3 overflow-y-auto bg-slate-50"
              style={{ height: "400px" }}
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageSquare size={48} className="mb-3 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Start a conversation</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender ===
                    (userData?.data?.o?.name || userData?.data?.o?.email)
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      msg.sender ===
                      (userData?.data?.o?.name || userData?.data?.o?.email)
                        ? "bg-linear-to-r from-indigo-500 to-blue-500 text-white"
                        : "bg-white text-slate-800 border border-slate-200"
                    }`}
                  >
                    <div className="text-sm wrap-break-word">
                      {msg.sender.email === "AI" ? (
                        <div className="flex flex-col items-start gap-1">
                          <p className="font-semibold text-xs">AI</p>
                          <WriteAiMessage message={msg.message} />
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <p className="font-semibold text-xs">
                            {msg?.sender !==
                            (userData?.data?.o?.name ||
                              userData?.data?.o?.email)
                              ? msg.sender
                              : "You"}
                          </p>
                          <Markdown>{msg?.message}</Markdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-end gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSend()
                  }
                />
                <button
                  onClick={handleSend}
                  className="bg-linear-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Modal */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
            <div className="bg-linear-to-r from-purple-600 to-pink-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Add Collaborator
                    </h2>
                    <p className="text-sm text-purple-100">
                      Invite a team member
                    </p>
                  </div>
                </div>
                <button
                  onClick={closePartnerModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-150"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddPartner();
              }}
              className="p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>

              {partnerError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {partnerError}
                </div>
              )}

              {partnerSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {partnerSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePartnerModal}
                  disabled={isAddPartnerPending}
                  className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddPartnerPending}
                  className="flex-1 px-5 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-md hover:shadow-lg font-medium transition-all duration-200 disabled:opacity-50 text-sm"
                >
                  {isAddPartnerPending ? "Adding..." : "Add Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
