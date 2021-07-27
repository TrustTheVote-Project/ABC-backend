// Note: /opt/Common is where all the lib layer code gets put
const { Voter, ApiResponse } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const messageBody = JSON.parse(event.body);
  const { SSN } = messageBody;

  console.log("Message body is ###" + JSON.stringify(messageBody) + "###");
  console.log("SSN is ###" + SSN + "###");

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT === "development"
  ) {
    if (SSN.toLowerCase() === "emptyresponse") {
      return {
        statusCode: 200,
        body: Voter.emptyResponse,
      };
    } else if (SSN.toLowerCase() === "wrongresponse") {
      return {
        statusCode: 200,
        body: Voter.wrongResponse,
      };
    } else if (SSN.toLowerCase() === "noresponse") {
      return {
        statusCode: 200,
        body: Voter.noResponse,
      };
    }
  }

  const voter = await Voter.findBySSN(SSN);
  if (!voter) {
    const response = {
      statusCode: 404,
      body: JSON.stringify(
        {
          error_type: "no_match",
          error_description: `No record matching voter SSN ${SSN}`,
        },
        null,
        2
      ),
    };
    return response;
  }

  // TODO: need to find out if we're using firebase in the app for messaging.
  // Update device token if there's a match
  // const { device_token } = voter.attributes;
  // await voter.update({device_token: FCM_token})

  const response = {
    statusCode: 200,
    body: JSON.stringify(voter.attributes, null, 2),
  };
  return response;
};
