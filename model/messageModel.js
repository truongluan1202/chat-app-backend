const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    senderPhotoURL: {
      type: String,
      default: "",
    },
    senderName: {
      type: String,
      min: 3,
      max: 20,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", messageSchema);
