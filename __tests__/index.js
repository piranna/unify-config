const {resolve} = require('path')

const config = require('..')


beforeEach(function()
{
  const {env} = process

  delete env.blah
  delete env.env
  delete env.foo
})


test('update `process.env`', function()
{
  const {env} = process

  config(['--blah'], {path: resolve(__dirname, 'fixtures', 'env')})

  expect(env).toMatchObject({blah: 'true', env: 'environment', foo: 'true'})
})

test('parse values', function()
{
  const {env} = process

  const result = config({path: resolve(__dirname, 'fixtures', 'env')})

  expect(env).toMatchObject({blah: '2', env: 'environment', foo: 'true'})
  expect(result).toMatchObject({blah: 2, env: 'environment', foo: true})
})
