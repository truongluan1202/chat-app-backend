const {
  register,
  login,
  setAvatar,
  getAllUsers,
  getAllUsersRoom,
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.post("/setAvatar/:id", setAvatar);
router.get("/allusers/:id", getAllUsers);
router.post("/allusersroom/", getAllUsersRoom);

module.exports = router;
