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
  jobSucceedAt: { type: Date }
});

VideoContentRecognitionSchema.methods.isContentExplicit = function () {
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
  if (this.labels && this.labels.length) {
    const moderationLabels = {};
    this.labels.forEach(label => {
      const { name, confidence, parentName } = label;
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
    Object.entries(moderationLabels).forEach(
      ([name,
        { count, totalConfidence, parentName }]) => {
        console.log(name);
        if (name in topLevelLabels) {
          topLevelLabels[name].count = count;
          topLevelLabels[name].totalConfidence = totalConfidence;
        } else if (parentName in topLevelLabels) {
          topLevelLabels[parentName].numChildren += 1;
        }
      });
  }
  const explicitLabelCount = topLevelLabels[topLevelCategories[0]].count
    + topLevelLabels[topLevelCategories[0]].numChildren;
  console.log("No. Explicit Labels: ", explicitLabelCount);
  return explicitLabelCount > 0;
}

const VideoContentRecognition = mongoose.model("VideoContentRecognition", VideoContentRecognitionSchema);

module.exports = VideoContentRecognition;
