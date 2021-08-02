// Note: /opt/Common is where all the lib layer code gets put
const { Voter, ApiResponse } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["IDnumber", "lastName", "firstName", "dateOfBirth"];

  const messageBody = JSON.parse(event.body);

  if (!requiredArgs.every((x) => messageBody.hasOwnProperty(x))) {
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

  const response = {
    statusCode: 200,
    body: JSON.stringify(voter.attributes, null, 2),
  };
  return response;
};
