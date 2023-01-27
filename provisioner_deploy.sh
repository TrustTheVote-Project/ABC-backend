export AWS_PROFILE=abcbackenddeploy

#aws s3 mb s3://abc-backend-deploy-provisioner-v3-3-1
aws s3 mb s3://provisioner-assets-bucket

sam validate
sam build
sam package --output-template-file packaged.yaml --s3-bucket provisioner-assets-bucket
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name ProvisionerV3-3-1 --parameter-overrides environment=provisioner-v3-3-1
