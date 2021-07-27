const { Election } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const election = await Election.currentElection();
  if (!election) {
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
    body: JSON.stringify(election.affidavitTemplateURL(), null, 2),
  };
  return response;
};
