// Note: /opt/Common is where all the lib layer code gets put
const { Voter, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
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
    firstName
    //addressLine2
  );
  if (!voter) {
    return ApiResponse.noMatchingVoter(messageBody);
  }

  return ApiResponse.makeResponse(200, voter.attributes);
};
