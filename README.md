export AWS_PROFILE=abcbackenddeploy

aws s3 mb s3://abc-backend-deploy-development

sam validate
sam build
sam package --output-template-file packaged.yaml --s3-bucket abc-backend-deploy-development
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name ABCBackendDevelopment2 --parameter-overrides environment=development

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

sam local start-api --env-vars local-env.json

local-env.json: 'OSX' vs 'Windows' vs 'Linux'

TODO: update these urls and data structures for ABC-backend data

curl http://127.0.0.1:3000/getElection

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"emptyresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' http://localhost:3000/lookupVoterByIDnumber

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' http://localhost:3000/lookupVoterByIDnumber

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"C01234567890", "firstName":"Blake", "lastName": "Emerson", "yearOfBirth":"2000"}' http://localhost:3000/lookupVoterByIDnumber

curl --header "Content-Type: application/json" --request POST --data '{"email_address": "alex.mekelburg@gmail.com", "use_case_id": "101", "message_id": "2"}' http://127.0.0.1:3000/use-case-messages

# Dev URLs:

curl --header "Content-Type: application/json" https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/getElection

//Easter eggs

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"emptyresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"wrongresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByIDnumber
curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"noresponse", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByIDnumber

// DLN lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"C01234567890", "firstName":"Blake", "lastName": "Emerson", "yearOfBirth":"2000"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByIDnumber

// State ID lookup

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByIDnumber

// SSN4 lookup

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterBySSN4

// Address lookup

curl --header "Content-Type: application/json" --request POST --data '{"firstName": "Rowan","lastName": "Quinn","city": "Orbit City","yearOfBirth": "2000","streetAddress": "3 Sidereal Lane","stateCode": "KY","ZIP5": "77707"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterByAddress

// Post Begin

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/postBegin

// Post Incomplete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/postIncomplete

// Post Complete

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/postComplete

//Get Incremented Incomplete count/timestamp

curl --header "Content-Type: application/json" --request POST --data '{"SSN4":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterBySSN4

//Blank Ballot

curl --header "Content-Type: application/json" --request POST --data '{"VIDN":"A00000000002"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/getBlankBallot

//Lookup Voter Email

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"1236", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterEmail

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"A00000000002", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterEmail

curl --header "Content-Type: application/json" --request POST --data '{"IDnumber":"12-34-56-79", "firstName":"Rowan", "lastName": "Quinn", "yearOfBirth":"2000"}' https://zieqc1fcrg.execute-api.us-east-1.amazonaws.com/development/lookupVoterEmail
