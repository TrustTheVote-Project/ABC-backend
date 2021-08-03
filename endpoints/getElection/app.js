const { Election } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const elections = await Election.all();
  if (!elections || elections.length == 0) {
    const response = {
      statusCode: 404,
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
    body: JSON.stringify(
      elections.map((election) => election.attributes),
      null,
      2
    ),
  };
  return response;
};
