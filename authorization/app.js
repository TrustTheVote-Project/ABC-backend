const { Logger, AccessControl } = require("/opt/Common");
const { parseCookie } = require("/opt/util");



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

const extractSessionId = function (cookieStr) {
  const cookieHash = parseCookie(cookieStr);
  return cookieHash['sessionId'];
}

exports.lambdaHandler = async function (event, context, callback) {
  const apiKey = extractAPIKey(event.headers.Authorization);
  const cookieStr = event.headers.cookie;
  const sessionId = extractSessionId(cookieStr)
  const endpoint = event.path.substring(1);
  
  if (await AccessControl.isAllowed(apiKey, sessionId, endpoint)) {
    callback(null, createPolicy("Allow", event.methodArn));
  } else {
    callback(
      null,
      createPolicy("Deny", event.methodArn, {
        info: JSON.stringify(event.requestContext),
      })
    );
  }
};
