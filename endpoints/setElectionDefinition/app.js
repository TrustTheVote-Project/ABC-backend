const {
  Election,
  ApiResponse,
  ApiRequire,
  DocumentInterface,
  AccessControl,
} = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["electionId", "objectId"];
  const messageBody = JSON.parse(event.body);

  const { electionId } = messageBody;
  const election = await Election.findByElectionId(electionId);

  if (!election) {
    return ApiResponse.noMatchingElection(electionId);
  }
  //Check allowed
  const [allowed, reason] = await Election.endpointWorkflowAllowed(
    AccessControl.apiEndpoint.setElectionDefinition,
    election
  );
  if (!allowed) {
    return ApiResponse.makeWorkflowErrorResponse(reason);
  }

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { objectId } = messageBody;

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
        return ApiResponse.makeFullErrorResponse("validation-error", message);
      }
    } else {
      return ApiResponse.makeFullErrorResponse(
        "file-error",
        "File not ready: " + objectId
      );
    }
  }
};
