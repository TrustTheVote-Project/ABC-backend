const AWS = require("aws-sdk");
let s3 = new AWS.S3({ signatureVersion: "v4" });

const { Application } = require("./Application");

class DocumentInterface {
  static getSignedUrl(
    bucket,
    filename,
    expires = 120,
    contentDisposition = "inline;",
    contentType = "application/json"
  ) {
    var params = {
      Bucket: bucket,
      Key: filename,
      Expires: expires,
      ResponseContentDisposition: contentDisposition,
      ResponseContentType: contentType,
    };
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

  static async copyFile(
    sourceBucket,
    destinationBucket,
    sourceKey,
    destinationKey,
    contentDisposition = "inline"
  ) {
    const params = {
      Bucket: destinationBucket,
      CopySource: sourceBucket + "/" + sourceKey,
      Key: destinationKey,
    };

    console.log("Copy params: ", params);

    try {
      const response = await s3.copyObject(params).promise();
      console.log("Response: ", response);
      return [true, response];
    } catch (err) {
      console.log(err);
      return [false, err];
    }
  }

  static async documentFileProvisioned(uploadKey) {
    const uploadState = {
      files: {},
      fileCount: 0,
      status: "provisioned",
    };
    await Application.set(uploadKey + "_uploadState", uploadState);
  }

  static async documentFileUnzippingStart(uploadKey) {
    const uploadState = {
      files: {},
      fileCount: 0,
      status: "uploaded",
    };
    await Application.set(uploadKey + "_uploadState", uploadState);
  }
  static async documentFileUnzipping(uploadKey, filename, newKey) {
    const currentState = await Application.get(uploadKey + "_uploadState");
    const uploadState = currentState || {};
    const currentCount = uploadState.fileCount || 0;
    uploadState["fileCount"] = currentCount + 1;
    uploadState["files"] = uploadState["files"] ? uploadState["files"] : {};
    uploadState["files"][filename] = newKey;
    uploadState["status"] = "processing";
    await Application.set(uploadKey + "_uploadState", uploadState);
  }
  static async documentFileUnzippingComplete(uploadKey) {
    const uploadState = await Application.get(uploadKey + "_uploadState");
    uploadState["status"] = "ready";
    await Application.set(uploadKey + "_uploadState", uploadState);
  }
  static async getDocumentState(uploadKey) {
    return await Application.get(uploadKey + "_uploadState");
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
