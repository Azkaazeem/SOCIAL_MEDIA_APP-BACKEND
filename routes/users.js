const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// UPDATE USER
router.put("/:id", async (req, res) => {
    if (req.body.userId == req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
                console.log(err)
            }
        }

        try {
            const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body })
            res.status(200).json("Account has been updated")
        } catch (err) {
            return res.status(500).json(err);
            console.log(err)
        }
    } else {
        return res.status(403).json("You can update only your account!")
    }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
    if (req.body.userId == req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
                console.log(err)
            }
        }

        try {
            const user = await User.findByIdAndDelete({ _id: req.params.id });
            if (!user) {
                return res.status(404).json("User not found");
            }

            res.status(200).json("Account has been deleted");
        } catch (err) {
            return res.status(500).json(err);
            console.log(err)
        }
    } else {
        return res.status(403).json("You can delete only your account!")
    }
});

// GET A USER
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId ? await User.findById(userId) : await User.findOne({ username: username });
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }

});

// GET ALL USERS
router.get("/all", async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, profilePicture: 1, _id: 1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET USER
router.get("/friends/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map(friendId => {
                return User.findById(friendId);
            })
        );
        let friendList = [];
        friends.map((friend) => {
            const {_id, username, profilePicture, dob } = friend;
            friendList.push({ _id, username, profilePicture, dob });
        })
        res.status(200).json(friendList)
    } catch (err) {
        res.status(500).json(err);
    }
});

// FOLLOW A USER
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("User has been followed");
            } else {
                res.status(403).json("You already follow this user");
            }
        } catch (err) {
            console.error("FOLLOW ERROR:", err);
            return res.status(500).json({ message: err.message });
        }
    } else {
        res.status(403).json("You can't follow yourself");
    }
});

// UNFOLLOW A USER
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("User has been unfollowed");
            } else {
                res.status(403).json("You don't follow this user");
            }
        } catch (err) {
            console.error("FOLLOW ERROR:", err);
            return res.status(500).json({ message: err.message });
        }
    } else {
        res.status(403).json("You can't unfollow yourself");
    }
});

module.exports = router;