sh db-init.sh


SOURCE=${BASH_SOURCE[0]}
while [ -L "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
  SOURCE=$(readlink "$SOURCE")
  [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )



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

bash $DIR/set-keys-local.sh \
    -e ${email} \
    -s ${secret} \
    -k ${admin} \
    -a ${app} \
    -l ${lookup}

