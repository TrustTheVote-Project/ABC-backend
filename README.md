# Change Log

Version 3.3.0
    [TBD]
    Add sample files for admin upload at examples/text_fixtures


Version 3.1.2
* Add app new endpoints: getCurrentElection
* Note: getCurrentElection replaces previous getElection
* Add private endpoints: setCurrentElection
* Adds private endpoints openElectionTest,closeElectionTest,openElection,closeElection
* Adds private endpoints: provisionUpload, getElectionDefinitionStatus
* Voter table support for multipler voter sets (per election, LAT mode)
* Voter record returned to app filterd to consumer fields, null values now returned
* User-Agent: test now triggers "lat" mode election/voter queries


Version 3.0.1
* Updates election default configuration
* Adds getElectionDefinition
* Updates DLN, StateID, and SSN4 lookups to use truncated SHA3 256 hash
* Look up API Key authorization by SHA3 256 hash

Version 1.4.0
* Add new endpoint: getTestPrintPage
* Change lookupVoterByAddress endpoint (remove: city,state, streetAddress add: streetNumber)
* Add new db columns: streetNumber [as string], dateOfBirth [as date string]
* Allow stateID and DLN to be case insensitive


Version 1.3.0
* yearOfBirth added to voter specfication; returned in queries
* Test data update SSN removed; DL and IDN entries updated
* No current election typo error fixed
* VIDN replaces IDNumber in lookupVoterEmail
* "0" attribute values are now preserved in voter data model
* Updates Affidavit file

Version 1.2.1
* yearOfBirth replaces dateOfBirth in all lookup queries
* full SSN based lookup is deprecated. Only SSN4 is supported
* 404 error for wrong API endpoint
* 400 errors for: no election, voter not found, missing required param
* new endpoint /getVoterEmail using VIDN as input
* DLN data is 6 character length
* getConfigurations updated with 6 character length for DLN, and 6 character length example DLN

# Build Environment

export AWS_PROFILE=abcbackenddeploy

aws s3 mb s3://abc-backend-deploy-development

sam validate

sam build

sam package --output-template-file packaged.yaml --s3-bucket abc-backend-deploy-development

sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name ABCBackendDevelopment2 --parameter-overrides environment=development

# Versioned deploy

aws s3 mb s3://abc-backend-deploy-development-v{majorVersion}-{minorVersion}-{patch}

sam validate
sam build
sam package --output-template-file packaged.yaml --s3-bucket abc-backend-deploy-development-v{majorVersion}-{minorVersion}-{patch}
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name ABCBackendDevelopment2-v{majorVersion}-{minorVersion}-{patch} --parameter-overrides environment=development-v{majorVersion}-{minorVersion}-{patch}

### non-persistant dynamodb

docker run -p 8000:8000 amazon/dynamodb-local

Seeding data:

sh db-init.sh

Definitions and data in db-json/

aws dynamodb scan --table-name abc_voters_local --endpoint-url http://localhost:8000

http://localhost:8000

### Persistant dynamodb data population

Seeding data:

sh dev-db-init.sh

### S3 bucket document population

aws s3 sync ./docs s3://abc-documents-development

aws s3 sync ./docs s3://abc-documents-development-v{majorVersion}-{minorVersion}-{patch}


# API

## localhost

sam local start-api --env-vars local-env-windows.json
sam local start-api --env-vars local-env-osx.json
sam local start-api --env-vars local-env-linux.json


curl http://127.0.0.1:3000/getCurrentElection

curl  -H "Content-Type: application/json"  --request POST --data '{"IDnumber":"emptyresponse", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' http://localhost:3000/lookupVoterByIDnumber

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' http://localhost:3000/lookupVoterByIDnumber

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"C46253", "firstName":"Blake", "lastName": "Emerson", "dateOfBirth":"2000-04-01"}' http://localhost:3000/lookupVoterByIDnumber

## API Gateway

### V3.3.3 Dev URLs:

Base URL: https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/

### Previous version V3.01: 
Base URL:  https:// tvghm1ioy6.execute-api.us-east-1.amazonaws.com/development-v3-0-1/


//getCurrentElection
curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H "Content-Type: application/json"  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/getCurrentElection

//getConfigurations
curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json"  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/getConfigurations

//getElectionDefinition
curl -H "Cache-Control: no-cache" -H "Authorization: Bearer [Appropriate API KEY HERE]" -H "Content-Type: application/json" --request GET  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/getElectionDefinition


//getTestPrintPage

curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json"  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/getTestPrintPage


//getAffidavitTemplate
curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json"  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/getAffidavitTemplate


//Easter eggs

curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"IDnumber":"emptyresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/lookupVoterByIDnumber
curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"IDnumber":"wrongresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/lookupVoterByIDnumber
curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"IDnumber":"noresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/lookupVoterByIDnumber

// DLN lookup

curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"IDnumberHashTruncated":"1F15CC9BB9E521DE14600E02E001F375", "firstName":"Qiu", "lastName": "Xun", "yearOfBirth":"2000"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/lookupVoterByIDnumber

// State ID lookup

curl -H "Authorization: Bearer  [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"IDnumberHashTruncated":"16333B5622E9528036778FED1165B199", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/lookupVoterByIDnumber

// SSN4 lookup

curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"SSN4HashTruncated":"95439DD70D46C990F352206BFC1E0CA7", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/lookupVoterBySSN4

// Address lookup

curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"firstName": "Rowan","lastName": "Quinn","yearOfBirth": "2000","streetNumber": "3","ZIP5": "77707"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/lookupVoterByAddress

// Post Begin

curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"VIDN":"P01234567890"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/postBegin

// Post Incomplete

curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"VIDN":"P01234567890"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/postIncomplete

// Post Complete

curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"VIDN":"P01234567890"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/postComplete

//Get Incremented Incomplete count/timestamp

curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/lookupVoterBySSN4

//Blank Ballot

curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"VIDN":"P01234567890"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/getBlankBallot

//Lookup Voter Email

curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000006"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/lookupVoterEmail



curl -H "Authorization: Bearer [Appropriate API KEY HERE]" -H  "Content-Type: application/json" --request POST --data '{"IDnumber":"noresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}'  https://3u9zs7ro0h.execute-api.us-east-1.amazonaws.com/development-v3-3-0/lookupVoterByIDnumber