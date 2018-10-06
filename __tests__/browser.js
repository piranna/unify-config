const config = require('../browser')


test('parse values', function()
{
  const env = {
    blah: 2,
    env: 'environment',
    foo: true
  }

  const result = config({env})

  expect(result).toMatchObject({blah: 2, env: 'environment', foo: true})
})

test('JSON in argv', function()
{
  const env = {
    blah: 2,
    env: 'environment'
  }

  const result = config({
    argv: ['--blah={"foo":"boop"}'],
    env
  })

  expect(result).toMatchObject({blah: {foo: 'boop'}, env: 'environment'})
})
