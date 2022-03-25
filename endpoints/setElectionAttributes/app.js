const { Voter, Election, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = [
    "electionId",
    "electionJurisdictionName",
    "electionName",
    "electionDate",
    "electionVotingStartDate",
  ];
  const messageBody = JSON.parse(event.body);

  const {
    electionId,
    electionJurisdictionName,
    electionName,
    electionDate,
    electionVotingStartDate,
  } = messageBody;

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT.startsWith("development")
  ) {
    /*
      Potential Easter Eggs here
    */
  }

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
};
