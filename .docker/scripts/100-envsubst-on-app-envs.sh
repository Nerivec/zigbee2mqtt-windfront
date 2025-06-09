#!/usr/bin/env sh

set -ex

# find the file with the template envs
envs=$(ls -t /usr/share/nginx/html/assets/envs*.js | head -n1)

envsubst < "$envs" > ./envs_temp
cp ./envs_temp "$envs"
rm ./envs_temp
