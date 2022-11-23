const { Election, ApiResponse } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  messageBody = event.body ? JSON.parse(event.body) : {};
  
  if (messageBody["electionId"]) {
    const { electionId } = messageBody;
    const election = await Election.findByElectionId(electionId);
    if (!election) {
      return ApiResponse.noMatchingElection(electionId);
    } else {
      return ApiResponse.makeResponse(200, election.attributes);
    }
  } else {
    const elections = await Election.all();
    if (!elections || elections.length == 0) {
      return ApiResponse.noElectionResponse();
    }

    return ApiResponse.makeResponse(
      200,
      elections.map((election) => election.attributes)
    );
  }
};
