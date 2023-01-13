# To deploy live:

# The key you select for admin UI, apps, etc, should be sha3 256 encoded, and that 
# value should be used in the setup commands
https://emn178.github.io/online-tools/sha3_256.html

export AWS_PROFILE=abcbackenddeploy
export PROVISIONER_DEPLOY_VERSION=1
export PROVISIONER_DEPLOY_BUCKET=provisioner-assets-bucket




sh deploy-live.sh
sh set-keys-live.sh \
  -e admin@localhost \
  -s MFRGGMJSGM \
  -k f58fa3df820114f56e1544354379820cff464c9c41cb3ca0ad0b0843c9bb67ee \
  -a FE6018116850FC3798ACA7B3FE4B11B24CEC9977BF5E27B192623027A0D80F53 \
  -l 87CA0214A0FBB75D3492D2028823C5941164E756D85CF3BD42113348E64DD951


=======

export PROVISIONER_ENV=provisioner-v$PROVISIONER_DEPLOY_VERSION
export PROVISIONER_STACK_NAME=ProvisionerV$PROVISIONER_DEPLOY_VERSION

aws s3 mb s3://$PROVISIONER_DEPLOY_BUCKET
sam validate
sam build
sam package --output-template-file packaged.yaml --s3-bucket $PROVISIONER_DEPLOY_BUCKET
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name $PROVISIONER_STACK_NAME --parameter-overrides environment=$PROVISIONER_ENV



### Persistant dynamodb data population

sh dev-db-init.sh


# Run local 
export AWS_PROFILE=abcbackenddeploy
docker run -p 8000:8000 amazon/dynamodb-local


### seed-local.sh
# The keys should be SHA3_256 hashed versions of the keys deployed to the apps
# e.g. this is the hash of abc123
bash ./deploy-scripts/seed-local.sh \
  -e admin@localhost \
  -s MFRGGMJSGM \
  -k f58fa3df820114f56e1544354379820cff464c9c41cb3ca0ad0b0843c9bb67ee \
  -a f58fa3df820114f56e1544354379820cff464c9c41cb3ca0ad0b0843c9bb67ee \
  -l f58fa3df820114f56e1544354379820cff464c9c41cb3ca0ad0b0843c9bb67ee

bash ./deploy-scripts/set-keys-local.sh \
  -e admin@localhost \
  -s MFRGGMJSGM \
  -k f58fa3df820114f56e1544354379820cff464c9c41cb3ca0ad0b0843c9bb67ee \
  -a f58fa3df820114f56e1544354379820cff464c9c41cb3ca0ad0b0843c9bb67ee \
  -l f58fa3df820114f56e1544354379820cff464c9c41cb3ca0ad0b0843c9bb67ee



deploy.sh:
sam package --output-template-file packaged.yaml --s3-bucket abc-backend-deploy-development
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name ABCBackendDevelopment2 --parameter-overrides environment=development






## 
sam local start-api --env-vars local-env-windows.json
sam local start-api --env-vars local-env-osx.json
sam local start-api --env-vars local-env-linux.json
