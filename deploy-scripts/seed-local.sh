
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
    \"abc_application_local\": [{ \
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
  --endpoint-url http://localhost:8000  \
  --output json --no-paginate

aws dynamodb batch-write-item \
  --request-items "{ \
    \"abc_application_local\": [{ \
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
  --endpoint-url http://localhost:8000  \
  --output json --no-paginate

aws dynamodb batch-write-item \
  --request-items "{ \
    \"abc_application_local\": [{ \
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
  --endpoint-url http://localhost:8000  \
  --output json --no-paginate


aws dynamodb batch-write-item \
  --request-items "{ \
    \"abc_application_local\": [{ \
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
  --endpoint-url http://localhost:8000  \
  --output json --no-paginate


aws dynamodb batch-write-item \
  --request-items "{ \
    \"abc_application_local\": [{ \
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
  --endpoint-url http://localhost:8000  \
  --output json --no-paginate

# aws dynamodb scan --table-name abc_application_local --endpoint-url http://localhost:8000  --output json --no-paginate

