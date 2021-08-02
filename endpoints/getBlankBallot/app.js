const { Election, Voter, ApiResponse } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["VIDN"];

  const messageBody = JSON.parse(event.body);

  if (!requiredArgs.every((x) => messageBody.hasOwnProperty(x))) {
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

  // TODO: need to find out if we're using firebase in the app for messaging.
  // Update device token if there's a match
  // const { device_token } = voter.attributes;
  // await voter.update({device_token: FCM_token})
  console.log(JSON.stringify(voter.attributes));
  const response = {
    statusCode: 200,
    body: JSON.stringify(election.blankBallotURL(voter), null, 2),
  };
  return response;
};
