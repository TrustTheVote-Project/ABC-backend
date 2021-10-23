export AWS_PROFILE=abcbackenddeploy

aws s3 mb s3://abc-backend-deploy-development

sam validate
sam build
sam package --output-template-file packaged.yaml --s3-bucket abc-backend-deploy-development
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name ABCBackendDevelopment2 --parameter-overrides environment=development

# Versioned deploy

aws s3 mb s3://abc-backend-deploy-development-v{majorVersion}-{minorVersion}

sam validate
sam build
sam package --output-template-file packaged.yaml --s3-bucket abc-backend-deploy-development-v{majorVersion}-{minorVersion}
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name ABCBackendDevelopment2-v{majorVersion}-{minorVersion} --parameter-overrides environment=development-v{majorVersion}-{minorVersion}

# Send message

TODO: Replace with acutal function names for ABC-Backend
sam local invoke LookupFunction --event events/lookupEvent.json

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

# API gateway

sam local start-api --env-vars local-env-windows.json
sam local start-api --env-vars local-env-osx.json
sam local start-api --env-vars local-env-linux.json


TODO: update these urls and data structures for ABC-backend data

curl http://127.0.0.1:3000/getElection

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"emptyresponse", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' http://localhost:3000/lookupVoterByIDnumber

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' http://localhost:3000/lookupVoterByIDnumber

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"C01234567890", "firstName":"Blake", "lastName": "Emerson", "dateOfBirth":"2000-04-01"}' http://localhost:3000/lookupVoterByIDnumber

curl --header "Content-Type: application/json" --request POST --data '{"email_address": "alex.mekelburg@gmail.com", "use_case_id": "101", "message_id": "2"}' http://127.0.0.1:3000/use-case-messages

# V1.0 Dev URLs:

Base Url: https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/

curl --header "Content-Type: application/json" https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/getElection

//Easter eggs

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"emptyresponse", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"wrongresponse", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"noresponse", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByIDnumber

// DLN lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"C01234567890", "firstName":"Blake", "lastName": "Emerson", "dateOfBirth":"2000-04-01"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByIDnumber

// State ID lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByIDnumber

// SSN4 lookup

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterBySSN4

// Address lookup

curl --header "Content-Type: application/json" --request POST --data '{"firstName": "Rowan","lastName": "Quinn","city": "Orbit City","yearOfBirth": "2000-04-01","streetAddress": "3 Sidereal Lane","stateCode": "KY","ZIP5": "77707"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByAddress

// Post Begin

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/postBegin

// Post Incomplete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/postIncomplete

// Post Complete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/postComplete

//Get Incremented Incomplete count/timestamp

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterBySSN4

//Blank Ballot

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/getBlankBallot

//Lookup Voter Email

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"1236", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterEmail

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"A00000000002", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterEmail

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "dateOfBirth":"2000-04-01"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterEmail

# V1.1 Dev URLs:

Base URL: https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/

curl --header "Content-Type: application/json" https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/getElection

//Easter eggs

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"emptyresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"wrongresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"noresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/lookupVoterByIDnumber

// DLN lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"C01234567890", "firstName":"Blake", "lastName": "Emerson", "yearOfBirth":"2000"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/lookupVoterByIDnumber

// State ID lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/lookupVoterByIDnumber

// SSN4 lookup

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/lookupVoterBySSN4

// Address lookup

curl --header "Content-Type: application/json" --request POST --data '{"firstName": "Rowan","lastName": "Quinn","city": "Orbit City","yearOfBirth": "2000","streetAddress": "3 Sidereal Lane","stateCode": "KY","ZIP5": "77707"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/lookupVoterByAddress

// Post Begin

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/postBegin

// Post Incomplete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/postIncomplete

// Post Complete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/postComplete

//Get Incremented Incomplete count/timestamp

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/lookupVoterBySSN4

//Blank Ballot

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/getBlankBallot

//Lookup Voter Email

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"A00000000002"}' https://wwe9lhv7s2.execute-api.us-east-1.amazonaws.com/development-v1-1/lookupVoterEmail

# V1.2 Dev URLs:

Base URL: https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/

curl --header "Content-Type: application/json" https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/getElection

//Easter eggs

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"emptyresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"wrongresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"noresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/lookupVoterByIDnumber

// DLN lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"C01234567890", "firstName":"Blake", "lastName": "Emerson", "yearOfBirth":"2000"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/lookupVoterByIDnumber

// State ID lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/lookupVoterByIDnumber

// SSN4 lookup

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/lookupVoterBySSN4

// Address lookup

curl --header "Content-Type: application/json" --request POST --data '{"firstName": "Rowan","lastName": "Quinn","city": "Orbit City","yearOfBirth": "2000","streetAddress": "3 Sidereal Lane","stateCode": "KY","ZIP5": "77707"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/lookupVoterByAddress

// Post Begin

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A0002"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/postBegin

// Post Incomplete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A0002"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/postIncomplete

// Post Complete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A0002"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/postComplete

//Get Incremented Incomplete count/timestamp

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/lookupVoterBySSN4

//Blank Ballot

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A0002"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/getBlankBallot

//Lookup Voter Email

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"A0002"}' https://aa0pwwehc8.execute-api.us-east-1.amazonaws.com/development-v1-2/lookupVoterEmail

# V1.21 Dev URLs:

Base URL: https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21

//getElection
curl --header "Content-Type: application/json" https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/getElection

//getConfigurations
curl --header "Content-Type: application/json" https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/getConfigurations

//Easter eggs

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"emptyresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"wrongresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"noresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/lookupVoterByIDnumber

// DLN lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"C46253", "firstName":"Blake", "lastName": "Emerson", "yearOfBirth":"2000"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/lookupVoterByIDnumber

// State ID lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/lookupVoterByIDnumber

// SSN4 lookup

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/lookupVoterBySSN4

// Address lookup

curl --header "Content-Type: application/json" --request POST --data '{"firstName": "Rowan","lastName": "Quinn","city": "Orbit City","yearOfBirth": "2000","streetAddress": "3 Sidereal Lane","stateCode": "KY","ZIP5": "77707"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/lookupVoterByAddress

// Post Begin

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"C01234567890"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/postBegin

// Post Incomplete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"C01234567890"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/postIncomplete

// Post Complete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"C01234567890"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/postComplete

//Get Incremented Incomplete count/timestamp

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/lookupVoterBySSN4

//Blank Ballot

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"C01234567890"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/getBlankBallot

//Lookup Voter Email

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"C01234567890"}' https://d3x8hn4sf0.execute-api.us-east-1.amazonaws.com/development-v1-21/lookupVoterEmail
