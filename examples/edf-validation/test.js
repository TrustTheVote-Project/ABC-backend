const Ajv = require("ajv");
const ajv = new Ajv();

const data = require("./data/august_test_case.json");
const schema = require("./data/NIST_V2_election_results_reporting.json");

console.log("************************");
console.log("Valid Test");
const valid = ajv.validate(schema, data);
if (!valid) {
  console.log("Invalid!");
  console.log(ajv.errors);
} else {
  console.log("Valid!");
}

const data_invalid = require("./data/invalid_test_case.json");
console.log("************************");
console.log("Invalid Test");
const valid2 = ajv.validate(schema, data_invalid);
if (!valid2) {
  console.log("Invalid!");
  console.log(ajv.errors);
} else {
  console.log("Valid!");
}

const data_invalid_2 = require("./data/invalid_test_case_2.json");
console.log("************************");
console.log("Invalid Test");
const valid3 = ajv.validate(schema, data_invalid_2);
if (!valid3) {
  console.log("Invalid!");
  console.log(ajv.errors);
} else {
  console.log("Valid!");
}
