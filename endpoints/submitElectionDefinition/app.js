const { Voter, Election, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  console.log("HI", event, context)
  
  const requiredArgs = ["electionId", "EDF"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { electionId, EDF } = messageBody;

  

  const EDFJSON = typeof EDF == "object" ? JSON.stringify(EDF) : EDF;

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
      //TBD: John and Alex to implement validation routines
      await election.update({ electionDefinition: EDFJSON });
      return ApiResponse.makeResponse(200, election.attributes);
    }
  }
};
