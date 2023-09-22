const {
  addMessage,
  getAllMessages,
  getAllMessagesRoom,
} = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getAllMessages);
router.post("/getmsgroom/", getAllMessagesRoom);

module.exports = router;
