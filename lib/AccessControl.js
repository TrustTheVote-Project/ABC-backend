const jsSHA = require("./sha3");

const { Application } = require("./Application");
const { Logger } = require("./Logger");
const totp = require("totp-generator");

const apiEndpoint = {
  getAffidavitTemplate: "getAffidavitTemplate",
  //getBallotDefinition: "getBallotDefinition",
  getBlankBallot: "getBlankBallot",
  getConfigurations: "getConfigurations",
  getCurrentElection: "getCurrentElection",
  getElectionDefinition: "getElectionDefinition",

  lookupVoterEmail: "lookupVoterEmail",
  lookupVoterByAddress: "lookupVoterByAddress",
  lookupVoterByIDnumber: "lookupVoterByIDnumber",
  lookupVoterBySSN4: "lookupVoterBySSN4",
  postBegin: "postBegin",
  postComplete: "postComplete",
  postIncomplete: "postIncomplete",

  adminLogin: "admin/login",
  adminLogout: "admin/logut",
  adminGetCurrentElection: "admin/adminGetCurrentElection",

  createElection: "createElection",
  //setBallotDefinitions: "setBallotDefinitions",

  setElectionConfigurations: "setElectionConfigurations",
  setElectionAttributes: "setElectionAttributes",
  setCurrentElection: "setCurrentElection",

  provisionUpload: "provisionUpload",
  setElectionDefinition: "setElectionDefinition",
  setElectionBallots: "setElectionBallots",
  //getElectionDefinitionStatus: "getElectionDefinitionStatus",
  setElectionTestVoters: "setElectionTestVoters", //CTW:
  setElectionVoters: "setElectionVoters",

  openElectionTest: "openElectionTest",
  closeElectionTest: "closeElectionTest",
  setElectionTestComplete: "setElectionTestComplete", //CTW:
  openElectionLookup: "openElectionLookup",
  openElection: "openElection",
  closeElection: "closeElection",
  archiveElection: "archiveElection"
};

const appEndpoints = [
  apiEndpoint.getAffidavitTemplate,
  //apiEndpoint.getBallotDefinition,
  apiEndpoint.getElectionDefinition,
  apiEndpoint.getBlankBallot,
  apiEndpoint.getConfigurations,
  apiEndpoint.getCurrentElection,
  apiEndpoint.lookupVoterEmail,
  apiEndpoint.lookupVoterByAddress,
  apiEndpoint.lookupVoterByIDnumber,
  apiEndpoint.lookupVoterBySSN4,
  apiEndpoint.postBegin,
  apiEndpoint.postComplete,
  apiEndpoint.postIncomplet,
];

const adminEndpoints = [
  apiEndpoint.createElection,
  apiEndpoint.getElection,
  apiEndpoint.getElections,
  apiEndpoint.adminGetCurrentElection,

  apiEndpoint.setElectionAttributes,
  apiEndpoint.setElectionConfigurations,
  apiEndpoint.setCurrentElection,

  apiEndpoint.setElectionDefinition,
  apiEndpoint.provisionUpload,
  apiEndpoint.setElectionBallots,
  apiEndpoint.setElectionVoters,
  apiEndpoint.setElectionTestVoters,

  apiEndpoint.openElectionTest,
  apiEndpoint.closeElectionTest,
  apiEndpoint.setElectionTestComplete,

  apiEndpoint.openElectionLookup,
  apiEndpoint.openElection,
  apiEndpoint.closeElection,
  apiEndpoint.archiveElection,
  //apiEndpoint.getElectionDefinitionStatus,
  //apiEndpoint.setBallotDefinitions,
  //apiEndpoint.uploadBallot,
];

const apiPermission = {
  lookupEmail: "lookupEmail",
  appFunction: "appFunction",
  adminFunction: "adminFunction",
  adminFunctionTokenOnly: "adminFunctionTokenOnly",
  notAllowed: "notAllowed",
};

class AccessControl {
  static apiEndpoint = apiEndpoint;
  static appEndpoints = appEndpoints;
  static adminEndpoints = adminEndpoints;

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
      case apiEndpoint.getCurrentElection:
      case apiEndpoint.getAffidavitTemplate:
      //case apiEndpoint.getBallotDefinition:
      case apiEndpoint.getElectionDefinition:
      case apiEndpoint.getBlankBallot:
      case apiEndpoint.getConfigurations:

      //case apiEndpoint.getTestPrintPage:
      case apiEndpoint.lookupVoterByAddress:
      case apiEndpoint.lookupVoterByIDnumber:
      case apiEndpoint.lookupVoterBySSN4:
      case apiEndpoint.postBegin:
      case apiEndpoint.postComplete:
      case apiEndpoint.postIncomplete:
        return apiPermission.appFunction;
        break;
      case apiEndpoint.adminLogin:
      case apiEndpoint.adminLogout:
        return apiPermission.adminFunctionTokenOnly;
        break;
      case apiEndpoint.getElection:
      case apiEndpoint.createElection:
      case apiEndpoint.adminGetCurrentElection:
      //case apiEndpoint.getElectionDefinitionStatus:
      //case apiEndpoint.setBallotDefinitions:
      case apiEndpoint.setElectionAttributes:
      case apiEndpoint.setElectionConfigurations:
      case apiEndpoint.setCurrentElection:

      case apiEndpoint.provisionUpload:
      case apiEndpoint.setElectionDefinition:
      case apiEndpoint.setElectionBallots:
      case apiEndpoint.setElectionVoters:
      case apiEndpoint.setElectionTestVoters:
      //case apiEndpoint.uploadBallot:

      case apiEndpoint.openElectionTest:
      case apiEndpoint.closeElectionTest:
      case apiEndpoint.setElectionTestComplete:

      case apiEndpoint.openElectionLookup:
      case apiEndpoint.openElection:
      case apiEndpoint.closeElection:
      case apiEndpoint.archiveElection:
        return apiPermission.adminFunction;
        break;
      default:
        return apiPermission.adminFunction; // By default, highest level of permission
    }
  }

  static keyPermissions(apiKey, sessionId) {
    return this.keyHashPermissions(this.SHA3_256(apiKey), sessionId);
  }

  static async generateTotp() {
    const secret = await Application.get("AuthenticatorSecret");
    return totp(secret);
  }

  static extractSessionId(event) {
    return event.headers["X-Session-Id"] || event.headers["x-session-id"] || "";
  }

  static async deleteAdminSession() {
    await Application.set("AdminSessionId", null);
  }

  static async generateAdminSession() {
    const newSessionId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    await Application.set("AdminSessionId", newSessionId);
    return newSessionId;
  }

  static async lookupKey() {
    return (
      (await Application.get("LookupAPIKey")) ||
      "87CA0214A0FBB75D3492D2028823C5941164E756D85CF3BD42113348E64DD951"
    ).toUpperCase();
  }

  static async appKey() {
    return (
      (await Application.get("AppAPIKey")) ||
      "FE6018116850FC3798ACA7B3FE4B11B24CEC9977BF5E27B192623027A0D80F53"
    ).toUpperCase();
  }

  static async adminKey() {
    return (
      (await Application.get("AdminAPIKey")) ||
      "95F1500EC4E85F6BEA36866050577C912331888013CDF4EE31C2F1A1FF4EC424"
    ).toUpperCase();
  }

  static async keyHashPermissions(apiKeyHash, sessionId) {
    Logger.debug(apiKeyHash);
    Logger.debug(await this.adminKey());
    Logger.debug(sessionId);
    switch (apiKeyHash) {
      case await this.lookupKey():
        return [apiPermission.lookupEmail];
        break;
      case await this.appKey():
        return [apiPermission.lookupEmail, apiPermission.appFunction];
        break;
      case await this.adminKey():
        const storedAdminSessionId = await Application.get("AdminSessionId");
        Logger.debug(storedAdminSessionId);
        if (sessionId === storedAdminSessionId) {
          return [
            apiPermission.lookupEmail,
            apiPermission.appFunction,
            apiPermission.adminFunctionTokenOnly,
            apiPermission.adminFunction,
          ];
        } else {
          return [
            apiPermission.lookupEmail,
            apiPermission.appFunction,
            apiPermission.adminFunctionTokenOnly,
          ];
        }
        break;
      default:
        return [];
    }
  }

  static async isAllowed(apiKey, sessionId, endpoint) {
    const permissionsForKey = await this.keyPermissions(apiKey, sessionId);
    const endpointPermission = this.endpointPermission(endpoint);
    return permissionsForKey.includes(endpointPermission);
  }
}

exports.AccessControl = AccessControl;
