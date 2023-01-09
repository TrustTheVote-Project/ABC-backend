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
      if (!election.allAttributes.edfSet) {
        return ApiResponse.makeFullErrorResponse(
          "state-transition-error",
          "Election Definition File not set"
        );
      }
      if (!election.allAttributes.ballotsSet) {
        return ApiResponse.makeFullErrorResponse(
          "state-transition-error",
          "Ballots not set"
        );
      }
      if (!election.allAttributes.votersSet) {
        return ApiResponse.makeFullErrorResponse(
          "state-transition-error",
          "Voters not set"
        );
      }
      if (election.attributes.servingStatus == Election.servingStatus.closed) {
        const testCount = (election.attributes.testCount || 0) + 1         

        await election.update({
          servingStatus: Election.servingStatus.open,
          electionStatus: Election.electionStatus.test,
          latMode: "1",
          testCount: testCount,
        });
        return ApiResponse.makeResponse(200, election.attributes);
      } else {
        return ApiResponse.makeFullErrorResponse(
          "Invalid state transition",
          "Election in state " +
            election.attributes.servingStatus +
            " cannot be put into test mode."
        );
      }
    }
  }
};
