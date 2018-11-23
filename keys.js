exports.amazon = {
  accessKey: process.env.AWS_ACCESS_KEY_ID,
  accessSecret: process.env.AWS_SECRET_ACCESS_KEY,
  s3Bucket: process.env.S3_BUCKET,
  rekognitionTopicArn: process.env.AWS_REKOGNITION_TOPIC,
  rekognitionRoleArn: process.env.AWS_REKOGNITION_ROLE
};
