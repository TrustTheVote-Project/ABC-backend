const { Election, Voter, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const latMode =
    (event.headers["User-Agent"] || "").toLowerCase().indexOf("test") >= 0;
  const election = await Election.currentElection(latMode);
  if (!election) {
    return ApiResponse.noElectionResponse();
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

  //post Complete

  const success = await voter.incrementSession("complete");

  if (!success) {
    return ApiResponse.SessionIncrementError("Complete for:" + messageBody);
  } else {
    return ApiResponse.makeResponse(200, voter.attributes);
  }
};
