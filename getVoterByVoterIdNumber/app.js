// Note: /opt/Common is where all the lib layer code gets put
const { Voter } = require('/opt/Common');

//TODO: update this to match voter record data format
const emptyResponse = JSON.stringify({
  "uid": null,
  "VR_status":null,
  "phone_number":null,
  "phone_type":null,
  "party":null,
  "absentee_status":null,
  "preference_info_notifications":null,
  "preference_text_notifications":null,
  "preference_email_notifications":null,
  "history_date":null,
  "history_description":null,
  "history_more":null,
  "zip_code": null,
  "date_of_birth": null,
  "street_address": null,
  "email_address": null,
  "state": null,
  "city": null,
  "last_name": null,
  "address_line_2": null,
  "first_name": null,
  "device_token": null,
}, null, 2);

// These are stubs for future easter-eggs
const wrongResponse = JSON.stringify({
  foo: "bar"
}, null, 2);

const noResponse = JSON.stringify({});

const badResponse = 'not json';


exports.lambdaHandler = async (event, context, callback) => {
    const messageBody = JSON.parse(event.body)
    const { voterIdNumber } = messageBody;
    
    if (process.env.AWS_SAM_LOCAL || process.env.DEPLOYMENT_ENVIRONMENT === "development") {
      if (voterIdNumber.toLowerCase() === "emptyresponse") {
        return {
          statusCode: 200,
          body: emptyResponse,
        }
      } else if (voterIdNumber.toLowerCase() === "wrongresponse") {
        return {
          statusCode: 200,
          body: wrongResponse,
        }
      } else if (voterIdNumber.toLowerCase() === "noresponse") {
        return {
          statusCode: 200,
          body: noResponse,
        }
      } else if (voterIdNumber.toLowerCase()) {
        return {
          statusCode: 200,
          body: badResponse,
        }
      }
    }

    const voter = await Voter.findByVoterIdNumber(voterIdNumber);
    if (!voter) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({
          error_type: "no_match",
          error_description: `No record matching voter id number ${voterIdNumber}`
        }, null, 2),
      };
      return response;
    }
    // const { attributes } = voter;
    
    // console.log(voter);

    // if (attributes.first_name != first_name && attributes.last_name != last_name) {
    //   const response = {
    //     statusCode: 404,
    //     body: JSON.stringify({
    //       error_type: "partial_match",
    //       error_description: `Record(s) matching email address do not match names ${email_address},  ${first_name}, ${last_name}`
    //     }, null, 2),
    //   };
    //   return response;
    // }

    // TODO: need to find out if we're using firebase in the app for messaging.
    // Update device token if there's a match
    // const { device_token } = voter.attributes;
    // await voter.update({device_token: FCM_token})
    
    // TODO: update to match voter record format (might be able to just delete static code and use direct voter.attributes)
    const responseAttributes = {
      "uid": "4r79y7y4ryr",
      "VR_status": "Not registered, pending review of voter registration request",
      "phone_number": "2345678901",
      "phone_type": "mobile",
      "party": "Green",
      "absentee_status": "none",
      "preference_info_notifications": true,
      "preference_text_notifications": false,
      "preference_email_notifications": false,
      "history_date": "2020-09-20",
      "history_description": "Account Creation: Voter Registration Request",
      "history_more": "Request made via Voto Latino and RockTheVote",
      ...voter.attributes,
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(responseAttributes, null, 2),
    };
    return response;
};
