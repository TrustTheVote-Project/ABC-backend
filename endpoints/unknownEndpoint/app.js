//const { Election, Voter, ApiResponse, ApiRequire, AccessControl, } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  return {
    //To be determined constraints
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    statusCode: 404,
  };
};
