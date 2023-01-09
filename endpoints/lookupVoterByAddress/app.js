// Note: /opt/Common is where all the lib layer code gets put
const { Voter, Election, ApiResponse, ApiRequire } = require("/opt/Common");
const { getLatModeFromEvent } = require("/opt/LatMode");

exports.lambdaHandler = async (event, context, callback) => {
  const latMode = getLatModeFromEvent(event);
  
  const election = await Election.currentElection(latMode);
  if (!election) {
    return ApiResponse.noElectionResponse();
  }
  const requiredArgs = [
    "ZIP5",
    //"stateCode",
    //"city",
    "yearOfBirth",
    "lastName",
    "streetNumber",
  ];

  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const {
    ZIP5,
    //stateCode,
    //city,
    yearOfBirth,
    lastName,
    streetNumber,
    firstName,
    //addressLine2,
  } = messageBody;

  /*
  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT.startsWith("development")
  ) {
    if (ZIP5.toLowerCase() === "emptyresponse") {
      return ApiResponse.makeResponse(200, Voter.emptyResponse);
    } else if (ZIP5.toLowerCase() === "wrongresponse") {
      return ApiResponse.makeResponse(200, Voter.wrongResponse);
    } else if (ZIP5.toLowerCase() === "noresponse") {
      return ApiResponse.makeResponse(200, Voter.noResponse);
    }
  }
  */

  const voter = await Voter.findByAddress(
    ZIP5,
    //stateCode,
    //city,
    yearOfBirth,
    lastName,
    streetNumber,
    firstName,
    election
    //addressLine2
  );
  if (!voter) {
    return ApiResponse.noMatchingVoter(messageBody);
  }

  return ApiResponse.makeResponse(200, voter.consumerProperties());
};
