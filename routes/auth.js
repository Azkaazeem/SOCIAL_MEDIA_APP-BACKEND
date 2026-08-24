const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// REGISTER ROUTER
router.post("/register", async (req, res) => {


    try {

        // GENERATE NEW PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // CREATE NEW USER
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            dob: req.body.dob || "",
            profilePicture: req.body.profilePicture || "",
        });

        // SAVE USER AND  RESPOND
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LOGIN ROUTER

router.post("/login" , async (req , res) => {
    try {
        const user = await User.findOne({email:req.body.email});

        if (!user) {
            return res.status(400).json("Wrong credentials!");
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if (!validPassword) {
            return res.status(400).json("Wrong password!");
        }

        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json(err);
    }
})


module.exports = router;