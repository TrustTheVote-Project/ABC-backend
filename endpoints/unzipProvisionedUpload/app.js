const {
  Election,
  ApiResponse,
  ApiRequire,
  DocumentInterface,
  unzip
} = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  const requiredArgs = ["key"];
  const messageBody = JSON.parse(event.body);

  if (!ApiRequire.hasRequiredArgs(requiredArgs, messageBody)) {
    return ApiResponse.makeRequiredArgumentsError();
  }

  const { key } = messageBody;

  if (
    process.env.AWS_SAM_LOCAL ||
    process.env.DEPLOYMENT_ENVIRONMENT.startsWith("development")
  ) {
    /*
      Potential Easter Eggs here
    */
  }

  //unzip the file
  try {
    if (!key.endsWith(".zip")) {
      return ApiResponse.makeResponse(200, "OK");
    }


    const result = await unzip(process.env.UPLOAD_BUCKET, key);
    if (result) {
      return ApiResponse.makeResponse(200, "OK");      
    } else {
      console.log(result)
      return ApiResponse.makeFullErrorResponse(
        "file-error",
        "unknown error"
      );
    }
  } catch (err) {
    console.log(err);
    return ApiResponse.makeFullErrorResponse(
      "file-error",
      err
    );
  }
};
