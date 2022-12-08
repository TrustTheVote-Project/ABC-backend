// Note: /opt/Common is where all the lib layer code gets put
const { Election, Voter, ApiResponse, ApiRequire } = require("/opt/Common");
const { getLatModeFromEvent } = require("/opt/LatMode");

exports.lambdaHandler = async (event, context, callback) => {
  const latMode = getLatModeFromEvent(event);
  
  const election = await Election.currentElection(latMode);
  if (!election) {
    return ApiResponse.noElectionResponse();
  }
  const requiredArgs = ["SSN4HashTruncated", "lastName", "yearOfBirth"];

  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { SSN4HashTruncated, lastName, firstName, yearOfBirth } = messageBody;

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT.startsWith("development")
  ) {
    if (SSN4HashTruncated.toLowerCase() === "emptyresponse") {
      return ApiResponse.makeResponse(200, Voter.emptyResponse);
    } else if (SSN4HashTruncated.toLowerCase() === "wrongresponse") {
      return ApiResponse.makeResponse(200, Voter.wrongResponse);
    } else if (SSN4HashTruncated.toLowerCase() === "noresponse") {
      return ApiResponse.makeResponse(200, Voter.noResponse);
    }
  }

  const voter = await Voter.findBySSN4Hash(
    SSN4HashTruncated,
    lastName,
    firstName,
    yearOfBirth,
    election
  );
  if (!voter) {
    return ApiResponse.noMatchingVoter(messageBody);
  }

  return ApiResponse.makeResponse(200, voter.consumerProperties());
};
