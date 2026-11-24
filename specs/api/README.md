# maiden api specification

openapi description of the http api provided by the maiden backend under `/api/v1`.

the canonical implementation of this api lives in `backend/`; this specification
can be used to generate clients libraries using tools such as [OpenAPI
Generator](https://openapi-generator.tech/).

routes outside of `/api/v1` such as static resources exposed under `/maiden` and
`/doc` are not part of this spec and subject to change.

## files

| file | purpose |
|------|---------|
| [openapi.yaml](openapi.yaml) | OpenAPI 3.0.3 document |

## server url

the default server in the spec is `http://127.0.0.1:5000` which corresponds to
address bound when running `maiden server` without an explicit address or port.
change the port (or host) to match your process, for example
`http://norns.local`.

## validate

lint with redocly:

```bash
npx @redocly/cli lint specs/api/openapi.yaml --extends=minimal
```

## generate a client

example typescript `fetch` client:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i specs/api/openapi.yaml \
  -g typescript-fetch \
  -o /tmp/maiden-api-ts
```

use `-g` to select another [generator](https://openapi-generator.tech/docs/generators).

**NOTE:** dust nested paths use `/api/v1/dust/{path}` with `allowReserved: true`
so `{path}` may contain `/` (for example `code/awake/awake.lua`). code
generators that honor `allowReserved` for that parameter should be used
otherwise the client author needs to handled encoding path segments and
assembling the final url.
