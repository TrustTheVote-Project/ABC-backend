const {
  Voter,
  Election,
  ApiResponse,
  ApiRequire,
  AccessControl,
} = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["electionId"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { electionId } = messageBody;

  const election = await Election.findByElectionId(electionId);

  //Check allowed
  const [allowed, reason] = await Election.endpointWorkflowAllowed(
    AccessControl.apiEndpoint.setAffadavitTemplate,
    election,
    latMode
  );
  if (!allowed) {
    return ApiResponse.makeWorkflowErrorResponse(reason);
  }

  if (!election) {
    return ApiResponse.noMatchingElection(electionId);
  } else {
    return ApiResponse.notImplementedResponse("setAffidavitTemplate");
  }
};
