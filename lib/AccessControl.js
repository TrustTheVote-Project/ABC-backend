const jsSHA = require("./sha3");

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

  static keyPermissions(apiKey) {
    return this.keyHashPermissions(this.SHA3_256(apiKey));
  }

  static keyHashPermissions(apiKeyHash) {
    switch (apiKeyHash) {
      case "87CA0214A0FBB75D3492D2028823C5941164E756D85CF3BD42113348E64DD951":
        return [apiPermission.lookupEmail];
        break;
      case "FE6018116850FC3798ACA7B3FE4B11B24CEC9977BF5E27B192623027A0D80F53":
        return [apiPermission.lookupEmail, apiPermission.appFunction];
        break;
      case "95F1500EC4E85F6BEA36866050577C912331888013CDF4EE31C2F1A1FF4EC424":
        return [
          apiPermission.lookupEmail,
          apiPermission.appFunction,
          apiPermission.adminFunction,
        ];
        break;
      default:
        return [];
    }
  }

  static isAllowed(apiKey, endpoint) {
    return this.keyPermissions(apiKey).includes(
      this.endpointPermission(endpoint)
    );
  }
}

exports.AccessControl = AccessControl;
