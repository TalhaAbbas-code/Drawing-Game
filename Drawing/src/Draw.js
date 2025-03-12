import React, { useRef, useState, useEffect } from "react";
import { useSocket } from "./SocketContext";
import logo from "./pic.png";
import logo1 from "./logo.gif";
import background from "./background.png";
const DrawingApp = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isPainting, setIsPainting] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [users, setUsers] = useState([]);
  const [currentDrawerIndex, setCurrentDrawerIndex] = useState(0);

  const { socket, user, word, setUser } = useSocket();
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    socket.emit("new-user-add", user.username);
    socket.emit("send-message-to-group", {
      groupName: user.groupName,
      message: `${user.username} joined the group`,

      sender: "",
    });
    socket.on("get-users", (users) => {
      setUsers(users);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    socket.emit("join-group", {
      groupName: user.groupName,
      username: user.username,
    });

    socket.on("receive-group-message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("receive-group-message");
    };
  }, [user]);
  /////send drawing to others//////
  useEffect(() => {
    if (!socket) return;

    socket.on("drawing", ({ offsetX, offsetY, strokeColor, lineWidth }) => {
      const ctx = ctxRef.current;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    });

    socket.on("clearCanvas", () => {
      // alert("clear canvas socket is called");
      clearCanvas();
    });

    return () => {
      socket.off("drawing");
      socket.off("clearCanvas");
    };
  }, []);

  ///////handle rounds/////

  const sendMessageToGroup = () => {
    console.log(user);
    socket.emit("send-message-to-group", {
      groupName: user.groupName,
      message,
      sender: user.username,
    });
    setMessage("");
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctxRef.current = ctx;
  }, []);

  const startPainting = (e) => {
    const currentUser = users.find((u) => u.userId === user.username);
    if (!currentUser?.isDrawing) return;
    setIsPainting(true);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const stopPainting = () => {
    setIsPainting(false);
    ctxRef.current.beginPath();
  };

  const draw = (e) => {
    const currentUser = users.find((u) => u.userId === user.username);
    if (!isPainting) return;
    if (!currentUser?.isDrawing) return;

    const { offsetX, offsetY } = e.nativeEvent;

    ctxRef.current.strokeStyle = strokeColor;
    ctxRef.current.lineWidth = lineWidth;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();

    // Emit the drawing event with necessary data
    socket.emit("drawing", {
      offsetX,
      offsetY,
      strokeColor,
      lineWidth,
    });
  };

  const clearCanvas = () => {
    console.log("cleared canvas");
    debugger;
    if (!ctxRef.current) {
      ctxRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      socket.emit("clearCanvas");
    }
  };

  return (
    <div
      className="flex flex-col   "
      style={{ backgroundImage: `url(${background})` }}
    >
      <img className="pl-10" src={logo1} alt="" width={350} />
      <div className="flex flex-row-reverse gap-2 p-10 items-start ">
        <div className=" w-[30%] flex flex-col   justify-between bg-white rounded-sm border-black">
          <h2 className="text-center text-2xl font-bold">Group Messages</h2>
          <div className=" flex flex-col   h-96 ">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`  ${index % 2 !== 0 ? "bg-white" : "bg-gray-200"} ${
                  word === msg.message ? "text-green-500" : "text-black"
                }
                 ${msg.sender === "" ? "text-green-500" : "text-black"}`}
              >
                <span className="mb-2 text-md font-bold">
                  {msg.sender && `${msg.sender}:`}
                </span>
                <span className="text-md ">
                  {` ${word === msg.message ? "Guess the word" : msg.message}`}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <input
              onChange={handleChange}
              type="text"
              placeholder="Enter Your Message"
              className="border p-1 m-1"
              value={message}
            />
            <button
              onClick={sendMessageToGroup}
              className="cursor-pointer p-2 border rounded-md bg-green-400"
            >
              Send Message
            </button>
          </div>
        </div>
        <div className={`flex flex-col-reverse  `}>
          <div className={"w-[50%] p-4 flex flex-col bg-gray-800"}>
            <h1 className="text-3xl text-white font-bold">Draw.</h1>
            <label className="text-sm text-white">Stroke</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
            />

            <button
              className="bg-blue-600 px-3 py-1 rounded text-white"
              onClick={clearCanvas}
            >
              Clear
            </button>
          </div>
          <div className=" border bg-gray-400 ">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseDown={startPainting}
              onMouseUp={stopPainting}
              onMouseMove={draw}
            />
          </div>
        </div>
        <div className="w-[20%] flex flex-col flex-grow border border-black text-black bg-white rounded-sm min-h-[50px]">
          {users.length === 0 && <p className="p-2">No users yet.</p>}
          {users.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between p-2 w-full items-center 
        ${
          index % 2 !== 0
            ? item.isDrawing
              ? "bg-green-400"
              : "bg-white"
            : item.isDrawing
            ? "bg-green-400"
            : "bg-gray-400"
        } 
        
        text-black font-bold`}
            >
              <p>{index}</p>
              <div className="flex flex-col">
                <p className="text-black text-lg font-bold">{item.userId}</p>
                <p className="text-black text-xs">{"0 Points"}</p>
              </div>
              <div>
                <img src={logo} alt="" width={50} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DrawingApp;
