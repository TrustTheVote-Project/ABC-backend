// Note: /opt/Common is where all the lib layer code gets put
const { Voter, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["IDnumber", "lastName", "dateOfBirth"];

  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeResponse(500, { error: "Incorrect arguments" });
  }

  const { IDnumber, lastName, firstName, dateOfBirth } = messageBody;
  const SSN = IDnumber;
  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT === "development"
  ) {
    if (SSN.toLowerCase() === "emptyresponse") {
      return ApiResponse.makeResponse(200, Voter.emptyResponse);
    } else if (SSN.toLowerCase() === "wrongresponse") {
      return ApiResponse.makeResponse(200, Voter.wrongResponse);
    } else if (SSN.toLowerCase() === "noresponse") {
      return ApiResponse.makeResponse(200, Voter.noResponse);
    }
  }

  const voter = await Voter.findBySSN(SSN, lastName, firstName, dateOfBirth);
  if (!voter) {
    return ApiResponse.noMatchingVoter(messageBody);
  }

  return ApiResponse.makeResponse(200, voter.attributes);
};
