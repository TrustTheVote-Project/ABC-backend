const AWS = require("aws-sdk");
let s3 = new AWS.S3({ signatureVersion: "v4" });

class DocumentInterface {
  static getSignedUrl(bucket, filename, expires = 120) {
    var params = { Bucket: bucket, Key: filename, Expires: expires };
    var url = s3.getSignedUrl("getObject", params);

    return url;
  }

  static getSignedUploadUrl(
    uploadBucket,
    filename,
    contentType = "application/json",
    expires = 60
  ) {
    const params = {
      Bucket: uploadBucket,
      Key: filename,
      ContentType: contentType,
      Expires: expires,
    };
    const uploadUrl = s3.getSignedUrl("putObject", params);
    return uploadUrl;
  }

  static async createFile(bucket, key, data) {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: data,
    };
    try {
      const response = await s3.upload(params).promise();
      return [true, response];
    } catch (err) {
      return [false, err];
    }
  }

  static async getFile(bucket, key) {
    const params = {
      Bucket: bucket,
      Key: key,
    };
    try {
      const response = await s3.getObject(params).promise();
      console.log("Response: ", response);
      return [true, response];
    } catch (err) {
      console.log(err);
      return [false, err];
    }
  }

  static fileExtensionForContentType(contentType) {
    var extension = "data";
    switch (contentType.toLowerCase()) {
      case "application/json":
        extension = "json";
        break;
      case "application/zip":
        extension = "zip";
        break;
      case "application/xml":
      case "text/xml":
        extension = "xml";
        break;
      //To do: add more as required
      default:
        extension = "unknown";
    }
    return extension;
  }
}

module.exports = DocumentInterface;
