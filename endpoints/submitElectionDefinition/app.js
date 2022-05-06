const { Election, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  let initialStatus = "started",
    errorMsg = "";

  const requiredArgs = ["electionId"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { electionId, EDFJSON, EDFFile } = messageBody;

  if (!(EDFJSON || EDFFile)) {
    return ApiResponse.makeRequiredArgumentsError(
      "One of EDFJSON or EDFFile must be provided"
    );
  }

  const EDFAsJSON =
    EDFJSON && typeof EDFJSON == "object" ? JSON.stringify(EDFJSON) : EDFJSON;

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT.startsWith("development")
  ) {
    /*
      Potential Easter Eggs here
    */
    if (EDFFile && !EDFFile.endsWith(".zip")) {
      initialStatus = "error";
      errorMsg = "File is not a valid zip archive.";
    }
    if (EDFJSON && typeof EDFJSON == "object" && EDFJSON.error) {
      initialStatus = "error";
      errorMsg = "File is not a valid zip archive.";
    }
  }

  if (electionId) {
    //Update request
    const election = await Election.findByElectionId(electionId);
    if (!election) {
      return ApiResponse.noMatchingElection(electionId);
    } else {
      //TBD: John and Alex to implement validation routines
      //await election.update({ electionDefinition: EDFJSON });

      //New model: create file and start background processing

      if (EDFJSON) {
        const uuid = context.awsRequestId;

        const [success, message] = await election.startEDFSubmission(
          uuid,
          EDFAsJSON,
          initialStatus,
          errorMsg
        );

        await election.update({ electionDefinitionFile: uuid });
        if (success) {
          return ApiResponse.makeResponse(200, { uuid: uuid });
        } else {
          return ApiResponse.makeErrorResponse(message);
        }
      } else {
        const [success, message] = await election.initiateEDFSubmission(
          EDFFile,
          initialStatus,
          errorMsg
        );

        await election.update({ electionDefinitionFile: EDFFile });
        if (success) {
          return ApiResponse.makeResponse(200, { uuid: EDFFile });
        } else {
          return ApiResponse.makeErrorResponse(message);
        }
      }
    }
  }
};
