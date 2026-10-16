
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createTask,
    getWorkspaceTasks,
    updateTask,
    deleteTask,
    getMyTasks
} = require("../controllers/taskController");

router.post("/", authMiddleware, createTask);

router.get("/my-tasks", authMiddleware, getMyTasks);

router.get("/workspace/:workspaceId", authMiddleware, getWorkspaceTasks);

router.put("/:taskId", authMiddleware, updateTask);

router.delete("/:taskId", authMiddleware, deleteTask);

module.exports = router;
