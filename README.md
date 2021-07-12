export AWS_PROFILE=abcbackend

aws s3 mb s3://abc-backend-deploy-development

sam build
sam package --output-template-file packaged.yaml --s3-bucket abc-backend-deploy-development
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name ABCBackendDevelopment --parameter-overrides environment=development

# Send message

TODO: Replace with acutal function names for ABC-Backend
sam local invoke LookupFunction --event events/lookupEvent.json



### non-persistant dynamodb 

docker run -p 8000:8000 amazon/dynamodb-local

Seeding data:

TODO: Add tables. Note that there may be attribute name syntax rules that I've broken here...

aws dynamodb create-table --table-name abc_voters_local --attribute-definitions AttributeName=voterIdNumber,AttributeType=S --key-schema AttributeName=voterIdNumber,KeyType=HASH --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 --endpoint-url http://localhost:8000

aws dynamodb put-item --table-name abc_voters_local --item '{ "voterIdNumber": {"S": "abc12"}, "firstName": {"S": "Bill"}, "lastName": {"S": "Smith"} }' --return-consumed-capacity TOTAL --endpoint-url http://localhost:8000

aws dynamodb scan --table-name abc_voters_local --endpoint-url http://localhost:8000


http://localhost:8000


# API gateway

sam local start-api


TODO: update these urls and data structures for ABC-backend data

curl http://127.0.0.1:3000/TBD

curl --header "Content-Type: application/json" --request POST --data '{"email_address": "alex.mekelburg@gmail.com", "use_case_id": "101", "message_id": "2"}' http://127.0.0.1:3000/use-case-messages


# Dev URLs:

TODO: update these urls and data structures for ABC-backend data
https://radczm2q0l.execute-api.us-east-1.amazonaws.com/development/send-message

curl --header "Content-Type: application/json" --request POST --data '{"message": {"token": "cPlzqyR-aEZYkh91rp-VCH:APA91bHZU_0jQ81p_GHWY8XUQlKfsplX3dHpjxuU0O2-I7y3niN6dadpHlFSsiLXf9s6qmKit69Ap1XCotFDnFWR7bMDKewbHvfZgGgQV5xZLGg-rYmdnlKnfswW0iPkKiwz2-WTptCO", "notification": { "title": "Sample Title",     "body": "Sample Body"}, "apns": { "headers": { "apns-priority": "10", "apns-push-type": "alert" }, "payload": {"aps": {"content-available": 1, "category": "NEW_MESSAGE_CATEGORY" }, "messageID": "abc123" } } }}' https://radczm2q0l.execute-api.us-east-1.amazonaws.com/development/send-message
