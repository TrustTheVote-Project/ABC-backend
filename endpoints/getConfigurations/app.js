const { Election, ApiResponse } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const election = await Election.currentElection();
  if (!election) {
    return ApiResponse.noElectionResponse();
  }

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*"
    },
    body: JSON.stringify(election.configurations(), null, 2),
  };
  return response;
};
