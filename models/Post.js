const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        max: 500,
    },
    img: {
        type: Array,
        default: [],
    },
    video: {
        type: Array,
        default: [],
    },
    likes: {
        type: Array,
        default: [],
    },
},
    { timestamps: true, }
);

module.exports = mongoose.model("Post", PostSchema);