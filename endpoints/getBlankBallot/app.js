const { Election, Voter, ApiResponse, ApiRequire } = require("/opt/Common");
const { getLatModeFromEvent } = require("/opt/LatMode");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["VIDN"];

  const messageBody = event.body ? JSON.parse(event.body) : {};

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { VIDN } = messageBody;

  const latMode = getLatModeFromEvent(event);
  
  const election = await Election.currentElection(latMode);

  if (!election) {
    return ApiResponse.noElectionResponse();
  }

  const voter = await Voter.findByVIDN(VIDN, election);

  if (!voter) {
    return ApiResponse.noMatchingVoter(messageBody);
  }

  const url = election.blankBallotURL(voter);

  return ApiResponse.makeResponse(200, { blankBallotURL: url });
};
