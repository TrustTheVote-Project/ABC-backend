sh db-init.sh

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

bash .set-keys-local.sh \
    -e ${email} \
    -s ${secret} \
    -k ${admin} \
    -a ${app} \
    -l ${lookup}

