"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { useParams } from "next/navigation";
import {
  useAddPartner,
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
  console.log("PPPID:", id);

  const { data } = useShowMyProject(id);
  const { mutate: mutateUpdateFileTree, isPending } = useUpdateFileTree();
  const { mutate: mutateAddPartner, isPending: isAddPartnerPending } =
    useAddPartner();

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
      const messageObject = JSON.parse(message);
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
        console.log("Message received raw:", data);
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
      sender: "user",
    };
    sendMessage("project-message", newMessage);
    appendOutgoingMessages(newMessage);
    setMessage("");
    scrollToBottom();
  };

  console.log(messages);
  return (
    <div className="p-4 space-y-4">
      {/* top controls */}
      <div className="flex gap-2">
        <input
          placeholder="filename"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          className="px-2 py-1 border rounded"
        />
        <button
          onClick={addFileToTree}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          add
        </button>

        <div className="ml-auto">
          <button
            onClick={openPartnerModal}
            className="px-3 py-1 bg-indigo-600 text-white rounded"
            aria-haspopup="dialog"
          >
            Add Partner
          </button>
        </div>
      </div>
      <button
        onClick={() => setIsChatOpen((p) => !p)}
        className="px-3 py-1 bg-indigo-500 text-white rounded"
      >
        {isChatOpen ? "Close Chat" : "Open Chat"}
      </button>
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 bg-white border rounded-lg shadow-lg flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold">Project Chat</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          <div
            ref={messageBoxRef}
            className="flex-1 overflow-y-auto p-3 space-y-2"
            style={{ maxHeight: "300px" }}
          >
            {messages.length === 0 && (
              <div className="text-sm text-gray-400 text-center">
                No messages yet
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-indigo-100 self-end"
                    : "bg-gray-100"
                }`}
              >
                <div className="text-sm">
                  {msg.sender.email === "AI" ? (
                    <WriteAiMessage message={msg.message} />
                  ) : (
                    <Markdown>{msg.message}</Markdown>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 border-t flex items-center gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
              className="flex-1 border rounded px-2 py-1 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-indigo-500 text-white p-2 rounded"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* files / open files / editor (unchanged) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Files</h3>
          <div className="flex flex-col gap-2">
            {Object.keys(fileTree || {}).length === 0 && (
              <div className="text-sm text-gray-500">No files.</div>
            )}
            {Object.keys(fileTree || {}).map((file) => (
              <div key={file} className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles((prev) => new Set([...prev, file]));
                  }}
                  className="text-blue-500 hover:underline"
                >
                  {file}
                </button>
                <button
                  onClick={() => deleteFileFromTree(file)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 border-2">Open Files</h3>
          <div className="flex flex-col gap-2">
            {Array.from(openFiles).map((file) => (
              <div key={file} className="flex items-center justify-between">
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
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Select or create a file to edit"
          className="w-full h-48 border px-4 py-2 rounded-md outline-none shadow-lg"
        />
        <div className="mt-2 flex gap-2">
          <button
            disabled={!currentFile || isPending}
            onClick={saveCurrentFile}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-60"
          >
            Save
          </button>
          <button
            disabled={!currentFile}
            onClick={() => {
              const contents = fileTree[currentFile!]?.file?.contents;
              setContent(typeof contents === "string" ? contents : "");
            }}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Revert
          </button>
        </div>
      </div>

      {/* Partner Modal */}
      {isPartnerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="fixed inset-0 bg-black/40"
            onClick={closePartnerModal}
            aria-hidden
          />
          <div className="relative z-50 w-full max-w-md mx-4 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Collaborator</h2>
              <button
                onClick={closePartnerModal}
                aria-label="Close"
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddPartner();
              }}
              className="space-y-3"
            >
              <label className="block text-sm font-medium">
                Collaborator Email
              </label>
              <input
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />

              {partnerError && (
                <div className="text-sm text-red-600">{partnerError}</div>
              )}
              {partnerSuccess && (
                <div className="text-sm text-green-600">{partnerSuccess}</div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closePartnerModal}
                  className="px-4 py-2 rounded border"
                  disabled={isAddPartnerPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddPartnerPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  {isAddPartnerPending ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
