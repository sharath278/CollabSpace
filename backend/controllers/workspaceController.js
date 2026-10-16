
const Workspace = require("../models/workspace");

const createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Workspace name is required"
            });
        }

        const workspace = await Workspace.create({
            name,
            description,
            owner: req.user.id,
            members: [
                {
                    user: req.user.id,
                    role: "owner"
                }
            ]
        });

        res.status(201).json({
            message: "Workspace created successfully",
            workspace
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



const getMyWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            "members.user": req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            count: workspaces.length,
            workspaces
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = { createWorkspace,getMyWorkspaces };
