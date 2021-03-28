#!/bin/bash

set -e

# quick and dirty release script
REL_DIR=./dist/maiden

rm -rf ./dist
mkdir -pv $REL_DIR

# maiden
echo -e "building maiden"
echo "====================="
cmd='GOOS=linux GOARCH=arm go build -o $REL_DIR/maiden'
echo $cmd
eval $cmd
# for compatibility with old systemd unit setup
cp -v tool/start.sh $REL_DIR
cp -v tool/project-setup.sh $REL_DIR
cp -v maiden.yaml $REL_DIR

# sources
mkdir -pv $REL_DIR/dist/sources/
cp -v sources/*.json $REL_DIR/dist/sources/

# app
echo -e "\nbuilding app"
echo "====================="
cmd='(cd web; rm -rf build && yarn install && yarn build)'
echo $cmd
eval $cmd
mkdir -pv ${REL_DIR}/app
cp -rv ./web/build ${REL_DIR}/app

# tarball
echo -e "\nmaking release"
echo "====================="
cmd='(cd ./dist; tar czvf maiden.tgz maiden)'
echo $cmd
eval $cmd
