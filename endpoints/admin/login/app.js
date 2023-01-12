const { Logger, AccessControl, Application, ApiResponse, ApiRequire } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["email"];
  const messageBody = JSON.parse(event.body);
  
  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { email, totp } = messageBody;

  let passedAuth = true

  const authenticatorSecret = await Application.get("AuthenticatorSecret")
  Logger.debug(authenticatorSecret)
  if (authenticatorSecret) {
    const systemTotp = await AccessControl.generateTotp(authenticatorSecret)
    Logger.debug(systemTotp)
  
    if (totp != systemTotp) {
      passedAuth = false;
    }
  }

  const adminEmail = await Application.get("AdminEmail");
  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    passedAuth = false;
  } else {
    passedAuth = passedAuth && true;
  }

  if (passedAuth) {
    // Generate a session ID
    const sessionId = await AccessControl.generateAdminSession()
    return ApiResponse.makeResponse(
      200,
      {
        "success": true,
        sessionId
      }
    );  
  } else {
    return ApiResponse.makeFullErrorResponse(
      "Failed Auth",
      "Login failed"
    );  
  }
};
