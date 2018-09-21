[![Build Status](https://travis-ci.org/UnifyMe/config.svg?branch=master)](https://travis-ci.org/UnifyMe/config)
[![Coverage Status](https://coveralls.io/repos/github/UnifyMe/config/badge.svg?branch=master)](https://coveralls.io/github/UnifyMe/config?branch=master)

# unify-config
Unify config from `package.json` (both caller modules and project root), `.env`
files, environment variables and CLI arguments.

## Install

```sh
npm install unify-config
```

## APi

### config([options])

`config()` will pick your config from the `config` field on your `package.json`
file, your environment variables and your CLI arguments, and you can also set a
`parsers` option to parse `.env` files and what extensions they should be used
for each one. Your config will retured parsed as Javascript objects by using
[string2js](https://github.com/piranna/string2js) module.

- *argv*: array where to fetch the CLI arguments. If not defined, it will fetch
  them from `process.argv.slice(2)`
- *env*: object holding environment variables. Default: `process.env`
- *parsers*: array for dotenv files. Each one is an array, being first index a
  loader function and the other ones the file extensions. Default: none
- *path*: path of the dotenv files or directory holding them

```js
const {parse: dotenv} = require('dotenv')
const {parse: ini}    = require('ini')
const json5           = require('json5/lib/parse')
const {load: yaml}    = require('js-yaml/lib/js-yaml/loader')
const {parse: toml}   = require('toml')

const args = config({
  parsers: [
    [dotenv, ''],  // `dotenv` don't have an extension
    [ini   , '.ini'],
    [json5 , '.json', '.json5'],
    [toml  , '.toml'],
    [yaml  , '.yaml', '.yml']
  ]
})
```

### config.bindEnv([options])

Like `config()`, but also sets the parsed values to the provided `env` object
(or `process.env` if none is provided). Options are the same of `config()`.

## Available `.env` files formats

- [dotenv](https://github.com/motdotla/dotenv)
- [JSON](https://www.json.org/)
- [JSON5](https://json5.org/)
- [TOML](https://github.com/toml-lang/toml)
- [YAML](http://yaml.org/).
