// src/utils/socket.ts
import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const initializeSocket = (projectId: any) => {
  if (socketInstance) socketInstance.disconnect();

  socketInstance = io(process.env.NEXT_PUBLIC_API_URL as string, {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: { projectId },
  });

  return socketInstance;
};

export const receiveMessage = (eventName: any, cb: any) => {
  socketInstance?.on(eventName, cb);
};

export const sendMessage = (eventName: string, data: any) => {
  socketInstance?.emit(eventName, data);
};

export const disconnectSocket = () => {
  socketInstance?.disconnect();
  socketInstance = null;
};
