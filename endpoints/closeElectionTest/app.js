const {
  Voter,
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

  //Check allowed
  const [allowed, reason] = await Election.endpointWorkflowAllowed(
    AccessControl.apiEndpoint.closeElectionTest,
    election
  );
  if (!allowed) {
    return ApiResponse.makeWorkflowErrorResponse(reason);
  }

  await election.update({
    latMode: 0,
  });

  return ApiResponse.makeResponse(200, election.attributes);
};

/*
  if (electionId) {
    //Update request
    const election = await Election.findByElectionId(electionId);
    if (!election) {
      return ApiResponse.noMatchingElection(electionId);
    } else {
      if (election.attributes.servingStatus == Election.servingStatus.open) {
        await election.update({
          servingStatus: Election.servingStatus.closed,
          electionStatus: Election.electionStatus.pending,
          latMode: "0",
        });
        return ApiResponse.makeResponse(200, election.attributes);
      } else {
        return ApiResponse.makeFullErrorResponse(
          "Invalid state transition",
          "Election in state " +
            election.attributes.servingStatus +
            " cannot be closed for testing."
        );
      }
    }
  }
};
*/
