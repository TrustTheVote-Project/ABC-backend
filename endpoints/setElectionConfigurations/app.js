const {
  Voter,
  Election,
  ApiResponse,
  ApiRequire,
  AccessControl,
} = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["electionId", "configurations"];
  const messageBody = JSON.parse(event.body);

  const { electionId } = messageBody;
  const election = await Election.findByElectionId(electionId);

  if (!election) {
    return ApiResponse.noMatchingElection(electionId);
  }
  //Check allowed
  const [allowed, reason] = await Election.endpointWorkflowAllowed(
    AccessControl.apiEndpoint.setElectionConfigurations,
    election
  );
  if (!allowed) {
    return ApiResponse.makeWorkflowErrorResponse(reason);
  }

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { configurations } = messageBody;

  const configurationsJson =
    typeof configurations == "object"
      ? JSON.stringify(configurations)
      : configurations;

  await election.update({ configurations: configurationsJson });
  return ApiResponse.makeResponse(200, election.attributes);
};
