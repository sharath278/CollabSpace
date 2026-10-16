
const express = require("express");
const router = express.Router();

const { createWorkspace ,getMyWorkspaces} = require("../controllers/workspaceController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware,createWorkspace);
router.get("/", authMiddleware, getMyWorkspaces);

module.exports = router;
