const DB = require("./db");
const db = new DB();

let tableName = process.env.FILES_TABLE_NAME;
let documentBucket = process.env.ELECTIONS_DOCUMENT_BUCKET;

if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_files_local`;
  documentBucket = ""; //FILES_DOCUMENT_BUCKET
}

const processingStatus = {
  started: "started",
  error: "error",
  complete: "complete",
};

class FileInProcessing {
  static requestType = {
    edfSubmission: "edfSubmission",
    ballotsSubmission: "ballotsSubmission",
    votersFileSubmission: "votersFileSubmission"
  };

  static processingStatus = {
    started: "started",
    error: "error",
    complete: "complete",
  };

  // record attributes
  //
  // fileKey
  // type
  // status
  // started
  // updated

  constructor(attributes) {
    this.attributes = attributes;
  }

  static async findByUUID(uuid) {
    const data = await db.get(
      {
        fileKey: uuid,
      },
      tableName
    );
    return data ? new FileInProcessing(data) : null;
  }

  static async dbIncrementProgress(attributes) {
    const data = await db.put(attributes, tableName);
    return data ? new FileInProcessing(data) : null;
  }

  static async dbQueryProgress(key) {
    return await FileInProcessing.findByUUID(key);
  }

  static async incrementProgress(fileKey, status, message = "", type = false) {
    let ts = Date.now();
    let progressAttributes = {
      fileKey: fileKey,
      updated: ts,
      status: status,
      message: message,
    };
    if (type) {
      progressAttributes.type = type;
    }
    if (status == processingStatus.started) {
      progressAttributes.started = ts;
    }
    console.log(progressAttributes)
    await FileInProcessing.dbIncrementProgress(progressAttributes);

    return true;
  }

  static async startProcessing(key, type) {
    switch (type) {
      // Actual processing TBD

      default:
        return key;
    }
  }

  static async initiate(key, type, status, message) {
    const startProcess = await FileInProcessing.incrementProgress(
      key,
      //processingStatus.started,
      status,
      message,
      type
    ).then(FileInProcessing.startProcessing(key, type));
    return [true, startProcess];
  }
}

exports.FileInProcessing = FileInProcessing;
