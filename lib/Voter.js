const DB = require("./db");
const db = new DB();

//Alex:  could have voterSession class for db interaction
// but then the code is duplicated as the transaction requires both
// so currently just here

let tableName = process.env.VOTERS_TABLE_NAME;
let voterSessionTableName = process.env.VOTER_SESSIONS_TABLE_NAME;

if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_voters_local`;
  voterSessionTableName = `abc_voter_sessions_local`;
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

  static SSNPlusIndex(SSN, lastName, dateOfBirth) {
    return (SSN + lastName + dateOfBirth).toLowerCase();
  }
  static SSN4PlusIndex(SSN4, lastName, dateOfBirth) {
    return (SSN4 + lastName + dateOfBirth).toLowerCase();
  }
  static AddressPlusIndex(
    ZIP5,
    stateCode,
    city,
    dateOfBirth,
    lastName,
    streetAddress
  ) {
    return (
      ZIP5 +
      stateCode +
      city +
      dateOfBirth +
      lastName +
      streetAddress
    ).toLowerCase();
  }

  static firstNameFilter(matches, firstName) {
    if (firstName && matches) {
      firstName = firstName.toLowerCase();
      matches = matches.filter(
        (voter) => (voter["firstName"] || "").toLowerCase() == firstName
      );
    }
    return matches && matches.length > 0 ? new Voter(matches[0]) : null;
  }

  static firstNameAddressLine2Filter(matches, firstName, addressLine2) {
    if ((firstName || addressLine2) && matches) {
      firstName = firstName.toLowerCase();
      addressLine2 = addressLine2.toLowerCase();
      matches = matches.filter(
        (voter) =>
          (!firstName ||
            (voter["firstName"] || "").toLowerCase() == firstName) &&
          (!addressLine2 ||
            (voter["addressLine2"] || "").toLowerCase() == addressLine2)
      );
    }
    return matches && matches.length > 0 ? new Voter(matches[0]) : null;
  }

  static async findBySSN(SSN, lastName, firstName, dateOfBirth) {
    let index, key, indexValue;
    if (SSN.length == 4) {
      index = "SSN4Plus-index";
      key = "SSN4Plus";
      indexValue = Voter.SSNPlusIndex(SSN, lastName, dateOfBirth);
    } else {
      index = "SSNPlus-index";
      key = "SSNPlus";
      indexValue = Voter.SSN4PlusIndex(SSN, lastName, dateOfBirth);
    }

    const data = await db.queryIndex(
      {
        ":indexValue": indexValue,
      },
      tableName,
      index,
      key + "=:indexValue"
    );

    return Voter.firstNameFilter(data, firstName);
  }

  static async findByAddress(
    ZIP5,
    stateCode,
    city,
    dateOfBirth,
    lastName,
    streetAddress,
    firstName,
    addressLine2
  ) {
    let index, key, indexValue;

    index = "AddressPlus-index";
    key = "AddressPlus";
    indexValue = Voter.AddressPlusIndex(
      ZIP5,
      stateCode,
      city,
      dateOfBirth,
      lastName,
      streetAddress
    );

    const data = await db.queryIndex(
      {
        ":indexValue": indexValue,
      },
      tableName,
      index,
      key + "=:indexValue"
    );

    return Voter.firstNameAddressLine2Filter(data, firstName, addressLine2);
  }

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
    if (voter) {
      return voter;
    } else {
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
      { VIDN: this.attributes.VIDN },
      tableName
    );
    this.attributes = newAttributes;
  }

  ballotDefinition() {
    if (this.attributes) {
      return dummyBallotDefinition;
    }
  }

  async dbIncrementSession(sessionAttributes, summaryAttributes = false) {
    if (summaryAttributes) {
      await db.transactWrite([
        {
          action: "put",
          attributes: sessionAttributes,
          table: voterSessionTableName,
        },
        {
          action: "update",
          attributes: summaryAttributes,
          keyValueObj: { VIDN: this.attributes.VIDN },
          table: tableName,
        },
      ]);
    } else {
      await db.put(sessionAttributes, voterSessionTableName);
    }
  }

  async incrementSession(type) {
    let summaryAttributes = {};
    let ts = Date.now();
    let sessionAttributes = {
      VIDN: this.attributes["VIDN"],
      type: type,
      timestamp: ts,
    };
    let count = 1;
    switch (type) {
      case "begin":
        await this.dbIncrementSession(sessionAttributes);
        break;
      case "complete":
        count = count += this.attributes["completedN"]
          ? this.attributes["completedN"]
          : 0;
        summaryAttributes["completedN"] = count;
        summaryAttributes["completeTimeStamp"] = ts;
        await this.dbIncrementSession(sessionAttributes, summaryAttributes);
        break;
      case "incomplete":
        count = count += this.attributes["incompletedN"]
          ? this.attributes["incompletedN"]
          : 0;
        summaryAttributes["incompletedN"] = count;
        summaryAttributes["incompletedTimeStamp"] = ts;
        await this.dbIncrementSession(sessionAttributes, summaryAttributes);
        break;
    }
    return true;
  }
}

exports.Voter = Voter;
