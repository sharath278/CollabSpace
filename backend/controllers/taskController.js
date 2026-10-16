const Task = require("../models/task");
const Workspace = require("../models/workspace");



const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            workspaceId,
            assignedTo,
            deadline,
            priority
        } = req.body;

        if (!title || !title.trim() || !workspaceId) {
            return res.status(400).json({
                message: "Title and workspace ID are required"
            });
        }

        const workspace = await Workspace.findOne({
            _id: workspaceId,
            "members.user": req.user.id
        });

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found or access denied"
            });
        }

        if (assignedTo) {
            const isMember = workspace.members.some(
                (member) => member.user.toString() === assignedTo
            );

            if (!isMember) {
                return res.status(400).json({
                    message: "Assignee must be a workspace member"
                });
            }
        }

        const task = await Task.create({
            title,
            description,
            workspace: workspaceId,
            assignedTo: assignedTo || null,
            createdBy: req.user.id,
            deadline: deadline || null,
            priority: priority || "medium"
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getWorkspaceTasks = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findOne({
            _id: workspaceId,
            "members.user": req.user.id
        });

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found or access denied"
            });
        }

        const tasks = await Task.find({
            workspace: workspaceId
        })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, status, priority, deadline, assignedTo } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const workspace = await Workspace.findOne({
            _id: task.workspace,
            "members.user": req.user.id
        });

        if (!workspace) {
            return res.status(403).json({
                message: "You cannot access this task"
            });
        }

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (deadline !== undefined) task.deadline = deadline || null;

        if (assignedTo !== undefined) {
            if (assignedTo) {
                const isMember = workspace.members.some(
                    (member) => member.user.toString() === assignedTo
                );

                if (!isMember) {
                    return res.status(400).json({
                        message: "Assignee must be a workspace member"
                    });
                }
            }

            task.assignedTo = assignedTo || null;
        }

        await task.save();

        res.status(200).json({
            message: "Task updated successfully",
            task
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const workspace = await Workspace.findOne({
            _id: task.workspace,
            "members.user": req.user.id
        });

        if (!workspace) {
            return res.status(403).json({
                message: "You cannot delete this task"
            });
        }

        await task.deleteOne();

        res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getMyTasks = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            "members.user": req.user.id
        }).select("_id");

        const workspaceIds = workspaces.map(
            (workspace) => workspace._id
        );

        const tasks = await Task.find({
            assignedTo: req.user.id,
            workspace: { $in: workspaceIds }
        })
            .populate("workspace", "name")
            .populate("createdBy", "name email")
            .sort({ deadline: 1 });

        res.status(200).json({
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};







module.exports = { createTask ,getWorkspaceTasks,updateTask,deleteTask,getMyTasks};