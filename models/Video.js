const mongoose = require("mongoose");

const { Schema } = mongoose;

const VideoSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  }
});

const Video = mongoose.model("Video", VideoSchema);

module.exports = Video;
