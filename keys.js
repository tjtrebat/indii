exports.amazon = {
  s3Bucket: process.env.S3_BUCKET,
  accessKey: process.env.AWS_ACCESS_KEY_ID,
  accessSecret: process.env.AWS_SECRET_ACCESS_KEY,
  rekognitionRoleArn: process.env.AWS_REKOGNITION_ROLE,
  rekognitionTopicArn: process.env.AWS_REKOGNITION_TOPIC
};
