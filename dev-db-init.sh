export AWS_PROFILE=abcbackenddeploy


aws dynamodb batch-write-item --request-items file://db-json/populate-election-table-dev.json --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-table-1-dev.json --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-table-2-dev.json --output json --no-paginate

aws dynamodb batch-write-item --request-items file://db-json/populate-election-table-latest.json --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-table-1-latest.json --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-table-2-latest.json --output json --no-paginate