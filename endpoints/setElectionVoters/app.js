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

  const { electionId, latMode } = messageBody;

  const election = await Election.findByElectionId(electionId);

  if (!election) {
    return ApiResponse.noMatchingElection(electionId);
  }

  //Check allowed
  const [allowed, reason] = await Election.endpointWorkflowAllowed(
    latMode
      ? AccessControl.apiEndpoint.setElectionTestVoters
      : AccessControl.apiEndpoint.setElectionVoters,
    election
  );
  if (!allowed) {
    return ApiResponse.makeWorkflowErrorResponse(reason);
  }

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { objectId } = messageBody;
  console.log(event.body);

  const documentState = await DocumentInterface.getDocumentState(objectId);
  if (!documentState) {
    return ApiResponse.makeFullErrorResponse(
      "file-error",
      "File not found: " + objectId
    );
  } else {
    if (documentState.status === "ready") {
      const [success, message] = await election.setElectionVoters(
        objectId,
        documentState,
        latMode ? 1 : 0
      );
      if (success) {
        return ApiResponse.makeResponse(200, {
          file: Object.keys(documentState["files"]),
          message: message,
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
