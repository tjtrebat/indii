const mongoose = require("mongoose");

const { Schema } = mongoose;

const CommentSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
