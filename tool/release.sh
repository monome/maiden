#!/bin/bash

set -e

# quick and dirty release script

help() {
      echo "Provide the following build arguments:"
      echo " -o   operating system for GOOS"
      echo " -a   architecture for GOARCH"
}

while getopts ":o:a:" opt; do
  case ${opt} in
    o) GOOS=$OPTARG ;;
    a) GOARCH=$OPTARG ;;
    \? )
      echo "Invalid Option: -$OPTARG" 1>&2
      help
      exit 1
      ;;
    : )
      echo "Invalid Option: -$OPTARG requires an argument" 1>&2
      help
      exit 1
      ;;
  esac
done

REL_DIR=./dist/maiden

rm -rf ./dist
mkdir -pv $REL_DIR

# maiden
echo -e "building maiden"
echo "====================="
cmd="GOOS=$GOOS GOARCH=$GOARCH go build -ldflags='${GO_LDFLAGS}' -o $REL_DIR/maiden"
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
