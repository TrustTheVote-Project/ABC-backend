aws dynamodb delete-table --table-name abc_elections_local --endpoint-url http://localhost:8000  --output json --no-paginate
aws dynamodb create-table --cli-input-json file://db-json/create-election-table.json --endpoint-url http://localhost:8000  --output json --no-paginate

aws dynamodb delete-table --table-name abc_files_local --endpoint-url http://localhost:8000  --output json --no-paginate
aws dynamodb create-table --cli-input-json file://db-json/create-files-table.json --endpoint-url http://localhost:8000  --output json --no-paginate

aws dynamodb delete-table --table-name abc_voters_local --endpoint-url http://localhost:8000  --output json --no-paginate
aws dynamodb create-table --cli-input-json file://db-json/create-voter-table.json --endpoint-url http://localhost:8000  --output json --no-paginate

aws dynamodb batch-write-item --request-items file://db-json/populate-election-table.json --endpoint-url http://localhost:8000  --output json --no-paginate

aws dynamodb batch-write-item --request-items file://db-json/populate-voter-1.json --endpoint-url http://localhost:8000  --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-2.json --endpoint-url http://localhost:8000  --output json --no-paginate
aws dynamodb batch-write-item --request-items file://db-json/populate-voter-3.json --endpoint-url http://localhost:8000  --output json --no-paginate

aws dynamodb delete-table --table-name abc_voter_sessions_local --endpoint-url http://localhost:8000  --output json --no-paginate
aws dynamodb create-table --cli-input-json file://db-json/create-voter-sessions-table.json --endpoint-url http://localhost:8000  --output json --no-paginate

aws dynamodb scan --table-name abc_voter_sessions_local --endpoint-url http://localhost:8000  --output json --no-paginate