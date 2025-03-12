import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [user, setUser] = useState({ username: "Talha", groupName: "group1" });
  const [word, setWord] = useState("apple");
  const socketRef = useRef(null);

  

  return (
    <SocketContext.Provider value={{ socket: socketRef.current || io("http://localhost:8800"), user, setUser,word }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
