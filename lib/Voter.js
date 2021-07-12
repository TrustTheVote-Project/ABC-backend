const DB = require('./db');
const db = new DB();


let tableName = process.env.VOTERS_TABLE_NAME
if (process.env.AWS_SAM_LOCAL) {
  tableName = `abc_voters_local`
}

class Voter {

  static async all() {
    const data = await db.getAll(null, tableName);
    if (data && data.Items) {
      return data.Items.map((dataItem)=>new User(dataItem));
    } else {
      return []
    }
  }

  static async findByVoterIdNumber(voterIdNumber) {
    const data = await db.get({
      voterIdNumber
    }, tableName);

    return data ? new User(data) : null;    
  }

  static async create(attributes) {
    const data = await db.put(attributes, tableName)
    return data ? new User(attributes) : null;
  }

  constructor(attributes) {
    this.attributes = attributes;
  }

  async update(attributes) {
    const newAttributes = await db.update(attributes, {voterIdNumber: this.attributes.voterIdNumber}, tableName)
    this.attributes = newAttributes;
  }

}


exports.Voter = Voter;