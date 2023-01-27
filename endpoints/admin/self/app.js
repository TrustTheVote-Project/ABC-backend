const {
  Logger,
  AccessControl,
  Application,
  ApiResponse,
  ApiRequire,
} = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  // Generate a session ID
  const sessionId = await AccessControl.extractSessionId(event);
  Logger.debug(event);
  Logger.debug(sessionId);
  const storedAdminSessionId = await Application.get("AdminSessionId");
  if (sessionId === storedAdminSessionId) {
    return ApiResponse.makeResponse(200, {
      success: true,
    });
  } else {
    return ApiResponse.makeErrorResponse(
      {
        success: false,
      },
      403
    );
  }
};
