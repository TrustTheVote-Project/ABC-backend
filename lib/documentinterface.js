const AWS = require("aws-sdk");
let s3 = new AWS.S3();

class DocumentInterface {
  static getSignedUrl(bucket, filename, expires = 60) {
    var params = { Bucket: bucket, Key: filename, Expires: expires };
    var url = s3.getSignedUrl("getObject", params);

    return url;
  }
}

module.exports = DocumentInterface;
