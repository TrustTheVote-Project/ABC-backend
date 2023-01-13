#TODO, ensure $PROVISIONER_DEPLOY_VERSION is set
export PROVISIONER_ENV=provisioner-v$PROVISIONER_DEPLOY_VERSION
export PROVISIONER_DEPLOY_BUCKET=deploybucket-$PROVISIONER_ENV
export PROVISIONER_STACK_NAME=ProvisionerV$PROVISIONER_ENV

# TODO, echo deployment envs
# confirm before continuing

aws s3 mb s3://$PROVISIONER_DEPLOY_BUCKET
sam validate
sam build
sam package --output-template-file packaged.yaml --s3-bucket $PROVISIONER_DEPLOY_BUCKET
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-nam