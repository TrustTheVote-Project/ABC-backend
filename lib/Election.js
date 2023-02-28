const DB = require("./db");
const { Application } = require("./Application");
const { FileInProcessing } = require("./FileInProcessing.js");
const DocumentInterface = require("./documentinterface.js");
const s3CsvToJson = require("s3-csv-to-json");
const prepareVoterRecord = require("./prepareVoterRecord.js");
const readline = require("readline");
const AWS = require("aws-sdk");
const edfSchema = require("./electionDefinitionSchema.json");
const Ajv = require("ajv");
const { Voter } = require("./Voter");
const { AccessControl } = require("./AccessControl");
const { ApiRequire } = require("./ApiRequire");
const ajv = new Ajv();

let s3 = new AWS.S3({ signatureVersion: "v4" });

const db = new DB();

//const uuid = require("uuid");

let tableName = process.env.ELECTIONS_TABLE_NAME;
let ballotsTableName = process.env.BALLOTS_TABLE_NAME;
let precinctsTableName = process.env.PRECINCTS_TABLE_NAME;
let voterTableName = process.env.VOTERS_TABLE_NAME;
let documentBucket = process.env.ELECTIONS_DOCUMENT_BUCKET;
let uploadBucket = process.env.UPLOAD_BUCKET;
let documentBase;

if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_elections_local`;
  voterTableName = "abc_voters_local";
  // Allow local dev override
  //documentBucket = "";
  //uploadBucket = "";
  documentBase = `https://somewhere.com/docs/`;
}
const dummyConfiguration = {
  stateName: "DemoState",
  stateCode: "DS",
  absenteeStatusRequired: true,
  multipleUsePermitted: true,
  multipleUseNotification: "lorem ipsum",
  affidavitOfferSignatureViaPhoto: true,
  affidavitOfferSignatureViaName: true,
  affidavitRequiresWitnessName: true,
  affidavitRequiresWitnessSignature: true,
  affidavitRequiresDLIDcardPhotos: true,
  DLNminLength: 6,
  DLNmaxLength: 6,
  DLNalpha: true,
  DLNnumeric: true,
  DLNexample: "C46253",
  linkAbsenteeRequests: "http://absenteerequest.tbd.com",
  linkVoterReg: "http://voterreg.tbd.com",
  linkBallotReturn: "http://ballotreturn.tbd.com",
  linkMoreInfo1: "http://misc1.tbd.com",
  linkMoreInfo2: "http://misc2.tbd.com",
};

const affidavitFile = "blank_affidavit.pdf";
const defaultTestPrintFile = "MarkitTestPrintPage.pdf";

const validate = (predicate, message, valid, messageArray) =>
  predicate
    ? [true && valid, messageArray]
    : [false, [...messageArray, message]];

class Election {
  static servingStatus = {
    closed: "closed",
    open: "open",
    lookup: "lookup",
  };

  static electionStatus = {
    /*
    pending: "pending",
    test: "test",
    live: "live",
    complete: "complete",
    archived: "archived",
    */
    draft: "draft",
    inactive: "inactive",
    lookup: "lookup",
    open: "open",
    closed: "closed",
    archived: "archived",
  };

  static consumerProperties = [
    "electionId",
    "electionJurisdictionName",
    "electionName",
    "electionVotingStartDate",
    "electionVotingEndDate",
    "electionDefinitionURL",
    "electionStatus",

    //CTW: 2023-01-23:  I don't think these are needed for the consumer
    "servingStatus",
    "electionDate",
    "testCount",
    //"electionLink",
  ];

  static objectProperties = [
    "electionId",
    "electionJurisdictionName",
    "electionName",
    "electionStatus",
    "electionDate",
    //"electionLink",
    "electionVotingStartDate",
    "electionVotingEndDate",
    "configurations",

    "electionDefinitionURL",

    "edfSet",
    "ballotsSet",
    "testVotersSet",
    "votersSet",

    "ballotCount",

    "latMode",

    "testVoterCount",
    "voterCount",
    "testCount",
    "testComplete",

    // Check how admin is using these?
    "ballotsFile",
    "votersFile",
    "electionDefinitionFile",

    //depricate in favor of wizard workflow?
    "servingStatus",
    "configStatus",

    //check if used; depricate
    "ballotDefinitionCount",
    "ballotDefinitions",
    "testPrintPageFilename",
  ];

  static defaultAttributes = {
    voterCount: 0,
    testVoterCount: 0,
    ballotDefinitionCount: 0,
    ballotCount: 0,
    electionStatus: this.electionStatus.draft,
    //configStatus: "incomplete",
    //servingStatus: this.servingStatus.closed,
    edfSet: false,
    ballotsSet: false,
    votersSet: false,
    testVotersSet: false,
    testComplete: false,
    latMode: 0,
    configurations: `{
      "DLNnumeric": true,
    }`,
  };

  static noElectionResponse = {
    statusCode: 400,
    body: JSON.stringify(
      {
        error_type: "no_election",
        error_description: `No current election`,
      },
      null,
      2
    ),
  };

  /*static filterProperties(attributes, master) {
    return Object.keys(attributes)
      .filter((key) => master.includes(key))
      .reduce((obj, key) => {
        obj[key] = attributes[key];
        return obj;
      }, {});
  }
  */

  static parseJSON = async (bucket, key) => {
    const s3Config = {
      Bucket: bucket,
      Key: key,
    };

    const readFile = new Promise((resolve, reject) => {
      s3.getObject(s3Config, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          console.log("Error reading EDF file");
          resolve();
        } else {
          try {
            var txt = data.Body.toString("ascii");
            var json = JSON.parse(txt);
            resolve(json);
          } catch (err) {
            console.log(err.message);
            console.log("Error parsing EDF as JSON");
            resolve();
          }
        }
      });
    });
    return await readFile;
  };

  static validateEDF = async (edfJSON) => {
    const validate = new Promise((resolve, reject) => {
      try {
        //const schema = require("./electionDefinitionSchema.json");
        const schema = edfSchema;
        const validate = ajv.compile(schema);
        const valid = validate(edfJSON);
        if (valid) {
          resolve([true, ""]);
        } else {
          console.log("EDF validation failed");
          console.log(validate.errors);
          resolve([false, validate.errors.join(",")]);
        }
      } catch (err) {
        console.log(err.message);
        console.log("Error validating EDF");
        resolve([false, err.message]);
      }
    });
    return await validate;
  };

  static validateEDFSemantics = async (edfJSON) => {
    const ballots = edfJSON.Election[0].BallotStyle.map((ballotStype) => ({
      ballotId: ballotStype.ExternalIdentifier[0].Value,
      GpUnitIds: ballotStype.GpUnitIds,
    }));
    const indexedBallots = ballots.reduce((collection, ballot) => {
      ballot.GpUnitIds.forEach((gpUnitId) => {
        collection[gpUnitId] = ballot.ballotId;
      });
      return collection;
    }, {});
    const precincts = edfJSON.GpUnit.filter(
      (gpUnit) => gpUnit.Type === "precinct"
    );

    const precinctIds = precincts.map((precinct) => precinct["@id"]);

    const gpUnitIds = edfJSON.GpUnit.map((gpUnit) => gpUnit["@id"]);

    const nonPrecinctDistricts = edfJSON.GpUnit.filter(
      (gpUnit) => gpUnit.Type != "district"
    );
    const contests = edfJSON.Election[0].Contest;

    const ballotForEveryPrecinct = precincts.every(
      (precinct) => indexedBallots[precinct["@id"]] != null
    );

    const ballotsHaveOnlyOnePrecinct = ballots.every(
      (ballot) => ballot.GpUnitIds.length == 1
    );

    const gpUnitForEveryContest = contests.every((contest) =>
      gpUnitIds?.includes(contest.ElectionDistrictId)
    );

    let valid = true,
      messageArray = [];

    [valid, messageArray] = validate(
      ballots.length > 0,
      "No ballots",
      valid,
      messageArray
    );
    [valid, messageArray] = validate(
      precincts.length > 0,
      "No precincts",
      valid,
      messageArray
    );

    [valid, messageArray] = validate(
      nonPrecinctDistricts.length > 0,
      "No non-precinct districts",
      valid,
      messageArray
    );

    [valid, messageArray] = validate(
      gpUnitForEveryContest,
      "No GpUnit matching contest electionDistrict",
      valid,
      messageArray
    );

    [valid, messageArray] = validate(
      contests.length > 0,
      "No contests",
      valid,
      messageArray
    );

    [valid, messageArray] = validate(
      ballotsHaveOnlyOnePrecinct,
      "Ballot has more than one precinct",
      valid,
      messageArray
    );

    [valid, messageArray] = validate(
      ballotForEveryPrecinct,
      "Ballot not defined for every precinct",
      valid,
      messageArray
    );

    return [valid, messageArray.join(","), ballots, indexedBallots, precincts];
  };

  static filterProperties(attributes, master) {
    return Object.keys(attributes)
      .filter((key) => master.includes(key))
      .reduce((obj, key) => {
        obj[key] = attributes[key];
        return obj;
      }, {});
  }

  static filterNullExtendProperties(
    attributes,
    master = Election.objectProperties
  ) {
    return master.reduce((obj, key) => {
      obj[key] = attributes[key] != null ? attributes[key] : null;
      return obj;
    }, {});
  }

  static insureProperAttributeFormat(attributes) {
    const formattedAttribtues = {};
    for (const key in attributes) {
      switch (key) {
        case "electionDate":
        case "electionVotingStartDate":
        case "electionVotingEndDate":
          formattedAttribtues[key] = attributes[key].split("T")[0];
          break;
        case "latMode":
          formattedAttribtues[key] = attributes[key]
            ? parseInt(attributes[key])
            : 0;
        default:
          formattedAttribtues[key] = attributes[key];
          break;
      }
    }
    return formattedAttribtues;
  }
  static filterConsumerProperties(attributes, latMode = 0) {
    const preparedAttributes = Election.insureProperAttributeFormat(attributes);
    if (latMode) {
      preparedAttributes["electionStatus"] = Election.electionStatus.open;
    }
    return this.filterNullExtendProperties(
      preparedAttributes,
      Election.consumerProperties
    );
  }

  static filterAdminProperties(attributes, latMode = 0) {
    const preparedAttributes = Election.insureProperAttributeFormat(attributes);

    return this.filterNullExtendProperties(
      preparedAttributes,
      Election.objectProperties
    );
  }

  static filterObjectProperties(attributes) {
    return this.filterProperties(attributes, Election.objectProperties);
  }

  constructor(attributes, admin = false) {
    this.allAttributes = attributes;
    if (admin) {
      this.attributes = attributes;
    } else {
      this.attributes = Election.filterConsumerProperties(attributes);
    }
    //Temporary set EDF URL
    this.allAttributes["electionDefinitionURL"] = Election.generateURL(
      this.allAttributes["electionId"] + "_edf.json"
    );
    this.attributes["electionDefinitionURL"] =
      this.allAttributes["electionDefinitionURL"];
  }

  static docBaseURL = documentBase; //"https://somewhere.com/";
  static dummyBallotDefinition = { Lots: "Interesting JSON or XML" };

  static async all() {
    const data = await db.getAll(null, tableName);
    if (data && data.Items) {
      return data.Items.map((dataItem) => new Election(dataItem));
    } else {
      return [];
    }
  }

  static async findByElectionId(electionId) {
    const data = await db.get(
      {
        electionId: electionId,
      },
      tableName
    );

    return data ? new Election(data, true) : null;
  }

  static async currentElection(latMode) {
    const electionId = await Application.get("currentElectionId");

    if (electionId) {
      const election = await Election.findByElectionId(electionId);
      if (latMode == 1) {
        if (election && election.attributes.latMode == latMode) {
          return election;
        } else {
          return false;
        }
      }
      return election;
    } else {
      return false;
    }
  }

  static respondIfNoElection() {
    if (!this.currentElection()) {
      return noElectionResponse;
    }
  }

  static initDefaults(attributes, id) {
    return Object.assign(
      {},
      { electionId: id },
      this.defaultAttributes,
      attributes
    );
  }

  static async create(attributes, id) {
    attributes = Election.filterObjectProperties(attributes);
    attributes = this.initDefaults(attributes, id);
    attributes = Election.insureProperAttributeFormat(attributes);
    const data = await db.put(attributes, tableName);
    return data ? new Election(attributes, true) : null;
  }

  async update(attributes) {
    attributes = Election.filterObjectProperties(attributes);
    attributes = Election.insureProperAttributeFormat(attributes);
    delete attributes.electionId;
    const newAttributes = await db.update(
      attributes,
      { electionId: this.attributes.electionId },
      tableName
    );
    this.attributes = newAttributes;
    return this;
  }

  configurations() {
    if (this.allAttributes) {
      return JSON.parse(this.allAttributes.configurations);
    }
  }

  /* async electionDefinition() {
    if (this.allAttributes && this.allAttributes.electionDefinitionFile) {
      console.log("Retrieving file");
      const [success, response] = await DocumentInterface.getFile(
        uploadBucket,
        this.allAttributes.electionDefinitionFile
      );

      if (success) {
        //To do check the status of this EDF first?
        //Currently not...
        return JSON.parse(response.Body.toString("ascii"));
      } else {
        console.log("Failed");
        return {};
      }
    } else {
      return {};
    }
  }
  */

  static generateURL(filename) {
    const contentType = filename.endsWith("json")
      ? "application/json"
      : "application/pdf";
    if (documentBucket) {
      return DocumentInterface.getSignedUrl(
        documentBucket,
        filename,
        60 * 30,
        "inline;",
        contentType
      );
    } else {
      return Election.docBaseURL + filename;
    }
  }

  async startEDFSubmission(
    fileKey,
    data,
    status = "started",
    errorMessage = ""
  ) {
    const [success, message] = await DocumentInterface.createFile(
      uploadBucket,
      fileKey,
      data
    );
    if (success) {
      const [processSuccess, processingMessage] =
        await FileInProcessing.initiate(
          fileKey,
          "edfSubmission",
          status,
          errorMessage
        );
      if (processSuccess) {
        return [true, ""];
      } else {
        return [false, processingMessage];
      }
    } else {
      return [false, message];
    }
  }

  async initiateEDFSubmission(fileKey, status = "started", errorMessage = "") {
    const [success, message] = await DocumentInterface.getFile(
      documentBucket,
      fileKey
    );
    if (success) {
      const [processSuccess, processingMessage] =
        await FileInProcessing.initiate(
          fileKey,
          FileInProcessing.requestType.edfSubmission,
          status,
          errorMessage
        );
      if (processSuccess) {
        return [true, ""];
      } else {
        return [false, processingMessage];
      }
    } else {
      return [false, message];
    }
  }

  async queryTableByIndex(tableName, index, key, indexValue) {
    const data = await db.queryIndex(
      {
        ":indexValue": indexValue,
      },
      tableName,
      index,
      key + "=:indexValue"
    );
    return data;
  }

  async getAllBallots() {
    const records = await this.queryTableByIndex(
      ballotsTableName,
      "electionId-index",
      "electionId",
      this.allAttributes["electionId"]
    );
    //console.log(records);
    return records;
  }

  async getAllIndexedBallots() {
    const ballots = await this.getAllBallots();
    const indexedBallots = {};
    ballots?.forEach((ballot) => {
      indexedBallots[ballot.ballotId] = ballot;
    });
    return indexedBallots;
  }
  async getAllPrecincts() {
    const records = await this.queryTableByIndex(
      precinctsTableName,
      "electionId-index",
      "electionId",
      this.allAttributes["electionId"]
    );
    return records;
  }

  async getAllIndexedPrecincts() {
    const precincts = await this.getAllPrecincts();
    const indexedPrecincts = {};
    precincts?.forEach((precinct) => {
      indexedPrecincts[precinct.precinctId] = precinct;
    });
    return indexedPrecincts;
  }

  async removeBallotsAndPrecincts() {
    const ballots = await this.getAllBallots();
    const precincts = await this.getAllPrecincts();
    const ballotIdProps = ballots?.map((ballot) => ({
      electionId_ballotId: ballot.electionId_ballotId,
    }));
    const precinctIdProps = precincts?.map((precinct) => ({
      electionId_precinctId: precinct.electionId_precinctId,
    }));

    await db.batchDelete(ballotIdProps, ballotsTableName);
    await db.batchDelete(precinctIdProps, precinctsTableName);
  }

  async updateBallotsAndPrecincts(ballots, indexedBallots, precincts) {
    const ballotsForDB = ballots?.map((ballot) => ({
      electionId_ballotId: this.attributes.electionId + "_" + ballot.ballotId,
      ballotId: ballot.ballotId,
      electionId: this.attributes.electionId,
    }));
    const precinctsForDB = precincts?.map((precinct) => ({
      electionId_precinctId:
        this.attributes.electionId + "_" + precinct.precinctId,
      precinctId: precinct.precinctId,
      electionId: this.attributes.electionId,
    }));

    await this.removeBallotsAndPrecincts();
    await db.batchPut(ballotsForDB, ballotsTableName);
    await db.batchPut(precinctsForDB, precinctsTableName);

    await this.update({
      ballotDefinitionCount: ballots.length,
    });
  }

  async setElectionDefinition(objectId, documentState) {
    if (this.allAttributes["edfSet"]) {
      return [false, "EDF has already been set for this election"];
    }

    if (documentState["fileCount"] != 1) {
      return [false, "EDF should have exactly one file"];
    }

    await FileInProcessing.initiate(
      objectId,
      FileInProcessing.requestType.edfSubmission,
      FileInProcessing.processingStatus.started,
      "EDF initiated for electionId: " + this.attributes.electionId
    );

    const edfJSON = await Election.parseJSON(
      uploadBucket,
      Object.values(documentState["files"])[0]
    );
    if (!edfJSON) {
      return [false, "EDF is not a valid JSON file"];
    }

    // Note: the failures below should be reflected inthe status of the file in processing
    // Not doing that now because we're not support async running of these processes currently
    let valid, errorMsg;

    let ballots, indexedBallots, precincts;

    [valid, errorMsg] = await Election.validateEDF(edfJSON);
    if (!valid) {
      return [false, "EDF is not a valid EDF file. Error:" + errorMsg];
    }

    [valid, errorMsg, ballots, indexedBallots, precincts] =
      await Election.validateEDFSemantics(edfJSON);
    if (!valid) {
      return [false, "EDF fails semantic tests. Error(s):" + errorMsg];
    }

    await this.updateBallotsAndPrecincts(ballots, indexedBallots, precincts);

    await this.update({
      electionDefinitionFile: objectId,
    });

    /*
      Alex's previous meta data extraction code

      const s3Config = {
        Bucket: uploadBucket,
        Key: Object.values(documentState["files"])[0],
      };

      const readFile = new Promise((resolve, reject) => {
        s3.getObject(s3Config, (err, data) => {
          if (err) {
            console.log(err, err.stack);
            resolve();
          } else {
            try {
              var txt = data.Body.toString("ascii");
              var json = JSON.parse(txt);
              var ballotStyleCount = json["Election"][0]["BallotStyle"].length;
              this.update({
                ballotDefinitionCount: ballotStyleCount,
              }).then(() => {
                resolve();
              });
            } catch (err) {
              console.log(err.message);
              console.log("error parsing EDF text");
              resolve();
            }
          }
        });
      });
      await readFile;
      */

    const [success, message] = await DocumentInterface.copyFile(
      uploadBucket,
      documentBucket,
      Object.values(documentState["files"])[0],
      this.allAttributes["electionId"] + "_edf.json"
    );
    if (success) {
      await FileInProcessing.incrementProgress(
        objectId,
        FileInProcessing.processingStatus.complete.toString(),
        "EDF loaded to electionId: " + this.attributes.electionId,
        "edfSubmission"
      );
      await this.update({ edfSet: true });

      return [true, ""];
    } else {
      return [false, message];
    }
  }

  validateSingleVoterRecord(voterRecord, indexedBallots, recordNumber) {
    let valid = true,
      messageArray = [];

    console.log("Validatign voter record: " + JSON.stringify(voterRecord));

    const validBallot =
      typeof indexedBallots[voterRecord["ballotID"]] !== "undefined";

    const hasRequiredFields = Voter?.requiredPropertiesForImport.every(
      (property) => typeof voterRecord[property] !== "undefined"
    );

    [valid, messageArray] = validate(
      hasRequiredFields,
      "Voter record missing required properties. Record: " + recordNumber,
      valid,
      messageArray
    );

    [valid, messageArray] = validate(
      validBallot,
      "Invalid ballotID for record: " +
        recordNumber +
        " ballotID:" +
        voterRecord["ballotID"],
      valid,
      messageArray
    );

    return [valid, messageArray.join(", ")];
  }

  async validateVoterRecords(voterRecordsS3) {
    const s3Config = {
      Bucket: uploadBucket,
      Key: voterRecordsS3,
    };

    const indexedBallots = await this.getAllIndexedBallots();

    let valid, message;

    const s3ReadStream = s3.getObject(s3Config).createReadStream();

    const rl = readline.createInterface({
      input: s3ReadStream,
      terminal: false,
    });
    let recordNumber = 0;

    let myReadPromise = new Promise((resolve, reject) => {
      rl.on("line", async (line) => {
        recordNumber++;
        [valid, message] = await this.validateSingleVoterRecord(
          JSON.parse(line),
          indexedBallots,
          recordNumber
        );
        if (!valid) {
          console.log("Invalid voter record: " + recordNumber + "; " + message);
          message += "; recordNumber: " + recordNumber;
          reject("Invalid voter record: " + recordNumber + "; " + message);
        }
      });
      rl.on("error", () => {
        //Should we reject the promise here?
        console.log("error parsing record: " + recordNumber);
        reject("Error parsing record: " + recordNumber);
      });
      rl.on("close", () => {
        console.log("closed");
        resolve();
      });
    });

    try {
      await myReadPromise;
    } catch (err) {
      console.log("an error has occurred");
      return [false, err];
    }

    console.log("done reading!");
    return [valid, message];
  }

  async insertVoterRecord(record) {
    return await db.put(record, voterTableName);
  }

  async loadVoterRecords(voterRecordsS3, latMode = 0) {
    const s3Config = {
      Bucket: uploadBucket,
      Key: voterRecordsS3,
    };
    return await this.loadRecords(s3Config, latMode);
  }

  /*
  async loadRecords(s3Config) {
    return new Promise((resolve, reject) => {
      console.log("File read from S3.");
      //let records = [];
      let recordCount = 0;
      try {
        let readStream = S3.getObject(s3Config).createReadStream();
        let lineReader = readLine.createInterface({ input: readStream });
        lineReader
          .on("line", (line) => {
            console.log(line);
            try {
              if (line && typeof line == "string") {
                records.push(JSON.parse(line));
              }
            } catch (e) {
              console.log("Error parsing line: " + line);
            }
            //await this.insertVoterRecord(JSON.parse(line));
            recordCount += 1;
          })
          .on("close", () => {
            console.log("Finished processing S3 file.");
            //resolve [true, `Imported ${recordCount} records.`];
            resolve(records);
          });
      } catch (err) {
        console.log("Error: ", err);
        reject(err);
        //resolve [false, err];
      }
    });
  }
  */

  prepareVoterRecordForDB = (record, latMode = 0) => {
    record["LAT"] = latMode;
    record["electionId"] = this.allAttributes["electionId"];
    record["completedN"] = "0";
    record["incompletedN"] = "0";
    const dbRecord = prepareVoterRecord(record);

    return dbRecord;
  };

  async loadRecords(s3Config, latMode = 0) {
    const s3ReadStream = s3.getObject(s3Config).createReadStream();

    const rl = readline.createInterface({
      input: s3ReadStream,
      terminal: false,
    });
    let voterCount = 0;

    let myReadPromise = new Promise((resolve, reject) => {
      rl.on("line", async (line) => {
        await this.insertVoterRecord(
          this.prepareVoterRecordForDB(JSON.parse(line), latMode)
        );
        voterCount += 1;
        // CTW: Don't like this
        if (latMode) {
          await this.update({
            testVoterCount: voterCount ?? 0,
          });
        } else {
          await this.update({
            voterCount: voterCount ?? 0,
          });
        }

        /*
        To discuss w/ Alex:  not doing this incrementally
        Also could be wrong, because these could be updates, not inserts

        voterCount += 1;
        if (latMode) {
          await this.update({
            testVoterCount: voterCount,
          });
        } else {
          await this.update({
            voterCount,
          });
        }
        */
      });
      rl.on("error", () => {
        //Should we reject the promise here?
        console.log("error");
      });
      rl.on("close", () => {
        console.log("closed");
        resolve();
      });
    });

    try {
      await myReadPromise;
    } catch (err) {
      console.log("an error has occurred");
      return [false, err];
    }

    console.log("done reading!");
    return [true, "done reading"];
  }

  async setElectionVoters(objectId, documentState, latMode = 0) {
    if (documentState["fileCount"] != 1) {
      return [false, "Multiple files uploaded"];
    }
    if (
      !Object.values(documentState["files"])[0].toLowerCase().endsWith(".csv")
    ) {
      return [false, "File is not a CSV"];
    }

    await FileInProcessing.initiate(
      objectId,
      FileInProcessing.requestType.votersFileSubmission.toString(),
      FileInProcessing.processingStatus.started.toString(),
      "Voter File Processing initiated for electionId: " +
        this.attributes.electionId
    );
    await this.update({
      votersFile: objectId,
    });

    const s3Key = Object.values(documentState["files"])[0];
    const s3OutputKey = s3Key + ".json";
    const input = "s3://" + uploadBucket + "/" + s3Key;
    const output = "s3://" + uploadBucket + "/" + s3OutputKey;

    const response = await s3CsvToJson({
      input: input,
      output: output,
    });

    if (!response) {
      await FileInProcessing.incrementProgress(
        objectId,
        FileInProcessing.processingStatus.error.toString(),
        "Error converting file to JSON",
        FileInProcessing.requestType.votersFileSubmission.toString()
      );
      return [false, "Error converting file to JSON"];
    }

    console.log("File converted.  Attempting to load JSON records");

    let success, message;

    [success, message] = await this.validateVoterRecords(s3OutputKey, latMode);

    if (!success) {
      await FileInProcessing.incrementProgress(
        objectId,
        FileInProcessing.processingStatus.failedValidation.toString(),
        message,
        FileInProcessing.requestType.votersFileSubmission.toString()
      );
      return [false, message];
    }

    [success, message] = await this.loadVoterRecords(s3OutputKey, latMode);

    if (!success) {
      await FileInProcessing.incrementProgress(
        objectId,
        FileInProcessing.processingStatus.error.toString(),
        message,
        FileInProcessing.requestType.votersFileSubmission.toString()
      );
      return [false, message];
    }

    //success

    await FileInProcessing.incrementProgress(
      objectId,
      FileInProcessing.processingStatus.complete.toString(),
      "Voters loaded to electionId: " + this.attributes.electionId,
      FileInProcessing.requestType.votersFileSubmission.toString()
    );
    await this.update({
      votersFile: null,
    });

    if (latMode) {
      await this.update({ testVotersSet: true });
    } else {
      await this.update({ votersSet: true });
    }

    // *************************************************************************
    // TODO:  Delete the original file and the converted file from S3
    // Now that voters have been added, all associated files in the upload bucket should be deleted.
    // Original zip  -- objectId
    // Extracted csv -- input
    // Converted json -- output
    //
    // objectId may be the same as input if the zip was not used.
    //
    // As these contain PII, they should be deleted as soon as they are no longer needed.

    await DocumentInterface.deleteFile(objectId);
    await DocumentInterface.deleteFile(s3Key);
    await DocumentInterface.deleteFile(s3OutputKey);

    return [true, JSON.stringify(response)];
  }

  async validateBallots(objectId, documentState) {
    let valid = true,
      messageArray = [];

    const notBallotsSet = !this.allAttributes["ballotsSet"];

    const edfBallots = await this.getAllBallots();
    const edfBallotIds = edfBallots?.map((ballot) => ballot["ballotId"]);
    const uploadedBallots = Object.keys(documentState["files"]);
    const uploadedCount = uploadedBallots.length;
    const ballotsMatch = edfBallotIds?.every((ballotId) =>
      uploadedBallots.includes(ballotId + ".pdf")
    );

    const allFilesArePDF = uploadedBallots?.every((ballot) =>
      ballot.toLowerCase().endsWith(".pdf")
    );

    [valid, messageArray] = validate(
      notBallotsSet,
      "Ballots have already been set",
      valid,
      messageArray
    );

    [valid, messageArray] = validate(
      edfBallots.length == uploadedCount,
      "Ballot count does not match EDF ballot count",
      valid,
      messageArray
    );
    console.log([valid, messageArray]);

    [valid, messageArray] = validate(
      allFilesArePDF,
      "Uploaded ballot files are not all PDFs",
      valid,
      messageArray
    );

    [valid, messageArray] = validate(
      ballotsMatch,
      "Uploaded ballot filenames do not match EDF ballot IDs",
      valid,
      messageArray
    );

    return [valid, messageArray.join(",")];
  }
  async copyBallots(documentState) {
    let functionSuccess = true,
      functionMessage = "",
      ballotsUploaded = 0;
    for (const key in documentState["files"]) {
      const value = documentState["files"][key];
      const [success, message] = await DocumentInterface.copyFile(
        uploadBucket,
        documentBucket,
        value,
        this.allAttributes["electionId"] + "_" + key
      );
      functionSuccess = functionSuccess && success;
      functionMessage = functionMessage + message + " ";
      ballotsUploaded += 1;
    }
    return functionSuccess, functionMessage;
  }

  async setElectionBallots(objectId, documentState) {
    await FileInProcessing.initiate(
      objectId,
      FileInProcessing.requestType.ballotsSubmission.toString(),
      FileInProcessing.processingStatus.started.toString(),
      "Ballot File initiated for electionId: " + this.attributes.electionId
    );

    await this.update({
      ballotsFile: objectId,
    });

    let success, message;

    [success, message] = await this.validateBallots(objectId, documentState);

    if (!success) {
      await FileInProcessing.incrementProgress(
        objectId,
        FileInProcessing.processingStatus.failedValidation.toString(),
        message
      );
      return [false, message];
    }

    [success, message] = await this.copyBallots(documentState);

    if (success) {
      console.log(documentState);
      await this.update({
        ballotsSet: true,
        ballotCount: documentState["fileCount"],
      });
      await FileInProcessing.incrementProgress(
        objectId,
        FileInProcessing.processingStatus.complete.toString(),
        "Ballots loaded to electionId: " + this.attributes.electionId
      );
      return [true, ""];
    } else {
      await FileInProcessing.incrementProgress(
        objectId,
        FileInProcessing.processingStatus.error.toString(),
        "Ballots failed for electionId: " + this.attributes.electionId
      );
      return [false, message];
    }
  }

  affidavitTemplateURL() {
    if (this.attributes) {
      return Election.generateURL(affidavitFile);
    }
  }

  electionDefinitionURL() {
    if (this.attributes) {
      return this.allAttributes["electionDefinitionURL"];
      //return Election.generateURL(this.allAttributes.electionDefinitionFile);
    }
  }

  testPrintPageURL() {
    if (this.attributes) {
      return Election.generateURL(
        this.attributes["testPrintPageFilename"]
          ? this.attributes["testPrintPageFilename"]
          : defaultTestPrintFile
      );
    }
  }

  blankBallotURL(voter) {
    if (this.attributes) {
      let ballotFile = this.attributes["electionId"]
        .toLowerCase()
        .replace(/\s/g, "_");
      ballotFile += "_" + voter.attributes["ballotID"] + ".pdf";
      return Election.generateURL(ballotFile);
    }
  }

  lookupAllowed(latMode) {
    const electionStatus = this.allAttributes?.["electionStatus"];
    const electionLatMode = this.allAttributes?.["latMode"];
    return (
      // Election is in lookup or open
      [Election.electionStatus.lookup, Election.electionStatus.open].includes(
        electionStatus
      ) ||
      // latMode client and the election is currently being tested
      (latMode && electionLatMode)
    );
  }

  openFunctionsAllowed(latMode) {
    const electionStatus = this.allAttributes?.["electionStatus"];
    const electionLatMode = this.allAttributes?.["latMode"];

    return (
      //Election is open
      (Election.electionStatus.open = electionStatus) ||
      // latMode client and the election is currently being tested
      (latMode && electionLatMode)
    );
  }

  static async appEndpointWorkflowAllowed(
    endpoint,
    election = false,
    latMode = 0
  ) {
    const apiEndpoint = AccessControl.apiEndpoint;
    switch (endpoint) {
      case apiEndpoint.getCurrentElection:
        return [true, "No workflow constraint specified"];
        break;
      case apiEndpoint.lookupVoterByAddress:
      case apiEndpoint.lookupVoterByIDnumber:
      case apiEndpoint.lookupVoterBySSN4:
      case apiEndpoint.lookupVoterEmail:
      case apiEndpoint.getAffidavitTemplate:
      case apiEndpoint.getConfigurations:
        if (!election) {
          return [false, "No current election"];
        } else if (election.lookupAllowed(latMode)) {
          return [true, "Lookup functions allowed"];
        } else {
          return [
            false,
            endpoint +
              " not allowed for election:" +
              election.allAttributes?.["name"],
          ];
        }
        break;

      case apiEndpoint.getElectionDefinition:
      case apiEndpoint.getBlankBallot:
      //case apiEndpoint.getBallotDefinition:
      case apiEndpoint.postBegin:
      case apiEndpoint.postComplete:
      case apiEndpoint.postIncomplete:
        if (!election) {
          return [false, "No current election"];
        } else if (election.openFunctionsAllowed(latMode)) {
          return [true, "Open election functions allowed"];
        } else {
          return [
            false,
            endpoint +
              " not allowed for election:" +
              election.allAttributes?.["name"],
          ];
        }

      //Deprecated
      //case apiEndpoint.getBallotDefinition:
      //case apiEndpoint.getTestPrintPage:

      case apiEndpoint.getElection:

      default:
        return [true, "No workflow constraint specified"];
    }
  }

  static singleTest(endpoint, election, errorCondition, message = "") {
    if (errorCondition) {
      return [
        false,
        endpoint +
        " not allowed for election" +
        election.allAttributes?.["name"] +
        message
          ? ":" + message
          : "",
      ];
    } else {
      return [
        true,
        endpoint + " allowed for election" + election.allAttributes?.["name"],
      ];
    }
  }

  static testCondition(
    endpoint,
    election = false,
    errorCondition,
    message = ""
  ) {
    if (!election) {
      return [false, "Election not found"];
    } else {
      return Election.singleTest(endpoint, election, errorCondition, message);
    }
  }

  static testConditions(endpoint, election = false, conditions = []) {
    let pass = true,
      testResponse = "";

    if (!election) {
      return [false, "Election not found"];
    }

    conditions.forEach(([errorCondition, message]) => {
      [pass, testResponse] = Election.singleTest(
        endpoint,
        election,
        errorCondition,
        message
      );
      if (!pass) {
        return [pass, testResponse];
      }
    });
    return [pass, testResponse];
  }

  static async liveCurrentElection() {
    const currentElection = await Election.currentElection();
    return currentElection
      ? currentElection.allAttributes?.["electionStatus"] ==
          Election.electionStatus.open ||
          currentElection.allAttributes?.["latMode"] == 1
      : false;
  }

  static async adminEndpointWorkflowAllowed(endpoint, election = false) {
    const apiEndpoint = AccessControl.apiEndpoint;
    const electionAttributes = election?.allAttributes;

    const currentElection = await Election.currentElection();
    const liveCurrentElection = await Election.liveCurrentElection();
    const isCurrentElection =
      election &&
      currentElection &&
      election.electionId == currentElection.electionId;

    switch (endpoint) {
      case apiEndpoint.createElection:
        return [true, "No workflow constraint specified"];
        break;

      case apiEndpoint.setElectionConfigurations:
      case apiEndpoint.provisionUpload:
        return Election.testCondition(endpoint, election, false);
        break;
      case apiEndpoint.setElectionAttributes:
        return Election.testConditions(endpoint, election, [
          [
            electionAttributes?.["testComplete"],
            "Election cannot be edited after testing complete.",
          ],
        ]);

      case apiEndpoint.setElectionDefinition:
        return Election.testCondition(
          endpoint,
          election,
          electionAttributes?.["edfSet"],
          "EDF already set."
        );
      case apiEndpoint.setElectionBallots:
        return Election.testConditions(endpoint, election, [
          [!electionAttributes?.["edfSet"], "EDF not set."],
          [electionAttributes?.["ballotsSet"], "Ballots already set."],
        ]);
        break;

      case apiEndpoint.setElectionTestVoters:
        return Election.testConditions(endpoint, election, [
          [!electionAttributes?.["ballotsSet"], "Ballots not set."],
          [electionAttributes?.["testComplete"], "Testing is complete."],
        ]);

      case apiEndpoint.setCurrentElection:
        return Election.testConditions(endpoint, election, [
          [liveCurrentElection, "Current election is in a live state"],
        ]);

      case apiEndpoint.openElectionTest:
        return Election.testConditions(endpoint, election, [
          [!isCurrentElection, "Election is not current election."],
          [!electionAttributes?.["testVotersSet"], "Test voters not set."],
          [electionAttributes?.["testComplete"], "Testing is complete."],
          [
            electionAttributes?.["latMode"] == 1,
            "Election is already in test mode.",
          ],
        ]);
      case apiEndpoint.closeElectionTest:
        return Election.testConditions(endpoint, election, [
          [!isCurrentElection, "Election is not current election."],
          [
            electionAttributes?.["latMode"] != 1,
            "Election is not in test mode.",
          ],
        ]);
      case apiEndpoint.setElectionTestComplete:
        return Election.testConditions(endpoint, election, [
          [!isCurrentElection, "Election is not current election."],
          [
            electionAttributes?.["latMode"] == 1,
            "Election is still in test mode.",
          ],
          [
            electionAttributes?.["testCount"] < 1,
            "Election has not been tested.",
          ],
        ]);
      case apiEndpoint.setElectionVoters:
        return Election.testConditions(endpoint, election, [
          [
            !electionAttributes?.["testComplete"],
            "Election testing is not complete",
          ],
          [
            electionAttributes?.["electionStatus"] ==
              Election.electionStatus.archived,
            "Election has been archived.",
          ],
        ]);

      case apiEndpoint.openElectionLookup:
        return Election.testConditions(endpoint, election, [
          [!isCurrentElection, "Election is not current election."],
          [
            !electionAttributes?.["testComplete"],
            "Election testing is not complete",
          ],
          [
            !electionAttributes?.["votersSet"],
            "Election voters have not been set.",
          ],
        ]);

      case apiEndpoint.openElection:
        return Election.testConditions(endpoint, election, [
          [!isCurrentElection, "Election is not current election."],
          [
            !electionAttributes?.["testComplete"],
            "Election testing is not complete",
          ],
          [
            !electionAttributes?.["votersSet"],
            "Election voters have not been set.",
          ],
        ]);
      case apiEndpoint.closeElection:
        return Election.testConditions(endpoint, election, [
          [!isCurrentElection, "Election is not current election."],
          [
            !electionAttributes?.["electionStatus"] ==
              Election.electionStatus.open,
            "Election is not open",
          ],
        ]);
      default:
        return [true, "No workflow constraint specified"];
    }
  }

  static async endpointWorkflowAllowed(
    endpoint,
    election = false,
    latMode = 0
  ) {
    if (AccessControl.adminEndpoints.includes(endpoint)) {
      return this.adminEndpointWorkflowAllowed(endpoint, election);
    } else if (AccessControl.appEndpoints.includes(endpoint)) {
      return this.appEndpointWorkflowAllowed(endpoint, election, latMode);
    } else {
      return [true, "No workflow constraint specified"];
    }
  }

  //Deprecated
  ballotDefintion(voter) {
    if (this.attributes) {
      //Customize per voter
      return Election.dummyBallotDefinition;
    }
  }
}

exports.Election = Election;
