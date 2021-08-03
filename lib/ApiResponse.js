class ApiResponse {
  static makeResponse(statusCode, bodyJSON) {
    return { 
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      },
      statusCode: statusCode, 
      body: JSON.stringify(bodyJSON, null, 2) 
    };
  }

  static noElectionResponse() {
    return ApiResponse.makeResponse(404, {
      error_type: "no_election",
      error_description: `No current election`,
    });
  }

  static noMatchingVoter(voterSpecification) {
    return ApiResponse.makeResponse(404, {
      error_type: "no_matching voter",
      error_description:
        `No voter matching:` + JSON.stringify(voterSpecification, null, 2),
    });
  }
}

exports.ApiResponse = ApiResponse;
