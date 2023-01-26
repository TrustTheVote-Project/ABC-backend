const {
  Voter,
  Election,
  ApiResponse,
  ApiRequire,
  AccessControl,
} = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = [
    "electionName",
    "electionJurisdictionName",
    "electionDate",
    "electionVotingStartDate",
    "electionVotingEndDate",
  ];
  const messageBody = event.body ? JSON.parse(event.body) : {};

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  //Check allowed
  const [allowed, reason] = await Election.endpointWorkflowAllowed(
    AccessControl.apiEndpoint.createElection,
    false
  );
  if (!allowed) {
    return ApiResponse.makeWorkflowErrorResponse(reason);
  }

  const election = await Election.create(messageBody, context.awsRequestId);

  if (!election) {
    return ApiResponse.makeResponse(
      500,
      "Election creation error:" + JSON.stringify(messageBody)
    );
  } else {
    return ApiResponse.makeResponse(200, election.attributes);
  }
};

/*
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
*/
