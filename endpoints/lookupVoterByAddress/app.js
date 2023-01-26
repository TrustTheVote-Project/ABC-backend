// Note: /opt/Common is where all the lib layer code gets put
const {
  Voter,
  Election,
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
    AccessControl.apiEndpoint.lookupVoterByAddress,
    election,
    latMode
  );
  if (!allowed) {
    return ApiResponse.makeWorkflowErrorResponse(reason);
  }

  const requiredArgs = ["ZIP5", "yearOfBirth", "lastName", "streetNumber"];

  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { ZIP5, yearOfBirth, lastName, streetNumber, firstName } = messageBody;

  const voter = await Voter.findByAddress(
    ZIP5,
    yearOfBirth,
    lastName,
    streetNumber,
    firstName,
    election
  );
  if (!voter) {
    return ApiResponse.noMatchingVoter(messageBody);
  }

  return ApiResponse.makeResponse(200, voter.consumerProperties());
};
