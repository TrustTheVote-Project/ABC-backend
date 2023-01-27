const {
  Voter,
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
    AccessControl.apiEndpoint.setElectionBallots,
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
      const [success, message] = await election.setElectionBallots(
        objectId,
        documentState
      );
      if (success) {
        return ApiResponse.makeResponse(200, {
          files: Object.keys(documentState["files"]),
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
};
