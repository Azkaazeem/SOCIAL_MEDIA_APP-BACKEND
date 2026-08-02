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
router.delete("/:id" , async (req, res) => {
    try {
    const post = await Post.findById(req.params.id);
    if(post.userId === req.body.userId) {
        await post.deleteOne({$set: req.body});
        res.status(200).json("The post has been deleted");
    } else {
        res.status(403).json("You can delete only your post!");
    }
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// LIKE / UNLIKE POST
router.put("/:id/like" , async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({$push: { likes: req.body.userId}})
            res.status(200).json("The post has been liked");
        } else {
            await post.updateOne({$pull: {likes: req.body.userId}});
            res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

// GET A POST
router.get("/:id" , async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
})

// GET TIMELINE POSTS
router.get("/timeline/all" , async (req , res) => {
    try {
        const currentUser = await User.findById(req.body.userId);
        const userPost = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        );
        res.json(userPost.concat(...friendsPosts));
    } catch (err) {
        res.status(500).json({error: err.message});
    }
})

module.exports = router;