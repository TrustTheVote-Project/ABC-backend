export AWS_PROFILE=abcbackenddeploy

aws dynamodb batch-write-item --request-items file://db-json/populate-election-table-dev.json --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-dev-1.json --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-dev-2.json --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-dev-3.json --output json --no-paginate

