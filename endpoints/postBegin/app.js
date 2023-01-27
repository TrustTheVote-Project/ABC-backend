const {
  Election,
  Voter,
  ApiResponse,
  ApiRequire,
  AccessControl,
} = require("/opt/Common");
const { getLatModeFromEvent } = require("/opt/LatMode");

exports.lambdaHandler = async (event, context, callback) => {
  const latMode = getLatModeFromEvent(event);
  const election = await Election.currentElection(latMode);
  if (!election) {
    return ApiResponse.noElectionResponse();
  }

  //Check allowed
  const [allowed, reason] = await Election.endpointWorkflowAllowed(
    AccessControl.apiEndpoint.postBegin,
    election,
    latMode
  );
  if (!allowed) {
    return ApiResponse.makeWorkflowErrorResponse(reason);
  }

  const requiredArgs = ["VIDN"];

  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { VIDN } = messageBody;

  const voter = await Voter.findByVIDN(VIDN, election);

  if (!voter) {
    return ApiResponse.noMatchingVoter(messageBody);
  }

  //post Begin
  const success = await voter.incrementSession("begin");
  //const success = true;

  if (!success) {
    return ApiResponse.SessionIncrementError("Begin for:" + messageBody);
  } else {
    return ApiResponse.makeResponse(200, voter.consumerProperties());
  }
};
