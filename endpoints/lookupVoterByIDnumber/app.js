// Note: /opt/Common is where all the lib layer code gets put
//const { ApiResponse } = require("../../lib/ApiResponse");
//const { Election } = require("../../lib/Election");
const { Voter, Election, ApiResponse, ApiRequire } = require("/opt/Common");
const { getLatModeFromEvent } = require("/opt/LatMode");

exports.lambdaHandler = async (event, context, callback) => {
  const latMode = getLatModeFromEvent(event);
  
  const election = await Election.currentElection(latMode);
  if (!election) {
    return ApiResponse.noElectionResponse();
  }

  const requiredArgs = ["lastName", "yearOfBirth", "IDnumberHashTruncated"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { firstName, lastName, yearOfBirth, IDnumberHashTruncated } =
    messageBody;

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT.startsWith("development")
  ) {
    if (IDnumberHashTruncated.toLowerCase() === "emptyresponse") {
      return ApiResponse.makeResponse(200, Voter.emptyResponse);
    } else if (IDnumberHashTruncated.toLowerCase() === "wrongresponse") {
      return ApiResponse.makeResponse(200, Voter.wrongResponse);
    } else if (IDnumberHashTruncated.toLowerCase() === "noresponse") {
      return ApiResponse.makeResponse(200, Voter.noResponse);
    }
  }

  const voter = await Voter.findByVoterIdNumber(
    firstName,
    lastName,
    yearOfBirth,
    IDnumberHashTruncated,
    election
  );

  if (!voter) {
    return ApiResponse.noMatchingVoter(messageBody);
  }

  // TODO: need to find out if we're using firebase in the app for messaging.
  // Update device token if there's a match
  // const { device_token } = voter.attributes;
  // await voter.update({device_token: FCM_token})

  return ApiResponse.makeResponse(200, voter.consumerProperties());
};
