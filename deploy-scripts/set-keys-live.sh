
# sh db-init.sh

# -e admin email address
# -s secret MFA secret
# -k admin KEY
# -a
# -l lookup KEY

#TODO, ensure $PROVISIONER_DEPLOY_VERSION is set, $PROVISIONER_DEPLOY_BUCKET is set
export PROVISIONER_ENV=provisioner-v$PROVISIONER_DEPLOY_VERSION
export PROVISIONER_STACK_NAME=ProvisionerV$PROVISIONER_DEPLOY_VERSION

# TODO, echo deployment envs
# confirm before continuing
echo Please confirm the following values before proceeding
echo PROVISIONER_DEPLOY_VERSION: $PROVISIONER_DEPLOY_VERSION
echo PROVISIONER_ENV: $PROVISIONER_ENV
echo ""
echo "Do you wish to continue setting auth keys [y/n]"

read confirm_continue

if [ "$confirm_continue" = "y" ] || [ "$confirm_continue" = "Y" ]; then
    while getopts e:s:k:a:l: flag
    do
        case "${flag}" in
            e) email=${OPTARG};;
            s) secret=${OPTARG};;
            k) admin=${OPTARG};;
            a) app=${OPTARG};;
            l) lookup=${OPTARG};;
        esac
    done

    echo "secret: $secret";
    # echo "admin key: $admin";
    # echo "app key: $app";
    # echo "lookup key: $lookup";

    aws dynamodb batch-write-item \
    --request-items "{ \
        \"abc_application_$PROVISIONER_ENV\": [{ \
            \"PutRequest\": { \
                \"Item\": { \
                    \"applicationAttribute\": { \
                        \"S\": \"AdminEmail\" \
                    }, \
                    \"attributeValue\": { \
                        \"S\": \"$email\" \
                    } \
                } \
            } \
        }] \
    }" \
    --output json --no-paginate

    #  --endpoint-url http://localhost:8000  \
    
    aws dynamodb batch-write-item \
    --request-items "{ \
        \"abc_application_$PROVISIONER_ENV\": [{ \
            \"PutRequest\": { \
                \"Item\": { \
                    \"applicationAttribute\": { \
                        \"S\": \"AuthenticatorSecret\" \
                    }, \
                    \"attributeValue\": { \
                        \"S\": \"$secret\" \
                    } \
                } \
            } \
        }] \
    }" \
    --output json --no-paginate

    aws dynamodb batch-write-item \
    --request-items "{ \
        \"abc_application_$PROVISIONER_ENV\": [{ \
            \"PutRequest\": { \
                \"Item\": { \
                    \"applicationAttribute\": { \
                        \"S\": \"AdminAPIKey\" \
                    }, \
                    \"attributeValue\": { \
                        \"S\": \"$admin\" \
                    } \
                } \
            } \
        }] \
    }" \
    --output json --no-paginate


    aws dynamodb batch-write-item \
    --request-items "{ \
        \"abc_application_$PROVISIONER_ENV\": [{ \
            \"PutRequest\": { \
                \"Item\": { \
                    \"applicationAttribute\": { \
                        \"S\": \"AppAPIKey\" \
                    }, \
                    \"attributeValue\": { \
                        \"S\": \"$app\" \
                    } \
                } \
            } \
        }] \
    }" \
    --output json --no-paginate


    aws dynamodb batch-write-item \
    --request-items "{ \
        \"abc_application_$PROVISIONER_ENV\": [{ \
            \"PutRequest\": { \
                \"Item\": { \
                    \"applicationAttribute\": { \
                        \"S\": \"LookupAPIKey\" \
                    }, \
                    \"attributeValue\": { \
                        \"S\": \"$lookup\" \
                    } \
                } \
            } \
        }] \
    }" \
    --output json --no-paginate
else
    echo "Set-keys canceled"
fi

