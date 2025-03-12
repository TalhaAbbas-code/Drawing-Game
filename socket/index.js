const io = require("socket.io")(8800, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let activeUsers = [];
let groups = {};
let currentDrawerIndex = 0;

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
    const disconnectedUser = activeUsers.find(
      (user) => user.socketId === socket.id
    );
    if (disconnectedUser) {
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      console.log(`User Disconnected: ${disconnectedUser.userId}`);

      for (const groupName in groups) {
        const groupUsers = groups[groupName];

        if (groupUsers.some((user) => user.socketId === socket.id)) {
          groups[groupName] = groupUsers.filter(
            (user) => user.socketId !== socket.id
          );
          io.to(groupName).emit("receive-group-message", {
            groupName,
            message: `${disconnectedUser.userId} has left the group.`,
            sender: "",
          });

          console.log(
            `Notified group ${groupName} about ${disconnectedUser.userId} leaving.`
          );
        }
      }
    }

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
      console.log(`Sending message to group ${groupName}:`, message, socket.id);
      io.to(groupName).emit("receive-group-message", {
        groupName,
        message,
        sender,
      });
    } else {
      console.log("Group not found:", sender, groupName);
    }
  });

  socket.on("drawing", (data) => {
    socket.broadcast.emit("drawing", data);
  });

  socket.on("clearCanvas", () => {
    
    socket.broadcast.emit("clearCanvas");
  });

  socket.on("rotate-drawer", () => {
    rotateDrawer();
  });
});

const rotateDrawer = () => {
  if (activeUsers.length > 0) {
    activeUsers.forEach((user) => (user.isDrawing = false));
    activeUsers[currentDrawerIndex].isDrawing = true;
    io.emit("get-users", activeUsers);
    console.log(`Current drawer: ${activeUsers[currentDrawerIndex].userId}`);
    currentDrawerIndex = (currentDrawerIndex + 1) % activeUsers.length;
  }
};

setInterval(() => {
  rotateDrawer();
}, 30000);
