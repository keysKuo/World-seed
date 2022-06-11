const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const Blogs = new Schema(
    {
        author: {
            username: String,
            avatar: String,
            personal_concept: String,
            main_color: String,
            user_bio: String,
            authorSlug: String,
        },
        title: { type: String, sparse: true },
        type: { type: String },
        content: { type: String, sparse: true },
        image: { type: String, require: true },
        description: { type: String, require: true },
        likers: [String],
        slug: { type: String, slug: 'title', sparse: true }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Blogs', Blogs);