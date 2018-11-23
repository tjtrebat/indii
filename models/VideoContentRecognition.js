const mongoose = require("mongoose");

const { Schema } = mongoose;

const VideoContentRecognitionSchema = new Schema({
  jobId: {
    type: String,
    required: true
  },
  clientRequestToken: {
    type: String,
    required: true
  },
  jobTag: {
    type: String,
    required: true
  },
  minConfidence: {
    type: Number,
    default: 50
  },
  labels: [{
    type: Schema.Types.ObjectId,
    ref: "VideoContentRecognitionLabel"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  receivedLabelsAt: { type: Date }
});

VideoContentRecognitionSchema.methods.hasExplicitLabels = function () {
  const topLevelLabels = {};
  const topLevelCategories = [
    "Explicit Nudity",
    "Suggestive"
  ];
  topLevelCategories.forEach(category => {
    topLevelLabels[category] = {
      count: 0,
      totalConfidence: 0,
      numChildren: 0
    }
  });
  if (this.labels) {
    const moderationLabels = {};
    this.labels.forEach(label => {
      const { name, confidence, parentName } = label;
      if (name in topLevelLabels) {
        topLevelLabels[name].count += 1;
        topLevelLabels[name].totalConfidence += confidence;
      } else if (parentName in topLevelLabels) {
        topLevelLabels[parentName].numChildren += 1;
      }
      if (name in moderationLabels) {
        moderationLabels[name].count += 1;
        moderationLabels[name].totalConfidence += confidence
      } else {
        moderationLabels[name] = {
          count: 1,
          totalConfidence: confidence,
          parentName
        }
      }
    });
  }
  let totalLabels = 0;
  topLevelCategories.forEach(category => {
    const labelCount = topLevelLabels[category].count + topLevelLabels[category].numChildren;
    console.log(`No. of labels with the term '${category}': ${labelCount}.`);
    totalLabels += labelCount;
  });
  return totalLabels > 0;
}

const VideoContentRecognition = mongoose.model("VideoContentRecognition", VideoContentRecognitionSchema);

module.exports = VideoContentRecognition;
