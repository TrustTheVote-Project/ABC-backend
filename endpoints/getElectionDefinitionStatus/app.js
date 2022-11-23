const { FileInProcessing, ApiRequire, ApiResponse } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["uuid"];
  const messageBody = event.body ? JSON.parse(event.body) : {};

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { uuid } = messageBody;

  const fileBeingProcessed = await FileInProcessing.findByUUID(uuid);

  if (!fileBeingProcessed) {
    return ApiResponse.makeFullErrorResponse("error", "Not found");
  } else if (
    fileBeingProcessed.type &&
    fileBeingProcessed.type != "edfSubmission" &&
    false
  ) {
    return ApiResponse.makeFullErrorResponse("error", "Not found");
  } else {
    return ApiResponse.makeResponse(200, fileBeingProcessed.attributes);
  }
};
