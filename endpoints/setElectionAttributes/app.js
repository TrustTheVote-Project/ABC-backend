const {
  Voter,
  Election,
  ApiResponse,
  ApiRequire,
  AccessControl,
} = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = [
    "electionId",
    /*"electionJurisdictionName",
    "electionName",
    "electionDate",
    "electionVotingStartDate",
    */
  ];
  const messageBody = JSON.parse(event.body);

  /*const {
    electionId,
    electionJurisdictionName,
    electionName,
    electionDate,
    electionVotingStartDate,
  } = messageBody;
*/
  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { electionId } = messageBody;

  const election = await Election.findByElectionId(electionId);

  if (!election) {
    return ApiResponse.noMatchingElection(electionId);
  }
  //Check allowed
  const [allowed, reason] = await Election.endpointWorkflowAllowed(
    AccessControl.apiEndpoint.setElectionAttributes,
    election
  );
  if (!allowed) {
    return ApiResponse.makeWorkflowErrorResponse(reason);
  }

  const updatedElection = await election.update(messageBody);

  if (!updatedElection) {
    return ApiResponse.makeResponse(
      500,
      "Election update error:" + JSON.stringify(messageBody)
    );
  } else {
    return ApiResponse.makeResponse(200, updatedElection.attributes);
  }
};
