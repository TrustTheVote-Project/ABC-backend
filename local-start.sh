unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    *)          machine="UNKNOWN:${unameOut}"
esac
echo ${machine}

#Start local db

docker run -p 8000:8000 amazon/dynamodb-local &

#Seed data in local db:

sh db-init.sh

# sam local start-api --env-vars local-env-windows.json
# sam local start-api --env-vars local-env-osx.json
# sam local start-api --env-vars local-env-linux.json

case "$machine" in
   "Linux") sam local start-api --env-vars local-env-linux.json
   ;;
   "Mac") sam local start-api --env-vars local-env-osx.json 
   ;;
   "Cygwin") sam local start-api --env-vars local-env-windows.json 
   ;;
esac