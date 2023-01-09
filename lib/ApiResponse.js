class ApiResponse {
  static makeResponse(statusCode, bodyJSON) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
      },
      statusCode: statusCode,
      body: JSON.stringify(bodyJSON, null, 2),
    };
  }

  static makeErrorResponse(bodyJSON, statusCode = 400) {
    return ApiResponse.makeResponse(statusCode, bodyJSON);
  }

  static makeErrorBody(type, description) {
    return {
      error_type: type,
      error_description: description,
    };
  }

  static makeFullErrorResponse(type, description, statusCode = 400) {
    return ApiResponse.makeErrorResponse(
      ApiResponse.makeErrorBody(type, description),
      statusCode
    );
  }

  static makeRequiredArgumentsError(msg = "") {
    return ApiResponse.makeFullErrorResponse(
      "required_argument_error",
      "Missing a required argument" + (msg ? ": " + msg : "")
    );
  }

  static makeStringResponse(statusCode, string) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Content-Type": "text/plain",
      },
      statusCode: statusCode,
      body: string,
    };
  }

  static notImplementedResponse(functionName) {
    return makeStringResponse(
      200,
      `Sorry: ${functionName} not currently implemented. Otherwise all good! :-)`
    );
  }

  static noElectionResponse() {
    return ApiResponse.makeFullErrorResponse(
      "no_election",
      "No current election"
    );
  }

  static noMatchingElectionResponse(id) {
    return ApiResponse.makeFullErrorResponse(
      "no_matching_election",
      `No election matching:${id}`
    );
  }

  static noMatchingElection(id) {
    return ApiResponse.makeFullErrorResponse(
      "no_matching_election",
      `No election matching:${id}`
    );
  }

  static noMatchingVoter(voterSpecification) {
    return ApiResponse.makeFullErrorResponse(
      "no_matching_voter",
      `No voter matching:` + JSON.stringify(voterSpecification, null, 2)
    );
  }

  static SessionIncrementError(voterSpecification) {
    return ApiResponse.makeFullErrorResponse(
      "session_increment_error",
      `No voter matching:` + JSON.stringify(voterSpecification, null, 2),
      500
    );
  }
}

exports.ApiResponse = ApiResponse;
