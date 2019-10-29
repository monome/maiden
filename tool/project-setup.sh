#!/bin/bash

DATA_DIR=~/dust/data
INST_DIR=~/maiden

# setup source and catalog dirs
mkdir -pv $DATA_DIR/sources
mkdir -pv $DATA_DIR/catalogs

# copy initial contents; ignoring failures
set +e
cp -v $INST_DIR/dist/sources/*.json $DATA_DIR/sources/
cp -v $INST_DIR/dist/catalogs/*.json $DATA_DIR/catalogs/
set -e
