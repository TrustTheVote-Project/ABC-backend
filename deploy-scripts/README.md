# To deploy live:

# The key you select for admin UI, apps, etc, should be sha3 256 encoded, and that 
# value should be used in the setup commands
https://emn178.github.io/online-tools/sha3_256.html

export AWS_PROFILE=abcbackenddeploy

export PROVISIONER_DEPLOY_VERSION=1-0-2
export PROVISIONER_DEPLOY_BUCKET=provisioner-assets-bucket




sh deploy-scripts/deploy-live.sh
sh deploy-scripts/set-keys-live.sh \
  -e admin@localhost \
  -s MFRGGMJSGM \
  -k 95F1500EC4E85F6BEA36866050577C912331888013CDF4EE31C2F1A1FF4EC424 \
  -a FE6018116850FC3798ACA7B3FE4B11B24CEC9977BF5E27B192623027A0D80F53 \
  -l 87CA0214A0FBB75D3492D2028823C5941164E756D85CF3BD42113348E64DD951


=======


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
  -k 95F1500EC4E85F6BEA36866050577C912331888013CDF4EE31C2F1A1FF4EC424 \
  -a FE6018116850FC3798ACA7B3FE4B11B24CEC9977BF5E27B192623027A0D80F53 \
  -l 87CA0214A0FBB75D3492D2028823C5941164E756D85CF3BD42113348E64DD951

bash ./deploy-scripts/set-keys-local.sh \
  -e admin@localhost \
  -s MFRGGMJSGM \
  -k 95F1500EC4E85F6BEA36866050577C912331888013CDF4EE31C2F1A1FF4EC424 \
  -a FE6018116850FC3798ACA7B3FE4B11B24CEC9977BF5E27B192623027A0D80F53 \
  -l 87CA0214A0FBB75D3492D2028823C5941164E756D85CF3BD42113348E64DD951



deploy.sh:
sam package --output-template-file packaged.yaml --s3-bucket abc-backend-deploy-development
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name ABCBackendDevelopment2 --parameter-overrides environment=development






## 
sam local start-api --env-vars local-env-windows.json
sam local start-api --env-vars local-env-osx.json
sam local start-api --env-vars local-env-linux.json
