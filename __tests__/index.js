const {resolve} = require('path')

const {parse: dotenv} = require('dotenv')

const config = require('..')


const parsers =
[
  [dotenv, '']
]


beforeEach(function()
{
  const {env} = process

  delete env.blah
  delete env.env
  delete env.foo
  delete env.npm_package_config_foo
})


test('parse values', function()
{
  const {env} = process

  env.npm_package_config_foo = true

  const result = config({
    parsers,
    path: resolve(__dirname, 'fixtures', 'env')
  })

  expect(result).toMatchObject({blah: 2, env: 'environment', foo: true})
})

test('update `process.env`', function()
{
  const {env} = process

  env.npm_package_config_foo = true

  const result = config.bindEnv({
    parsers,
    path: resolve(__dirname, 'fixtures', 'env')
  })

  expect(env).toMatchObject({blah: '2', env: 'environment', foo: 'true'})
})

test('update object & no files parsers', function()
{
  const env = {}

  process.argv.length = 2

  const result = config.bindEnv({
    env,
    path: resolve(__dirname, 'fixtures', 'env')
  })

  expect(env).toEqual({_: []})
})

test('argv overwrite', function()
{
  const {env} = process

  config.bindEnv({
    argv: ['--blah'],
    parsers,
    path: resolve(__dirname, 'fixtures', 'env')
  })

  expect(env).toMatchObject({blah: 'true', env: 'environment'})
})
