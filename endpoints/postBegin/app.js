const { Election, Voter, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const latMode =
    event &&
    event.headers &&
    (event.headers["User-Agent"] || "").toLowerCase().indexOf("test") >= 0
      ? 1
      : 0;
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

  //post Begin

  //const success = await voter.incrementSession("begin");
  const success = true;

  if (!success) {
    return ApiResponse.SessionIncrementError("Begin for:" + messageBody);
  } else {
    return ApiResponse.makeResponse(200, voter.consumerProperties());
  }
};
