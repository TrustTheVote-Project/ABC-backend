export AWS_PROFILE=abcbackenddeploy

aws dynamodb batch-write-item --request-items file://db-json/populate-election-table-latest.json --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-latest-1.json --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-latest-2.json --output json --no-paginate