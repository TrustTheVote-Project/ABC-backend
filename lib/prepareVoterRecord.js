const jsSHA = require("./sha3");

function prepareVoterRecord(record) {
  const removeAttributes = (inputObject, attributes) =>
    Object.keys(inputObject).reduce((object, key) => {
      if (!attributes.includes(key)) {
        object[key] = inputObject[key];
      }
      return object;
    }, {});

  function objectMerge(object1, object2) {
    return Object.assign({}, object1, object2);
  }

  function addCalcColumns(row, specs) {
    var calcColumns = specs.map((spec) => {
      var key = Object.keys(spec)[0];
      var fn = Object.values(spec)[0];
      var valueObj = {};
      var value = fn.call(this, row);

      //Calc column values normalized upcase; whitespace
      value = value ? value.toUpperCase().replace(/\s+/, " ") : value;

      valueObj[key] = value;
      row = objectMerge(row, valueObj);

      return valueObj;
    });

    console.log(calcColumns);
    calcColumns = calcColumns.reduce(objectMerge);
    console.log(calcColumns);

    return objectMerge(row, calcColumns);
  }

  function preProcessSpecifications() {
    const specs = {
      DLN: upper,
      stateIDN: upper,
      dateOfBirth: justDate,
      eligibleAbsentee: toBoolean,
      disabilityAbsentee: toBoolean,
      UOCAVAAbsentee: toBoolean,
      DLPhotoRequired: toBoolean,
    };
    return specs;
  }

  function appendColumnToUpperCaseFunction(columnArray) {
    var fn = (row) => {
      let values = columnArray.map((column) => {
        return row[column];
      });
      return values.join("|").toUpperCase();
    };
    return fn;
  }

  function SHA3_256(clearText) {
    var upperText = clearText.toString().toUpperCase();
    var obj = new jsSHA("SHA3-256", "TEXT");
    obj.update(upperText);
    var hexHash = obj.getHash("HEX");
    if (clearText) return hexHash.toUpperCase();
  }

  function SHA3_256_TRUNCATED(clearText, n) {
    n = n ? n : 32;
    if (clearText) return SHA3_256(clearText).substring(0, n);
  }

  function sha3Encode(column) {
    var fn = (row) => {
      let value = row[column];
      return SHA3_256_TRUNCATED(value);
    };
    return fn;
  }

  const upper = (str) => (str ? str.toUpperCase() : null);
  const justDate = (dateTimeStr) => dateTimeStr.split("T")[0];
  const toBoolean = (entry) => {
    if (typeof entry == "string") {
      return entry && entry !== "0" && entry.toLowerCase() != "false"
        ? true
        : false;
    } else {
      return entry;
    }
  };

  function calcColumnSpecifications() {
    const specs = [
      {
        DLNhashTruncated: sha3Encode("DLN"),
      },
      {
        stateIDNhashTruncated: sha3Encode("stateIDN"),
      },
      {
        SSN4hashTruncated: sha3Encode("SSN4"),
      },

      {
        VIDN_electionId_latMode: appendColumnToUpperCaseFunction([
          "VIDN",
          "electionId",
          "LAT",
        ]),
      },
      {
        DLNhashTruncated_electionId_latMode: appendColumnToUpperCaseFunction([
          "DLNhashTruncated",
          "electionId",
          "LAT",
        ]),
      },
      {
        stateIDNhashTruncated_electionId_latMode:
          appendColumnToUpperCaseFunction([
            "stateIDNhashTruncated",
            "electionId",
            "LAT",
          ]),
      },
      {
        AddressPlus: appendColumnToUpperCaseFunction([
          "ZIP5",
          "yearOfBirth",
          "lastName",
          "streetNumber",
          "electionId",
          "LAT",
        ]),
      },

      {
        SSN4HashPlus_electionId_latMode: appendColumnToUpperCaseFunction([
          "SSN4hashTruncated",
          "lastName",
          "yearOfBirth",
          "electionId",
          "LAT",
        ]),
      },
    ];
    return specs;
  }

  function applySpecifications(row, spec) {
    console.log(row);
    const analyzed = Object.keys(row).map((key) => {
      const obj = {};
      obj[key] = spec[key] ? spec[key](row[key]) : row[key];
      return obj;
    });

    const newRow = analyzed.reduce((acc, val) => objectMerge(acc, val));

    return newRow;
  }

  // Main function body

  const sanitizedRecord = applySpecifications(
    record,
    preProcessSpecifications()
  );
  const enhancedRecord = addCalcColumns(
    sanitizedRecord,
    calcColumnSpecifications()
  );
  const privacyPreservedRecord = removeAttributes(enhancedRecord, [
    "SSN4",
    "DLN",
    "stateIDN",
  ]);

  return privacyPreservedRecord;
}

module.exports = prepareVoterRecord;
