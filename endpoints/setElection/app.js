const { Voter, Election, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["electionName"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const electionId = messageBody["electionId"];

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT.startsWith("development")
  ) {
    /*
      Potential Easter Eggs here
    */
  }

  if (electionId) {
    //Update request
    const election = await Election.findByElectionId(electionId);
    if (!election) {
      return ApiResponse.noMatchingElection(electionId);
    } else {
      const updatedElection = await election.update(messageBody);

      if (!updatedElection) {
        return ApiResponse.makeResponse(
          500,
          "Election update error:" + JSON.stringify(messageBody)
        );
      } else {
        return ApiResponse.makeResponse(200, updatedElection.attributes);
      }
    }
  } else {
    //Create request

    const election = await Election.create(messageBody, context.awsRequestId);

    if (!election) {
      return ApiResponse.makeResponse(
        500,
        "Election creation error:" + JSON.stringify(messageBody)
      );
    } else {
      return ApiResponse.makeResponse(200, election.attributes);
    }
  }
};
