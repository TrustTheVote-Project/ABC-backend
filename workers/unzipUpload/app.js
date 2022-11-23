const { unzip } = require("/opt/Common");



exports.lambdaHandler = async (event, context, callback) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  
  // Get the object from the event
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );

  try {
    if (!Key.endsWith(".zip")) {
      return {
        status: 200,
        response: "OK",
      };
    }


    const result = await unzip(Bucket, Key);
    //await DocumentInterface.documentFileUnzippingComplete(Key);

    return {
      status: result && 200,
      response: result && "OK",
    };
  } catch (err) {
    console.log(err);
    const message = `Error getting object ${Key} from bucket ${Bucket}. Make sure they exist and your bucket is in the same region as this function.`;
    console.log(message);
    throw new Error(message);
  }
};
