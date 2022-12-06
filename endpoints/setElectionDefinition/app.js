const {
  Election,
  ApiResponse,
  ApiRequire,
  DocumentInterface,
} = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["electionId", "objectId"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { electionId, objectId } = messageBody;

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT.startsWith("development")
  ) {
    /*
      Potential Easter Eggs here
    */
  }

  //Update request
  const election = await Election.findByElectionId(electionId);
  if (!election) {
    return ApiResponse.noMatchingElection(electionId);
  } else {
    //New model: work with previously uploaded files

    const documentState = await DocumentInterface.getDocumentState(objectId);
    if (!documentState) {
      return ApiResponse.makeFullErrorResponse(
        "file-error",
        "File not found: " + objectId
      );
    } else {
      if (documentState.status === "ready") {
        const [success, message] = await election.setElectionDefinition(
          objectId,
          documentState
        );
        if (success) {
          return ApiResponse.makeResponse(200, {
            objectKey: electionId + "_edf.json",
          });
        } else {
          return ApiResponse.makeFullErrorResponse("file-error", message);
        }
      } else {
        return ApiResponse.makeFullErrorResponse(
          "file-error",
          "File not ready: " + objectId
        );
      }
    }
  }
};
