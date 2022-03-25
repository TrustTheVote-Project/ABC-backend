const { AccessControl } = require("/opt/Common");

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
  return authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.split(" ")[1]
    : "";
};

exports.lambdaHandler = function (event, context, callback) {
  const apiKey = extractAPIKey(event.headers.Authorization);
  const endpoint = event.path.substring(1);

  if (AccessControl.isAllowed(apiKey, endpoint)) {
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
