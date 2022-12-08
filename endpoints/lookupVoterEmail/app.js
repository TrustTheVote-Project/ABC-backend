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

  const requiredArgs = ["VIDN"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { VIDN } = messageBody;

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT.startsWith("development")
  ) {
    if (VIDN.toLowerCase() === "emptyresponse") {
      return ApiResponse.makeResponse(200, Voter.emptyResponse);
    } else if (VIDN.toLowerCase() === "wrongresponse") {
      return ApiResponse.makeResponse(200, Voter.wrongResponse);
    } else if (VIDN.toLowerCase() === "noresponse") {
      return ApiResponse.makeResponse(200, Voter.noResponse);
    }
  }

  const voter = await Voter.findByVIDN(VIDN, election);

  if (!voter) {
    return ApiResponse.noMatchingVoter(messageBody);
  }

  return ApiResponse.makeResponse(200, {
    email: voter.attributes["email"] || "",
    precinctID: voter.attributes["precinctID"] || "",
    ballotID: voter.attributes["ballotID"] || "",
  });
};
