const { Election, ApiResponse } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const latMode =
    (event.headers["User-Agent"] || "").toLowerCase().indexOf("test") >= 0;
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
