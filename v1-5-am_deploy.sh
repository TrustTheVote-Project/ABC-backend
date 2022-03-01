export AWS_PROFILE=abcbackenddeploy
#unset AWS_PROFILE

aws s3 mb s3://abc-backend-deploy-development-v1-5-am

sam validate
sam build
sam package --output-template-file packaged.yaml --s3-bucket abc-backend-deploy-development-v1-5-am
sam deploy --template-file packaged.yaml --capabilities CAPABILITY_IAM --stack-name ABCBackendDevelopmentv1-5-am --parameter-overrides environment=development-v1-5-am

aws s3 sync ./docs s3://abc-documents-development-v1-5-am