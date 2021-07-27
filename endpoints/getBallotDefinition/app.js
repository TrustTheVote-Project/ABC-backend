// Note: /opt/Common is where all the lib layer code gets put
const { Voter } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const messageBody = JSON.parse(event.body);
  const { VIDN } = messageBody;

  console.log("VIDN is ###" + VIDN + "###");

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT === "development"
  ) {
    if (VIDN.toLowerCase() === "emptyresponse") {
      return {
        statusCode: 200,
        body: emptyResponse,
      };
    } else if (VIDN.toLowerCase() === "wrongresponse") {
      return {
        statusCode: 200,
        body: wrongResponse,
      };
    } else if (VIDN.toLowerCase() === "noresponse") {
      return {
        statusCode: 200,
        body: noResponse,
      };
    } /*else if (voterIdNumber.toLowerCase()) {
      return {
        statusCode: 200,
        body: badResponse,
      };
    }*/
  }

  const voter = await Voter.findByVoterIdNumber(voterIdNumber);
  if (!voter) {
    const response = {
      statusCode: 404,
      body: JSON.stringify(
        {
          error_type: "no_match",
          error_description: `No record matching voter id number ${voterIdNumber}`,
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
