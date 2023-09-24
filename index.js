const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const roomRoutes = require("./routes/roomRoutes");
const app = express();
const socket = require("socket.io");
const Room = require("./model/roomModel");
const User = require("./model/userModel");

require("dotenv").config();

app.use(cors()); // ???
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/auth/room", roomRoutes);
app.use("/api/messages", messageRoutes);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is listening to Port ${process.env.PORT}`);
});

// set up WebSocket communication for real-time events
const io = socket(server, {
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
});

// initialize a global variable
global.onlineUsers = new Map();
const activeRooms = {};

//event handler which occur when a client connects to the server
io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    console.log("receive send-msg");

    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      console.log("emit msg-receive");
      socket.to(sendUserSocket).emit("msg-receive", data.message);
    }
  });

  /* ************* */
  socket.on("set-username", (username) => {
    socket.username = username;
    console.log("set username ", username);
  });

  socket.on("join-room", (roomId) => {
    console.log("user join room ", roomId);
    socket.join(roomId);
    if (!activeRooms[roomId]) {
      activeRooms[roomId] = {
        members: {},
      };
    }

    activeRooms[roomId].members[socket.id] = socket.username;

    io.to(roomId).emit("user-joined", socket.username);
  });

  // socket.on("add-member", async (roomId) => {
  //   const room = await Room.findById(roomId).select(["users"]);
  //   const sendUsers = await User.find({ username: { $in: room.users } }).select(
  //     ["_id", "username"]
  //   );

  //   for (const user of sendUsers) {
  //     const userId = user._id.toHexString();
  //     const sendUserSocket = onlineUsers.get(userId);

  //     console.log(onlineUsers);
  //     if (sendUserSocket) {
  //       console.log("announce add member ", user.username);
  //       io.to(sendUserSocket).emit("new-member");
  //     }
  //   }
  // });

  socket.on("send-message", ({ roomId, newMsg }) => {
    console.log("Message received");

    // Check if the room exists and the user is a participant
    if (activeRooms[roomId] && activeRooms[roomId].members[socket.id]) {
      // Broadcast the message to all users in the room
      io.to(roomId).emit("message", newMsg);
    } else {
      console.log("User not authorized to send messages in the room");
    }
  });

  socket.on("leave-room", (roomId) => {
    console.log("user left room", roomId);
    if (activeRooms[roomId]) {
      // Mark the user as inactive in the room and remove them from the room
      delete activeRooms[roomId].members[socket.id];
      socket.leave(roomId);
      console.log(activeRooms[roomId].members[socket.id]);
      // Notify room participants about the user who left
      io.to(roomId).emit("user-left", socket.username);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");

    // Leave all rooms and notify participants about the user who left
    for (const roomId in activeRooms) {
      if (activeRooms[roomId].members[socket.id]) {
        delete activeRooms[roomId].members[socket.id];
        io.to(roomId).emit("user-left", socket.username);
      }
    }
  });

  /* ******************** */

  // socket.on("send-msg-to-group", async (data) => {
  //   console.log("receive send-msg-to-group");

  //   const room = await Room.findById(data.roomId).select(["users"]);
  //   const sendUsers = await User.find({ username: { $in: room.users } }).select(
  //     ["_id"]
  //   );

  //   for (const user of sendUsers) {
  //     const userId = user._id.toHexString();
  //     const sendUserSocket = onlineUsers.get(userId);

  //     if (sendUserSocket) {
  //       console.log("emit msg-receive");
  //       io.to(sendUserSocket).emit("msg-receive", data.newMsg);
  //     }
  //   }
  // });
});

/* 
    sample data : 
    data: {
        to: '650408f3db4515f2978641be',
        from: '6503e0aa1b9231f46bdac1d7',
        message: 'fas'
    }
  */
