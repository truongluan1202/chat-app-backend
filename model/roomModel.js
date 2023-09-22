const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  users: {
    type: Array,
    validate: {
      validator: function (value) {
        return value.length >= 1;
      },
      message: "Users array must have a minimum length of 1.",
    },
  },
  description: {
    type: String,
  },
  isAvatarImageSet: {
    type: Boolean,
    default: false,
  },
  avatarImage: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Rooms", roomSchema);
