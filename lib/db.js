const AWS = require("aws-sdk");

let initParams = {};
if (process.env.AWS_SAM_LOCAL) {
  switch (process.env.DEV_ENVIRONMENT) {
    case "OSX":
      initParams.endpoint = "http://docker.for.mac.localhost:8000";
      break;

    case "Windows":
      initParams.endpoint = "http://docker.for.windows.localhost:8000/";
      break;

    default:
      // Linux
      initParams.endpoint = "http://172.17.0.1:8000";
      break;
  }
}

let documentClient = new AWS.DynamoDB.DocumentClient(initParams);

class DB {
  static putParams(attributes, table) {
    const params = {
      TableName: table,
      Item: attributes,
      ReturnConsumedCapacity: "TOTAL",
    };
    return params;
  }

  //This maybe to db class
  multiColumnIndexKey(valueArray) {
    return valueArray.join("|").toLowerCase().replace(/\s+/, " ");
  }

  put(attributes, table) {
    const params = DB.putParams(attributes, table);

    return new Promise((resolve, reject) => {
      documentClient.put(params, (err, data) => {
        if (err) {
          console.log(
            `There was an error creating the data ${attributes} on table ${table}`,
            err
          );
          return reject(err);
        } else {
          console.log(data);
          return resolve(data);
        }
      });
    });
  }

  static updateParams(attributes, keyValueObj, table) {
    const keys = Object.keys(attributes);
    let updateString = "set ";
    let updates = [];
    let values = {};
    let idx = 1;
    keys.forEach((key) => {
      updates.push(` ${key} = :val${idx} `);
      values[`:val${idx}`] = attributes[key];
      idx += 1;
    });

    updateString += updates.join(",");

    const params = {
      TableName: table,
      Key: keyValueObj,
      UpdateExpression: updateString,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    };

    return params;
  }

  update(attributes, keyValueObj, table) {
    const params = DB.updateParams(attributes, keyValueObj, table);

    return new Promise((resolve, reject) => {
      try {
        documentClient.update(params, (err, data) => {
          if (err) {
            console.log(
              `There was an error updating the data ${attributes} on table ${table} for key ${keyValueObj}`,
              err
            );
            return reject(err);
          } else {
            console.log("Update Data: ", data);
            return resolve(data["Attributes"]);
          }
        });
      } catch (err) {
        console.error(err);
        return reject(err);
      }
    });
  }
  static writeSpecToDbParam(writeSpecification) {
    let { action, attributes, keyValueObj, table } = writeSpecification,
      param = {};
    switch (action) {
      case "put":
        param = { Put: DB.putParams(attributes, table) };
        break;
      case "update":
        param = { Update: DB.updateParams(attributes, keyValueObj, table) };
        break;
    }
    return param;
  }

  static transactWriteParams(writeSpecifications) {
    return { TransactItems: writeSpecifications.map(DB.writeSpecToDbParam) };
  }

  transactWrite(writeSpecifications) {
    const params = DB.transactWriteParams(writeSpecifications);

    return new Promise((resolve, reject) => {
      try {
        documentClient.transactWrite(params, (err, data) => {
          if (err) {
            console.log(
              `There was an error during transactWrite the data ${writeSpecifications}`,
              err
            );
            return reject(err);
          } else {
            return resolve(data["Attributes"]);
          }
        });
      } catch (err) {
        console.error(err);
        return reject(err);
      }
    });
  }

  queryIndex(expressionAttributeValues, table, index, keyConditions) {
    return new Promise((resolve, reject) => {
      let params = {
        TableName: table,
        IndexName: index,
        KeyConditionExpression: keyConditions,
        ExpressionAttributeValues: expressionAttributeValues,
        // Key: keyValueObj,
      };
      documentClient.query(params, function (err, data) {
        if (err) {
          console.log(
            `There was an error fetching the data for ${expressionAttributeValues} on table ${table} with keyConditions ${keyConditions}`,
            err
          );
          return reject(err);
        }
        if (!data.Items) {
          console.log(
            `No data found for ${JSON.stringify(
              expressionAttributeValues
            )} in table ${table}`
          );
          return resolve(null);
        }
        return resolve(data.Items);
      });
    });
  }

  get(keyValueObj, table) {
    return new Promise((resolve, reject) => {
      let params = {
        TableName: table,
        Key: keyValueObj,
      };
      documentClient.get(params, function (err, data) {
        if (err) {
          console.log(
            `There was an error fetching the data for ${keyValueObj} on table ${table} with key ${keyValueObj}`,
            err
          );
          return reject(err);
        }
        if (!data.Item) {
          console.log(
            `No data found for ${JSON.stringify(keyValueObj)} in table ${table}`
          );
          return resolve(null);
        }
        return resolve(data.Item);
      });
    });
  }

  getAll(attributesToGet, table) {
    return new Promise((resolve, reject) => {
      let params = {
        TableName: table,
      };
      if (attributesToGet) {
        params["AttributesToGet"] = attributesToGet;
      }
      documentClient.scan(params, function (err, data) {
        if (err) {
          console.log(
            `There was an error fetching the data for ${attributesToGet} on table ${table}`,
            err
          );
          reject(err);
        }
        if (!data) {
          // CTW: Ask Alex. Not sure if this is correct
          // !data.Items is not an error
          console.log(`No data found for ${attributesToGet} in table ${table}`);
          reject("No data found");
        }
        resolve(data);
      });
    });
  }
}

module.exports = DB;
