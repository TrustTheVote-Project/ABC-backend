const { Voter, Election, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["electionId", "configurations"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { electionId, configurations } = messageBody;

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
      await election.update({ configurations: configurations });
      return ApiResponse.makeResponse(200, election.attributes);
      //return ApiResponse.notImplementedResponse("setConfigurations");
    }
  }
};
