const {
  Application,
  Election,
  ApiResponse,
  ApiRequire,
  AccessControl,
} = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["electionId"];
  const messageBody = JSON.parse(event.body);

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
    AccessControl.apiEndpoint.setCurrentElection,
    election
  );
  if (!allowed) {
    return ApiResponse.makeWorkflowErrorResponse(reason);
  }

  const currentElectionId = await Application.get("currentElectionId");

  if (currentElectionId) {
    const currentElection = await Election.findByElectionId(currentElectionId);
    if (currentElection) {
      await currentElection.update({
        electionStatus: Election.electionStatus.archived,
      });
    }
  }

  await Application.set("currentElectionId", electionId);
  await election.update({ electionStatus: Election.electionStatus.inactive });

  return ApiResponse.makeResponse(200, election.attributes);
};
