const {
  createRoom,
  setAvatar,
  getAllRooms,
  getMembers,
  addMembers,
} = require("../controllers/roomController");

const router = require("express").Router();

router.post("/createRoom/", createRoom);
router.post("/setAvatar/:id", setAvatar);
router.get("/allrooms/:id", getAllRooms);
router.get("/getmembers/:id", getMembers);
router.put("/addmembers/:id", addMembers);

module.exports = router;
