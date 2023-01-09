const { FileInProcessing, ApiRequire, ApiResponse } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["objectId"];
  const messageBody = event.body ? JSON.parse(event.body) : {};

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { objectId } = messageBody;

  const fileBeingProcessed = await FileInProcessing.findByUUID(objectId);

  if (!fileBeingProcessed) {
    return ApiResponse.makeFullErrorResponse("error", "Not found");
  } else if (
    fileBeingProcessed.type &&
    fileBeingProcessed.type != "edfSubmission"
  ) {
    return ApiResponse.makeFullErrorResponse("error", "Not found");
  } else {
    return ApiResponse.makeResponse(200, fileBeingProcessed.attributes);
  }
};
