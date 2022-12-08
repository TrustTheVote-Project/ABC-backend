const { Election, ApiResponse } = require("/opt/Common");
const { getLatModeFromEvent } = require("/opt/LatMode");
  
exports.lambdaHandler = async (event, context, callback) => {
  const latMode = getLatModeFromEvent(event);

  const election = await Election.currentElection(latMode);

  if (!election) {
    return ApiResponse.noElectionResponse();
  } else {
    return ApiResponse.makeResponse(
      200,
      Election.filterConsumerProperties(election.attributes)
    );
  }
};
