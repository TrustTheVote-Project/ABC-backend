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
  if (authenticatorSecret) {
    const systemTotp = AccessControl.generateTotp(authenticatorSecret)
    if (totp != systemTotp) {
      passedAuth = false;
    }
  }

  const adminEmail = await Application.get("AdminEmail");
  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    passedAuth = false;
  } else {
    passedAuth = true;
  }

  Logger.debug(adminEmail)
  Logger.debug(email.toLowerCase())
  
  if (passedAuth) {
    // Generate a session ID
    return ApiResponse.makeResponse(
      200,
      {
        "success": true
      },
      {
        'set-cookie': "sessionId: test"
      }
    );  
  } else {
    return ApiResponse.makeFullErrorResponse(
      "Failed Auth",
      "Login failed"
    );  
  }
};
