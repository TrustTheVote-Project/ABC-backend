#TODO, ensure $PROVISIONER_DEPLOY_VERSION is set, $PROVISIONER_DEPLOY_BUCKET is set
export PROVISIONER_ENV=provisioner-v$PROVISIONER_DEPLOY_VERSION
export PROVISIONER_STACK_NAME=ProvisionerV$PROVISIONER_DEPLOY_VERSION


# TODO, echo deployment envs
# confirm before continuing
echo Please confirm the following values before proceeding
echo PROVISIONER_DEPLOY_VERSION: $PROVISIONER_DEPLOY_VERSION
echo PROVISIONER_DEPLOY_BUCKET: $PROVISIONER_DEPLOY_BUCKET
echo PROVISIONER_ENV: $PROVISIONER_ENV
echo PROVISIONER_STACK_NAME: $PROVISIONER_STACK_NAME
echo ""
echo "Do you wish to continue deploying [y/n]"

read confirm_continue

if [ "$confirm_continue" = "y" ] || [ "$confirm_continue" = "Y" ]; then
  aws s3 mb s3://$PROVISIONER_DEPLOY_BUCKET
  sam validate
  sam build
  sam package --output-template-file packaged.yaml --s3-bucket $PROVISIONER_DEPLOY_BUCKET
  sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name $PROVISIONER_STACK_NAME --parameter-overrides environment=$PROVISIONER_ENV
  aws s3 sync ./docs s3://abc-documents-$PROVISIONER_ENV
  echo "Deployment complete"
else 
  echo "Deployment canceled"
fi
