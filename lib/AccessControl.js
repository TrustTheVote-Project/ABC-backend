//import { apiEndpoint, apiPermission } from "./Common";

const apiEndpoint = {
  lookupVoterEmail: "lookupVoterEmail",
  getAffidavitTemplate: "getAffidavitTemplate",
  getBallotDefinition: "getBallotDefinition",
  getBlankBallot: "getBlankBallot",
  getConfigurations: "getConfigurations",
  getElection: "getElection",
  getTestPrintPAge: "getTestPrintPAge",
  lookupVoterByAddress: "lookupVoterByAddress",
  lookupVoterByIDnumber: "lookupVoterByIDnumber",
  lookupVoterBySSN4: "lookupVoterBySSN4",
  postBegin: "postBegin",
  postComplete: "postComplete",
  postIncomplete: "postIncomplete",
  setBallotDefinitions: "setBallotDefinitions",
  setBallots: "setBallots",
  setConfigurations: "setConfigurations",
  setElection: "setElection",
  setVoters: "setVoters",
  uploadBallot: "uploadBallot",
};

const apiPermission = {
  lookupEmail: "lookupEmail",
  appFunction: "appFunction",
  adminFunction: "adminFunction",
  notAllowed: "notAllowed",
};

class AccessControl {
  static endpointPermission(endpoint) {
    switch (endpoint) {
      case apiEndpoint.lookupVoterEmail:
        return apiPermission.lookupEmail;
        break;
      case apiEndpoint.getAffidavitTemplate:
      case apiEndpoint.getBallotDefinition:
      case apiEndpoint.getBlankBallot:
      case apiEndpoint.getConfigurations:
      case apiEndpoint.getElection:
      case apiEndpoint.getTestPrintPAge:
      case apiEndpoint.lookupVoterByAddress:
      case apiEndpoint.lookupVoterByIDnumber:
      case apiEndpoint.lookupVoterBySSN4:
      case apiEndpoint.postBegin:
      case apiEndpoint.postComplete:
      case apiEndpoint.postIncomplete:
        return apiPermission.appFunction;
        break;
      case apiEndpoint.setBallotDefinitions:
      case apiEndpoint.setBallots:
      case apiEndpoint.setConfigurations:
      case apiEndpoint.setElection:
      case apiEndpoint.setVoters:
      case apiEndpoint.uploadBallot:
        return apiPermission.adminFunction;
        break;
      default:
        return apiPermission.notAllowed;
    }
  }

  static keyPermissions(apiKey) {
    switch (apiKey) {
      case "5367566B58703273357638792F423F45":
        return [apiPermission.lookupEmail];
        break;
      case "614E645267556B586E3272357538782F":
        return [apiPermission.lookupEmail, apiPermission.appFunction];
        break;
      case "46294A404E635266556A576E5A723475":
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
