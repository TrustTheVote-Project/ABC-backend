const { Election } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const election = await Election.currentElection();
  if (!election) {
    const response = {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      },
      body: JSON.stringify(
        {
          error_type: "no_match",
          error_description: `No open elections`,
        },
        null,
        2
      ),
    };
    return response;
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
