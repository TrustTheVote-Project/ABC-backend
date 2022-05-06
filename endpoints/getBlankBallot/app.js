const { Election, Voter, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["VIDN"];

  const messageBody = event.body ? JSON.parse(event.body) : {};

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { VIDN } = messageBody;

  const election = await Election.currentElection();

  if (!election) {
    return ApiResponse.noElectionResponse();
  }

  const voter = await Voter.findByVIDN(VIDN);

  if (!voter) {
    return ApiResponse.noMatchingVoter(messageBody);
  }

  const url = election.blankBallotURL(voter);

  return ApiResponse.makeResponse(200, { blankBallotURL: url });
};
