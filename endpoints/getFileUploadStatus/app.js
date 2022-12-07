const { ApiResponse, ApiRequire, DocumentInterface } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["objectId"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { objectId } = messageBody;

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT.startsWith("development")
  ) {
    /*
      Potential Easter Eggs here
    */
  }

  //New model: work with previously uploaded files

  const documentState = await DocumentInterface.getDocumentState(objectId);
  if (!documentState) {
    return ApiResponse.makeFullErrorResponse(
      "file-error",
      "File not found: " + objectId
    );
  } else {
    return ApiResponse.makeResponse(200, {
      objectId: objectId,
      documentStatus: documentState,
    });
  }
};
