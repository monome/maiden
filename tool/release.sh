#!/bin/bash

# quick and dirty release script
REL_DIR=./dist/maiden

rm -rf ./dist
mkdir -pv $REL_DIR

# maiden
echo -e "building maiden"
echo "====================="
cmd='GOOS=linux GOARCH=arm go build -o maiden.arm'
echo $cmd
eval $cmd
cp -v maiden.arm $REL_DIR
cp -v tool/start.sh $REL_DIR

# app
echo -e "\nbuilding app"
echo "====================="
cmd='(cd web; yarn install && yarn build)'
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
