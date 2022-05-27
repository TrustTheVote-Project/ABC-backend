const { Election, ApiResponse } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const latMode =
    event &&
    event.headers &&
    (event.headers["User-Agent"] || "").toLowerCase().indexOf("test") >= 0
      ? 1
      : 0;
  const election = await Election.currentElection(latMode);
  if (!election) {
    return ApiResponse.noElectionResponse();
  }

  const url = election.affidavitTemplateURL();

  return ApiResponse.makeResponse(200, { affidavitTemplateURL: url });
};
