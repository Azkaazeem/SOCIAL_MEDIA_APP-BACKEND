const router = require("express").Router();
const Post = require("../models/Post");

// CREATE POST
router.post("/" , async (req, res) => {
    const newPost = await new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

// UPDATE POST
router.put("/:id" , async (req, res) => {
    try {
    const post = await Post.findById(req.params.id);
    if(post.userId === req.body.userId) {
        await post.updateOne({$set: req.body});
        res.status(200).json("The post has been updated");
    } else {
        res.status(403).json("You can update only your post!");
    }
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// DELETE POST

// LIKE POST

// GET A POST

// GET TIMELINE POSTS

module.exports = router;