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
for each one. You can also define `aliases`, for example to map environment
variables to your app arguments. Your config will return parsed as Javascript
objects by using [string2js](https://github.com/piranna/string2js) module.

- *aliases*: object mapping from source attribute names to destination ones.
  Destination can be a function too to calc the value to be used, if return an
  object then it will map its attributes recursively.
- *argv*: array where to fetch the CLI arguments. If not defined, it will fetch
  them from `process.argv.slice(2)`
- *env*: object holding environment variables. Default: `process.env`
- *parsers*: array for dotenv files. Each one is an array, being first index a
  parser function and the other ones the file extensions. Any function that
  accept a string as only argument and return an object like `JSON.parse()` can
  be used as parser. It can also be set directly as the `parsers` value or to
  the parser array entry, and will be used for no extension files. Default:
  `JSON.parse()` using files with `.json` extension.
- *path*: path of the dotenv files or directory holding them

```js
const unifyConfig = require('unify-config')

const {parse: dotenv} = require('dotenv')
const {parse: ini}    = require('ini')
const json5           = require('json5/lib/parse')
const {load: yaml}    = require('js-yaml/lib/js-yaml/loader')
const {parse: toml}   = require('toml')

const config = unifyConfig({
  aliases: {
    GITHUB_REPOSITORY: function(value)
    {
      const [user, repo] = value.split('/')

      return {repo, user}
    },
    GITHUB_TOKEN: 'auth'
  },
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

## Known `.env` files parsers

- [dotenv](https://github.com/motdotla/dotenv)
- [JSON](https://www.json.org/)
- [JSON5](https://json5.org/)
- [TOML](https://github.com/toml-lang/toml)
- [YAML](http://yaml.org/).
