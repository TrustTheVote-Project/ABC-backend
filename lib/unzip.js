const DocumentInterface = require("./documentinterface.js");
const AWS = require("aws-sdk");
const stream = require("stream");
const yauzl = require("yauzl");
const { v4: uuidv4 } = require("uuid");

const uploadStream = ({ Bucket, Key }) => {
  const s3 = new AWS.S3();
  const pass = new stream.PassThrough();
  return {
    writeStream: pass,
    promise: s3.upload({ Bucket, Key, Body: pass }).promise(),
  };
};

const unzip = async (Bucket, uploadKey) => {
  const Key = uploadKey;
  console.log("Starting extraction of zip file:" + Key);
  await DocumentInterface.documentFileUnzippingStart(Key);

  const s3 = new AWS.S3();

  const params = { Bucket, Key };
  const object = await s3.getObject(params).promise();

  const buffer = object.Body;

  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true }, function (err, zipfile) {
      if (err) reject(err);
      zipfile.readEntry();
      zipfile.on("entry", function (entry) {
        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          // skip to the next entry
          zipfile.readEntry();
        } else if (
          /__MACOSX/.test(entry.fileName) ||
          /DS_Store/.test(entry.fileName)
        ) {
          // Mac hidden directory
          // skip to the next entry
          zipfile.readEntry();
        } else {
          // file entry
          zipfile.openReadStream(entry, function (err, readStream) {
            if (err) reject(err);
            const fileNames = entry.fileName.split(".");
            const newKey = `${uploadKey}_files/${uuidv4()}.${
              fileNames[fileNames.length - 1]
            }`;
            const { writeStream, promise } = uploadStream({
              Bucket,
              Key: newKey /*`${fileNames[0]}.${uuidv4()}.${
                fileNames[fileNames.length - 1]
              }`*/,
            });
            readStream.pipe(writeStream);
            promise.then(async () => {
              console.log(entry.fileName + " Uploaded successfully!");
              await DocumentInterface.documentFileUnzipping(
                uploadKey,
                entry.fileName,
                newKey
              );
              zipfile.readEntry();
            });
          });
        }
      });
      zipfile.on("end", async () => {
        await DocumentInterface.documentFileUnzippingComplete(uploadKey);
        resolve("end");
      });
    });
  });
};

exports.unzip = unzip;
