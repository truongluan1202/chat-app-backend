const Room = require("../model/roomModel");
const User = require("../model/userModel");

module.exports.setAvatar = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const avatarImage = req.body.image;
    const roomData = await Room.findByIdAndUpdate(roomId, {
      isAvatarImageSet: true,
      avatarImage,
    });
    return res.json({
      isSet: roomData.isAvatarImageSet,
      image: roomData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllRooms = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const rooms = await Room.find({ users: { $in: [userId] } }).select([
      "roomName",
      "avatarImage",
      "description",
      "users",
      "_id",
    ]);
    return res.json(rooms);
  } catch (ex) {
    next(ex);
  }
};

module.exports.createRoom = async (req, res, next) => {
  try {
    const { roomName, users, description } = req.body;
    const room = await Room.create({
      roomName,
      users,
      description,
    });
    return res.json(room);
  } catch (err) {
    next(err);
  }
};

module.exports.getMembers = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId).select(["users"]);

    if (!room) {
      // If the room is not found, send a 404 (Not Found) response
      return res.status(404).json({ error: "Room not found" });
    }

    const members = await User.find({ username: { $in: room.users } });

    const filteredMembers = members.map((member) => {
      return {
        username: member.username,
        avatarImage: member.avatarImage,
      };
    });
    res.json(filteredMembers);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.addMembers = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const newUsers = req.body.newUsers;
    const roomData = await Room.findById(roomId);

    if (!roomData) {
      return res.status(404).json({ error: "Room not found" });
    }

    roomData.users = [...roomData.users, ...newUsers];
    await roomData.save();

    res.json({ status: true, roomData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
