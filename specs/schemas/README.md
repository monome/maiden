# maiden json schemas

the json schemas in this directory describe format for json files used by the maiden catalog feature.

## schemas

| file | description |
|------|-------------|
|[source.schema.json](source.schema.json)| describes to location of were a catalog can be downloaded |
|[catalog.schema.json](catalog.schema.json)| describes a set of scripts which can be installed on device along with download location and metadata|

## usage

`maiden` reads the "source" config files which live under `dust/data/sources/`
in order to learn where catalog updates can be downloaded. when a catalog is
downloaded/updated via the [maiden api](../api/openapi.yaml) the resulting files
are placed under `dust/data/catalogs`. `maiden` itself does not use the schemas
to validate file contents at runtime. currently the only usage of the schema
files are to validate changes to the
[norns-community](https://github.com/monome/norns-community) repository.
