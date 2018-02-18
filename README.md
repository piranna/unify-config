[![Build Status](https://travis-ci.org/UnifyMe/config.svg?branch=master)](https://travis-ci.org/UnifyMe/config)
[![Coverage Status](https://coveralls.io/repos/github/UnifyMe/config/badge.svg?branch=master)](https://coveralls.io/github/UnifyMe/config?branch=master)

# config
Unify config from `package.json`, `.env` file, environment variables and argv

## Install

```sh
npm install config
```

## Usage

```js
config()
```

Automatically it'll pick your config from the `config` hash on your
`package.json` file, your project `.env` file, your environment variables and
your CLI arguments. Your config will be available at `process.env` as string
environment variables, if you want them parsed instead you can get the returned
value of the `config()` call:

```js
const args = config()
```

## APi

### config([argv], [options])

- *argv*: array where to fetch the CLI arguments. If not defined, it will fetch
  them from `process.argv.slice(2)`
- *options*: options passed to `dotenv`
