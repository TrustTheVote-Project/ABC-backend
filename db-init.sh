aws dynamodb delete-table --table-name abc_elections_local --endpoint-url http://localhost:8000  --output json --no-paginate
aws dynamodb create-table --cli-input-json file://db-json/create-election-table.json --endpoint-url http://localhost:8000  --output json --no-paginate

aws dynamodb delete-table --table-name abc_voters_local --endpoint-url http://localhost:8000  --output json --no-paginate


aws dynamodb create-table --cli-input-json file://db-json/create-voter-table.json --endpoint-url http://localhost:8000  --output json --no-paginate

aws dynamodb batch-write-item --request-items file://db-json/populate-election-table.json --endpoint-url http://localhost:8000  --output json --no-paginate

aws dynamodb batch-write-item --request-items file://db-json/populate-voter-table-1.json --endpoint-url http://localhost:8000  --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-table-2.json --endpoint-url http://localhost:8000  --output json --no-paginate