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

// FOLLOW A USER

// UNFOLLOW A USER

module.exports = router;