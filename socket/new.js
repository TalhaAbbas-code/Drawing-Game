const io = require("socket.io")(8800, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let activeUsers = [];
let currentDrawerIndex = 0;
let selectedWord = null;
let isSelectingWord = false;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("new-user-add", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
        isDrawing: false,
      });
      console.log("New User Connected", activeUsers);
    }
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log(`User Disconnected: ${socket.id}`);
    io.emit("get-users", activeUsers);
  });

   socket.on("join-group", ({ groupName, username }) => {
     if (!groups[groupName]) {
       groups[groupName] = [];
     }

     if (!groups[groupName].some((user) => user.socketId === socket.id)) {
       groups[groupName].push({ userId: username, socketId: socket.id });
     }

     socket.join(groupName);
     console.log(`${username} joined group: ${groupName}`);
   });

    socket.on("send-message-to-group", ({ groupName, message, sender }) => {
      if (groups[groupName]) {
        console.log(
          `Sending message to group ${groupName}:`,
          message,
          socket.id
        );
        io.to(groupName).emit("receive-group-message", {
          groupName,
          message,
          sender,
        });
      } else {
        console.log("Group not found:", sender, groupName);
      }
    });


  socket.on("word-selected", (word) => {
    selectedWord = word;
    isSelectingWord = false;
    io.emit("word-confirmed", {
      word: selectedWord,
      drawer: activeUsers[currentDrawerIndex].userId,
    });

    setTimeout(() => {
      rotateDrawer();
    }, 30000);
  });

  

  socket.on("rotate-drawer", () => {
    rotateDrawer();
  });
});

const rotateDrawer = () => {
  if (activeUsers.length === 0) return;

  activeUsers.forEach((user) => (user.isDrawing = false));
  currentDrawerIndex = (currentDrawerIndex + 1) % activeUsers.length;
  isSelectingWord = true;

  io.emit("next-drawer", {
    drawer: activeUsers[currentDrawerIndex].userId,
    isSelectingWord: true,
  });
};
