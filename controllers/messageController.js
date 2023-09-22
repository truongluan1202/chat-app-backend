const Messages = require("../model/messageModel");

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, senderName, senderPhotoURL } = req.body;

    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
      senderName: senderName,
      senderPhotoURL: senderPhotoURL,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 }); // sort by updateAt in ascending order

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllMessagesRoom = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [to],
      },
    }).sort({ updatedAt: 1 }); // sort by updateAt in ascending order

    const projectedMessages = messages.map((msg) => {
      return {
        _id: msg.sender,
        message: msg.message.text,
        createdAt: msg.updatedAt,
        photoURL: msg.senderPhotoURL,
        displayName: msg.senderName,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};
