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

// initialize a global variable called "onlineUsers"
global.onlineUsers = new Map();

//event handler which occur when a client connects to the server
io.on("connection", (socket) => {
  // store the connected socket in a global var called "chatSocket"
  /* Note that if multiple clients connect simultaneously, the chatSocket
   will be set to the last connected socket, which might not be what you intend.
   */
  global.chatSocket = socket;

  /* listen for an "add-user" event. When a client emits this event with a userId, 
  you add an entry to the onlineUsers map, associating the userId with the socket 
  ID of the connected client.
  */
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  /* listen for a "send-msg" event. When a client emits this event with a data object 
  containing a recipient to and a message msg, you look up the recipient's socket ID in the 
  onlineUsers map. If you find a socket ID, you use socket.to(sendUserSocket).emit(...) to send 
  the message to the recipient.
   */
  socket.on("send-msg", (data) => {
    console.log("receive send-msg");

    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      console.log("emit msg-receive");
      socket.to(sendUserSocket).emit("msg-receive", data.message);
    }
  });

  socket.on("send-msg-to-group", async (data) => {
    console.log("receive send-msg-to-group");

    const room = await Room.findById(data.roomId).select(["users"]);
    const sendUsers = await User.find({ username: { $in: room.users } }).select(
      ["_id"]
    );

    for (const user of sendUsers) {
      const userId = user._id.toHexString();
      const sendUserSocket = onlineUsers.get(userId);

      if (sendUserSocket) {
        console.log("emit msg-receive");
        io.to(sendUserSocket).emit("msg-receive", data.newMsg);
      }
    }
  });
});

/* 
    sample data : 
    data: {
        to: '650408f3db4515f2978641be',
        from: '6503e0aa1b9231f46bdac1d7',
        message: 'fas'
    }
  */
