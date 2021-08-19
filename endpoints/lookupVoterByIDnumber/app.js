// Note: /opt/Common is where all the lib layer code gets put
//const { ApiResponse } = require("../../lib/ApiResponse");
//const { Election } = require("../../lib/Election");
const { Voter, Election, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["lastName", "yearOfBirth", "IDnumber"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { firstName, lastName, yearOfBirth, IDnumber } = messageBody;

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT === "development"
  ) {
    if (IDnumber.toLowerCase() === "emptyresponse") {
      return ApiResponse.makeResponse(200, Voter.emptyResponse);
    } else if (IDnumber.toLowerCase() === "wrongresponse") {
      return ApiResponse.makeResponse(200, Voter.wrongResponse);
    } else if (IDnumber.toLowerCase() === "noresponse") {
      return ApiResponse.makeResponse(200, Voter.noResponse);
    }
  }

  if (!Election.currentElection()) {
    return ApiResponse.noElectionResponse();
  }

  const voter = await Voter.findByVoterIdNumber(
    firstName,
    lastName,
    yearOfBirth,
    IDnumber
  );

  if (!voter) {
    return ApiResponse.noMatchingVoter(messageBody);
  }

  // TODO: need to find out if we're using firebase in the app for messaging.
  // Update device token if there's a match
  // const { device_token } = voter.attributes;
  // await voter.update({device_token: FCM_token})

  return ApiResponse.makeResponse(200, voter.attributes);
};
