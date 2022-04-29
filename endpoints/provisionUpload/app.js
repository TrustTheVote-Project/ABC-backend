"use strict";

const { DocumentInterface, ApiResponse, ApiRequire } = require("/opt/Common");

// Main Lambda entry point
exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["contentType"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { contentType } = messageBody;

  const fileId = context.awsRequestId;
  const fileName = `${fileId}.${DocumentInterface.fileExtensionForContentType(
    contentType
  )}`;

  const uploadUrl = DocumentInterface.getSignedUploadUrl(fileName, contentType);

  return ApiResponse.makeResponse(200, {
    uploadUrl: uploadUrl,
    fileName: fileName,
  });
};
