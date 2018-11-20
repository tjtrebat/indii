const mongoose = require("mongoose");

const { Schema } = mongoose;

const VideoContentRecognitionLabelSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  timestamp: { type: Number },
  parentName: { type: String }
});

const VideoContentRecognitionLabel = mongoose.model("VideoContentRecognitionLabel", VideoContentRecognitionLabelSchema);

module.exports = VideoContentRecognitionLabel;
