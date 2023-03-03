const { Election, ApiResponse, AccessControl } = require("/opt/Common");
const { getLatModeFromEvent } = require("/opt/LatMode");

exports.lambdaHandler = async (event, context, callback) => {
  const latMode = getLatModeFromEvent(event);
  const election = await Election.currentElection(latMode);

  if (!election) {
    return ApiResponse.noElectionResponse();
  }
  //Check allowed
  const [allowed, reason] = await Election.endpointWorkflowAllowed(
    AccessControl.apiEndpoint.getConfigurations,
    election,
    latMode
  );
  if (!allowed) {
    return ApiResponse.makeWorkflowErrorResponse(reason);
  }

  return ApiResponse.makeResponse(200, election.configurations());
};
