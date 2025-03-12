import React, { useState,useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useSocket } from "./SocketContext";
import logo from "./logo.gif";
import background from "./background.png";

function Login() {
    const navigate = useNavigate();
    const { socket, setUser,user } = useSocket();
    const [username, setUsername] = useState("");
    const [groupName, setGroupName] = useState('group1');

    const navigatePlay = () => {
      debugger  
      setUser({ username: username, groupName: "group1" });
       // sendMessageToGroup();
        navigate("/draw");
    };
//    useEffect(() => {
//     alert('username is changed')
//         setUser({ username: username, groupName: "group1" }); 
//     }, [username, setUser, user]); 
    
        
     

   /* const sendMessageToGroup = () => {
        socket.emit("send-message-to-group", {
            groupName,
            message: "sending first message",
            sender: user.username,
        });
    };*/

    return (
        <div
            className="h-screen flex flex-col items-center pt-5 rounded-md text-white bg-repeat bg-center"
            style={{ backgroundImage: `url(${background})` }}
        >
            <img src={logo} alt="" width={550} />
            <div className='flex flex-col w-[30%] gap-10 p-10 mt-[5%] bg-blue-700'>
                <img src={logo} alt="" />
                <input
                    type="text"
                    placeholder="Enter Your Name"
                    className="p-2 text-black rounded-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button onClick={navigatePlay} className="bg-green-400 text-2xl p-3 rounded-md">
                    Play
                </button>
                <button className="bg-blue-600 text-2xl p-2 rounded-md">
                    Create Private Room
                </button>
            </div>
        </div>
    );
}

export default Login;
