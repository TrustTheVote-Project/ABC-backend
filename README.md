# Change Log

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

local-env.json: 'OSX' vs 'Windows' vs 'Linux'

sam local start-api --env-vars local-env.json

curl http://127.0.0.1:3000/getElection

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"emptyresponse", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' http://localhost:3000/lookupVoterByIDnumber

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' http://localhost:3000/lookupVoterByIDnumber

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"C46253", "firstName":"Blake", "lastName": "Emerson", "dateOfBirth":"2000-04-01"}' http://localhost:3000/lookupVoterByIDnumber

## API Gateway

### V1.3.0 Dev URLs:

Base URL: https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0

//getElection
curl --header "Content-Type: application/json" https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/getElection

//getConfigurations
curl --header "Content-Type: application/json" https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/getConfigurations

//getAffidavitTemplate
curl --header "Content-Type: application/json" https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/getAffidavitTemplate


//Easter eggs

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"emptyresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"wrongresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"noresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/lookupVoterByIDnumber

// DLN lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"C46253", "firstName":"Blake", "lastName": "Emerson", "yearOfBirth":"2000"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/lookupVoterByIDnumber

// State ID lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/lookupVoterByIDnumber

// SSN4 lookup

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/lookupVoterBySSN4

// Address lookup

curl --header "Content-Type: application/json" --request POST --data '{"firstName": "Rowan","lastName": "Quinn","city": "Orbit City","yearOfBirth": "2000","streetAddress": "3 Sidereal Lane","stateCode": "KY","ZIP5": "77707"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/lookupVoterByAddress

// Post Begin

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"C01234567890"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/postBegin

// Post Incomplete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"C01234567890"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/postIncomplete

// Post Complete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"C01234567890"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/postComplete

//Get Incremented Incomplete count/timestamp

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/lookupVoterBySSN4

//Blank Ballot

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"C01234567890"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/getBlankBallot

//Lookup Voter Email

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"C01234567890"}' https://wjifio0gr8.execute-api.us-east-1.amazonaws.com/development-v1-3-0/lookupVoterEmail
