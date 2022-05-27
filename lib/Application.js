const DB = require("./db");

const db = new DB();

//const uuid = require("uuid");

let tableName = process.env.APPLICATION_TABLE_NAME;

if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_application_local`;
  // Allow local dev override
  //documentBucket = "";
  //uploadBucket = "";
  documentBase = `https://somewhere.com/docs/`;
}

class Application {
  constructor(attributes, admin = false) {
    this.allAttributes = attributes;
    this.attributes = attributes;
  }

  static async getCurrentState() {
    const data = await db.getAll(null, tableName);
    const attributes = {};
    if (data && data.Items) {
      data.Items.foreach((dataItem) => {
        attributes[dataItem.applicationAttribute] = dataItem;
      });
    }
    return new Application(attributes);
  }

  static async set(attribute, value) {
    await db.update(
      { attributeValue: value },
      { applicationAttribute: attribute },
      tableName
    );

    return value;
  }

  static async get(attribute) {
    const keyValObj = {
      applicationAttribute: attribute,
    };
    const data = await db.get(keyValObj, tableName);
    return data && data.attributeValue ? data.attributeValue : null;
  }
}

exports.Application = Application;
