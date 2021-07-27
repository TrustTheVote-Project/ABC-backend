const DB = require("./db");
const db = new DB();

let tableName = process.env.VOTERS_TABLE_NAME;
if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_voters_local`;
}

class Voter {
  //TODO: update this to match voter record data format
  static emptyResponse = JSON.stringify(
    {
      VIDN: null,
      firstName: null,
      lastName: null,
      streetAddress: null,
      addressLine2: null,
      city: null,
      stateCode: null,
      ZIP5: null,
      DLN: null,
      stateIDN: null,
      dateOfBirth: null,
      SSN: null,
      email: null,
      mobilePhone: null,
      eligibleAbsentee: null,
      disabilityAbsentee: null,
      UOCAVAAbsentee: null,
      DLPhotoRequired: null,
      electionJurisdiction: null,
      precinctID: null,
      partyAffiliation: null,
      ballotID: null,
      completedN: null,
      incompletedN: null,
      completeTimeStamp: null,
      incompletedTimeStamp: null,
    },
    null,
    2
  );

  // These are stubs for future easter-eggs
  static wrongResponse = JSON.stringify(
    {
      foo: "bar",
    },
    null,
    2
  );

  static noResponse = JSON.stringify({});

  static badResponse = "not json";

  static dummyBallotURL = "https://somewhereoverrainbow.com";
  static dummyBallotDefinition = { Lots: "Interesting JSON or XML" };

  static async all() {
    const data = await db.getAll(null, tableName);
    if (data && data.Items) {
      return data.Items.map((dataItem) => new Voter(dataItem));
    } else {
      return [];
    }
  }

  static async findByVIDN(VIDN) {
    const data = await db.get(
      {
        VIDN: VIDN,
      },
      tableName
    );

    return data ? new Voter(data) : null;
  }

  /*
  static async findBySSN(SSN) {
    const data = await db.queryIndex(
      {
        ":ssn": SSN,
      },
      tableName,
      "SSN-index",
      "SSN=:ssn"
    );

    return data ? new Voter(data) : null;
  }
  */

  static async findByVoterDLN(firstName, lastName, dateOfBirth, IDnumber) {
    let props = {
        ":dob": dateOfBirth,
        ":dln": IDnumber,
      },
      constraints = "DLN=:dln and dateOfBirth=:dob";

    const data = await db.queryIndex(
      props,
      tableName,
      "DLN-index",
      constraints
    );

    const filteredData = data.filter(
      (voter) =>
        (!firstName || voter["firstName"] == firstName) &&
        voter["lastName"] == lastName
    );

    return filteredData && filteredData.length > 0
      ? new Voter(filteredData[0])
      : null;
  }

  static async findByVoterStateIdNumber(
    firstName,
    lastName,
    dateOfBirth,
    IDnumber
  ) {
    let props = {
        ":dob": dateOfBirth,
        ":sidn": IDnumber,
      },
      constraints = "stateIDN=:sidn and dateOfBirth=:dob";

    const data = await db.queryIndex(
      props,
      tableName,
      "stateIDN-index",
      constraints
    );

    const filteredData = data.filter(
      (voter) =>
        (!firstName || voter["firstName"] == firstName) &&
        voter["lastName"] == lastName
    );

    return filteredData && filteredData.length > 0
      ? new Voter(filteredData[0])
      : null;
  }

  static async findByVoterIdNumber(firstName, lastName, dateOfBirth, IDnumber) {
    const voter = await Voter.findByVoterDLN(
      firstName,
      lastName,
      dateOfBirth,
      IDnumber
    );
    if (!voter) {
      return await Voter.findByVoterStateIdNumber(
        firstName,
        lastName,
        dateOfBirth,
        IDnumber
      );
    }
  }

  static async create(attributes) {
    const data = await db.put(attributes, tableName);
    return data ? new Voter(attributes) : null;
  }

  constructor(attributes) {
    this.attributes = attributes;
  }

  async update(attributes) {
    const newAttributes = await db.update(
      attributes,
      { voterIdNumber: this.attributes.voterIdNumber },
      tableName
    );
    this.attributes = newAttributes;
  }

  ballotDefinition() {
    if (this.attributes) {
      return dummyBallotDefinition;
    }
  }

  blankBallotURL() {
    if (this.attributes) {
      return dummyBallotURL;
    }
  }
}

exports.Voter = Voter;
