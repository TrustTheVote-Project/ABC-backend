const { Logger, AccessControl } = require("/opt/Common");



const createPolicy = function (effect, urn, context) {
  return {
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: urn,
        },
      ],
    },
    context: context ? context : {},
  };
};

const extractAPIKey = function (authorizationHeader) {
  return authorizationHeader && authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.split(" ")[1]
    : "";
};


exports.lambdaHandler = async function (event, context, callback) {
  const apiKey = extractAPIKey(event.headers.Authorization);
  const sessionId = AccessControl.extractSessionId(event)
  const endpoint = event.path.substring(1);
  
  Logger.debug("Running auth")
  Logger.debug(apiKey)
  Logger.debug(sessionId)
  Logger.debug(endpoint)

  if (await AccessControl.isAllowed(apiKey, sessionId, endpoint)) {
    const policy = createPolicy("Allow", event.methodArn)
    Logger.debug("Auth Allowed")
    Logger.debug(policy)
    callback(null, policy);
  } else {
    Logger.debug("NOT ALLOWED")
    const policy = createPolicy("Deny", event.methodArn, {
      info: JSON.stringify(event.requestContext),
    })
    Logger.debug(policy)
    callback(
      null,
      policy
    );
  }
};
