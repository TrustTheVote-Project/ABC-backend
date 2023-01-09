const jsSHA = require("./sha3");

const { Application } = require("./Application")
const { Logger } = require("./Logger")

const apiEndpoint = {
  createElection: "createElection",
  lookupVoterEmail: "lookupVoterEmail",
  getAffidavitTemplate: "getAffidavitTemplate",
  getBallotDefinition: "getBallotDefinition",
  getBlankBallot: "getBlankBallot",
  getConfigurations: "getConfigurations",
  getCurrentElection: "getCurrentElection",
  getElectionDefinition: "getElectionDefinition",
  getElectionDefinitionStatus: "getElectionDefinitionStatus",
  getElection: "getElection",
  getTestPrintPage: "getTestPrintPage",
  lookupVoterByAddress: "lookupVoterByAddress",
  lookupVoterByIDnumber: "lookupVoterByIDnumber",
  lookupVoterBySSN4: "lookupVoterBySSN4",
  postBegin: "postBegin",
  postComplete: "postComplete",
  postIncomplete: "postIncomplete",
  setBallotDefinitions: "setBallotDefinitions",
  setBallots: "setBallots",
  setElectionConfigurations: "setElectionConfigurations",
  setElectionAttributes: "setElectionAttributes",
  setElectionDefinition: "setElectionDefinition",
  setElectionVoters: "setElectionVoters",
  setElectionBallots: "setElectionBallots",
  provisionUpload: "provisionUpload",
  openElection: "openElection",
  openElectionLookup: "openElectionLookup",
  closeElection: "closeElection",
  openElectionTest: "openElectionTest",
  closeElectionTest: "closeElectionTest",
};

const apiPermission = {
  lookupEmail: "lookupEmail",
  appFunction: "appFunction",
  adminFunction: "adminFunction",
  notAllowed: "notAllowed",
};

class AccessControl {
  static SHA3_256(clearText) {
    var obj = new jsSHA("SHA3-256", "TEXT");
    obj.update(clearText);
    var hexHash = obj.getHash("HEX");
    if (clearText) return hexHash.toUpperCase();
  }

  static SHA3_256_TRUNCATED(clearText, n) {
    n = n ? n : 32;
    if (clearText) return this.SHA3_256(clearText).substring(0, n);
  }

  static endpointPermission(endpoint) {
    switch (endpoint) {
      case apiEndpoint.lookupVoterEmail:
        return apiPermission.lookupEmail;
        break;
      case apiEndpoint.getAffidavitTemplate:
      case apiEndpoint.getBallotDefinition:
      case apiEndpoint.getElectionDefinition:
      case apiEndpoint.getBlankBallot:
      case apiEndpoint.getConfigurations:
      case apiEndpoint.getCurrentElection:
      case apiEndpoint.getElection:
      case apiEndpoint.getTestPrintPage:
      case apiEndpoint.lookupVoterByAddress:
      case apiEndpoint.lookupVoterByIDnumber:
      case apiEndpoint.lookupVoterBySSN4:
      case apiEndpoint.postBegin:
      case apiEndpoint.postComplete:
      case apiEndpoint.postIncomplete:
        return apiPermission.appFunction;
        break;

      case apiEndpoint.createElection:
      case apiEndpoint.getElectionDefinitionStatus:
      case apiEndpoint.setBallotDefinitions:
      case apiEndpoint.setElectionBallots:
      case apiEndpoint.setElectionConfigurations:
      case apiEndpoint.setElectionAttributes:
      case apiEndpoint.setElectionDefinition:
      case apiEndpoint.setElectionVoters:
      case apiEndpoint.uploadBallot:
      case apiEndpoint.provisionUpload:
      case apiEndpoint.openElection:
      case apiEndpoint.openElectionTest:
      case apiEndpoint.closeElection:
      case apiEndpoint.closeElectionTest:
        return apiPermission.adminFunction;
        break;
      default:
        return apiPermission.adminFunction; // By default, highest level of permission
    }
  }

  static keyPermissions(apiKey, sessionId,) {
    return this.keyHashPermissions(this.SHA3_256(apiKey), sessionId);
  }

  static generateTotp() {
    return 'abc123';
  }

  static async lookupKey() {
    return ((await Application.get("LookupAPIKey")) || "87CA0214A0FBB75D3492D2028823C5941164E756D85CF3BD42113348E64DD951").toUpperCase()
  }

  static async appKey() {
    return ((await Application.get("AppAPIKey")) || "FE6018116850FC3798ACA7B3FE4B11B24CEC9977BF5E27B192623027A0D80F53").toUpperCase()
  }

  static async adminKey() {
    return ((await Application.get("AdminAPIKey")) || "95F1500EC4E85F6BEA36866050577C912331888013CDF4EE31C2F1A1FF4EC424").toUpperCase()
  }

  static async keyHashPermissions(apiKeyHash, sessionId) {
    switch (apiKeyHash) {
      case await this.lookupKey():
        return [apiPermission.lookupEmail];
        break;
      case await this.appKey():
        return [apiPermission.lookupEmail, apiPermission.appFunction];
        break;
      case await this.adminKey():
        const storedAdminSessionId = await Application.get("AdminSessionId")
        if (sessionId === storedAdminSessionId) {
          return [
            apiPermission.lookupEmail,
            apiPermission.appFunction,
            apiPermission.adminFunction,
          ];  
        } else {
          return [];
        }
        break;
      default:
        return [];
    }
  }

  static async isAllowed(apiKey, sessionId, endpoint) {
    const permissionsForKey = await this.keyPermissions(apiKey, sessionId)
    const endpointPermission = this.endpointPermission(endpoint);
    return (permissionsForKey).includes(
      endpointPermission
    );
  }
}

exports.AccessControl = AccessControl;
