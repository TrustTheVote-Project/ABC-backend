const DB = require("./db");

const db = new DB();

let tableName = process.env.VOTERS_TABLE_NAME;
let voterSessionTableName = process.env.VOTER_SESSIONS_TABLE_NAME;

if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_voters_local`;
  voterSessionTableName = `abc_voter_sessions_local`;
}

class Voter {
  static objectProperties = [
    "VIDN",
    "firstName",
    "lastName",
    "streetNumber",
    "streetAddress",
    "addressLine2",
    "city",
    "stateCode",
    "ZIP5",
    "DLN",
    "stateIDN",
    "yearOfBirth",
    "dateOfBirth",
    "SSN4",
    "email",
    "mobilePhone",
    "eligibleAbsentee",
    "disabilityAbsentee",
    "UOCAVAAbsentee",
    "DLPhotoRequired",
    "electionJurisdiction",
    "precinctID",
    "partyAffiliation",
    "ballotID",
    "completedN",
    "incompletedN",
    "completedTimeStamp",
    "incompletedTimeStamp",
    "DLNhashTruncated",
    "stateIDNhashTruncated",
    "SSN4hashTruncated",
  ];

  static emptyResponse = JSON.stringify(
    {
      VIDN: null,
      firstName: null,
      lastName: null,
      streetNumber: null,
      streetAddress: null,
      addressLine2: null,
      city: null,
      stateCode: null,
      ZIP5: null,
      DLN: null,
      stateIDN: null,
      yearOfBirth: null,
      dateOfBirth: null,
      SSN4: null,
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
      completedTimeStamp: null,
      incompletedTimeStamp: null,
    },
    null,
    2
  );

  static filterProperties(attributes) {
    return Object.keys(attributes)
      .filter((key) => Voter.objectProperties.includes(key))
      .reduce((obj, key) => {
        obj[key] = attributes[key];
        return obj;
      }, {});
  }

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

  // Not currently used
  /*
  static SSNPlusIndex(SSN, lastName, yearOfBirth) {
    return db.multiColumnIndexKey([SSN, lastName, yearOfBirth]);
  }
  */
  static SSN4HashPlusIndex(SSN4HashTruncated, lastName, yearOfBirth) {
    return db.multiColumnIndexKey([SSN4HashTruncated, lastName, yearOfBirth]);
  }
  static AddressPlusIndex(ZIP5, yearOfBirth, lastName, streetNumber) {
    return db.multiColumnIndexKey([
      ZIP5,
      //stateCode,
      //city,
      yearOfBirth,
      lastName,
      streetNumber,
    ]);
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

  static firstNameAddressFilter(
    matches,
    firstName,
    streetAddress,
    addressLine2
  ) {
    if ((firstName || addressLine2) && matches) {
      streetAddress = streetAddress.toLowerCase();
      firstName = firstName ? firstName.toLowerCase() : false; // may be empty
      addressLine2 = addressLine2 ? addressLine2.toLowerCase() : false; // may be empty
      matches = matches.filter(
        (voter) =>
          (voter["streetAddress"] || "").toLowerCase() == streetAddress &&
          (!firstName ||
            (voter["firstName"] || "").toLowerCase() == firstName) &&
          (!addressLine2 ||
            (voter["addressLine2"] || "").toLowerCase() == addressLine2)
      );
    }
    return matches && matches.length > 0 ? new Voter(matches[0]) : null;
  }

  // Not currently used
  /*
  static async findBySSN(SSN, lastName, firstName, yearOfBirth) {
    let index, key, indexValue;
    if (SSN.length == 4) {
      index = "SSN4Plus-index";
      key = "SSN4Plus";
      indexValue = Voter.SSNPlusIndex(SSN, lastName, yearOfBirth);
    } else {
      index = "SSNPlus-index";
      key = "SSNPlus";
      indexValue = Voter.SSN4PlusIndex(SSN, lastName, yearOfBirth);
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
  */

  static async findBySSN4Hash(
    SSN4HashTruncated,
    lastName,
    firstName,
    yearOfBirth
  ) {
    let index = "SSN4HashPlus-index",
      key = "SSN4HashPlus",
      indexValue = Voter.SSN4HashPlusIndex(
        SSN4HashTruncated,
        lastName,
        yearOfBirth
      );

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
    //stateCode,
    //city,
    yearOfBirth,
    lastName,
    streetNumber,
    //streetAddress,
    firstName
    //addressLine2
  ) {
    let index, key, indexValue;

    index = "AddressPlus-index";
    key = "AddressPlus";
    indexValue = Voter.AddressPlusIndex(
      ZIP5,
      //stateCode,
      //city,
      yearOfBirth,
      lastName,
      streetNumber
    );

    const data = await db.queryIndex(
      {
        ":indexValue": indexValue,
      },
      tableName,
      index,
      key + "=:indexValue"
    );

    return Voter.firstNameFilter(
      data,
      firstName
      //null,
      //null
      //streetAddress,
      //addressLine2
    );
  }

  // This should be converted to pre-computed multi-index

  static async findByVoterDLNHash(
    firstName,
    lastName,
    yearOfBirth,
    IDnumberHashTruncated
  ) {
    let props = {
        ":dob": yearOfBirth,
        ":dlnhashtruncated": IDnumberHashTruncated.toUpperCase(),
      },
      constraints = "DLNHashTruncated=:dlnhashtruncated and yearOfBirth=:dob";

    const data = await db.queryIndex(
      props,
      tableName,
      "DLN-index",
      constraints
    );
    const filteredData = data.filter(
      (voter) =>
        (!firstName ||
          voter["firstName"].toLowerCase() == firstName.toLowerCase()) &&
        voter["lastName"].toLowerCase() == lastName.toLowerCase()
    );

    return filteredData && filteredData.length > 0
      ? new Voter(filteredData[0])
      : null;
  }

  // This should be converted to pre-computed multi-index
  static async findByVoterStateIdNumberHash(
    firstName,
    lastName,
    yearOfBirth,
    IDnumberHashTruncated
  ) {
    let props = {
        ":dob": yearOfBirth,
        ":sidnhashtruncated": IDnumberHashTruncated.toUpperCase(),
      },
      constraints =
        "stateIDNHashTruncated=:sidnhashtruncated and yearOfBirth=:dob";

    const data = await db.queryIndex(
      props,
      tableName,
      "stateIDN-index",
      constraints
    );

    const filteredData = data.filter(
      (voter) =>
        (!firstName ||
          voter["firstName"].toLowerCase() == firstName.toLowerCase()) &&
        voter["lastName"].toLowerCase() == lastName.toLowerCase()
    );

    return filteredData && filteredData.length > 0
      ? new Voter(filteredData[0])
      : null;
  }

  static coalesce = (...args) =>
    args.find((_) => ![undefined, null].includes(_));

  static async findByVoterIdNumber(
    firstName,
    lastName,
    yearOfBirth,
    IDnumberHashTruncated
  ) {
    const voter = await Voter.findByVoterDLNHash(
      firstName,
      lastName,
      yearOfBirth,
      IDnumberHashTruncated
    );
    if (voter) {
      return voter;
    } else {
      return await Voter.findByVoterStateIdNumberHash(
        firstName,
        lastName,
        yearOfBirth,
        IDnumberHashTruncated
      );
    }
  }

  static async create(attributes) {
    const data = await db.put(attributes, tableName);
    return data ? new Voter(attributes) : null;
  }

  constructor(attributes) {
    this.attributes = Voter.filterProperties(attributes);
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
        count += this.attributes["completedN"]
          ? this.attributes["completedN"]
          : 0;
        summaryAttributes["completedN"] = count;
        summaryAttributes["completedTimeStamp"] = ts;
        await this.dbIncrementSession(sessionAttributes, summaryAttributes);
        break;
      case "incomplete":
        count += this.attributes["incompletedN"]
          ? this.attributes["incompletedN"]
          : 0;
        summaryAttributes["incompletedN"] = count;
        summaryAttributes["incompletedTimeStamp"] = ts;
        await this.dbIncrementSession(sessionAttributes, summaryAttributes);
        break;
    }
    this.attributes = { ...this.attributes, ...summaryAttributes };

    return true;
  }
}

exports.Voter = Voter;
