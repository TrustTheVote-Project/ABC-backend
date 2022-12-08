const { Voter, Election, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["electionId"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { electionId } = messageBody;

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
      if (
        election.attributes.servingStatus == Election.servingStatus.closed ||
        election.attributes.servingStatus == Election.servingStatus.lookup
      ) {
        if (!election.attributes.testCount) {
          return ApiResponse.makeFullErrorResponse(
            "Invalid state transition",
            "Election must be tested before it can be opened."
          );
        } else {
          await election.update({ 
            electionStatus: Election.electionStatus.live, 
            servingStatus: Election.servingStatus.open 
          });
          return ApiResponse.makeResponse(200, election.attributes);
        }
      } else {
        return ApiResponse.makeFullErrorResponse(
          "Invalid state transition",
          "Election in state " +
            election.attributes.servingStatus +
            " cannot be opened."
        );
      }
    }
  }
};
