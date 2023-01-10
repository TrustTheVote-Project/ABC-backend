const { Logger, AccessControl, ApiResponse } = require("/opt/Common");

exports.lambdaHandler = async (event, context, callback) => {
  
  AccessControl.deleteAdminSession();
  
  return ApiResponse.makeResponse(
    200,
    {
      "success": true
    },
  );  
  
};
