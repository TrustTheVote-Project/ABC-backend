
# sh db-init.sh

# -e admin email address
# -s secret MFA secret
# -k admin KEY
# -a
# -l lookup KEY

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


