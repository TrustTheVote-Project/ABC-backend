const { Election, Voter, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["VIDN"];

  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeResponse(500, { error: "Incorrect arguments" });
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

  //post Complete

  const success = await voter.incrementSession("complete");

  if (!success) {
    return ApiResponse.SessionIncrementError("Complete for:" + messageBody);
  } else {
    return ApiResponse.makeResponse(200, "");
  }
};
