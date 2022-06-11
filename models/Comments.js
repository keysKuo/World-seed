const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comments = new Schema(
    {
        post_id: { type: String, require: true },
        user: {
            id: String,
            name: String,
            avatar: String,
        },
        content: { type: String, require: true },
        // likes: Number,

    },
    {
        timestamps: true,
    }

)

module.exports = mongoose.model('Comments', Comments);