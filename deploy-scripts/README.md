# Prepare

export AWS_PROFILE=abcbackenddeploy

aws s3 mb s3://abc-backend-deploy-development

### prepare.sh
// sam validate
// sam build


### Run local 
docker run -p 8000:8000 amazon/dynamodb-local

### seed-local.sh
# The keys should be SHA3_256 hashed versions of the keys deployed to the apps
# e.g. this is the hash of abc123
bash ./deploy-scripts/seed-local.sh \
  -e admin@localhost \
  -s "" \
  -k f58fa3df820114f56e1544354379820cff464c9c41cb3ca0ad0b0843c9bb67ee \
  -a f58fa3df820114f56e1544354379820cff464c9c41cb3ca0ad0b0843c9bb67ee \
  -l f58fa3df820114f56e1544354379820cff464c9c41cb3ca0ad0b0843c9bb67ee



deploy.sh:
sam package --output-template-file packaged.yaml --s3-bucket abc-backend-deploy-development
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name ABCBackendDevelopment2 --parameter-overrides environment=development




docker run -p 8000:8000 amazon/dynamodb-local

Seeding data:
sh db-init.sh


### Persistant dynamodb data population

sh dev-db-init.sh



## 
sam local start-api --env-vars local-env-windows.json
sam local start-api --env-vars local-env-osx.json
sam local start-api --env-vars local-env-linux.json
