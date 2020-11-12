const {readFileSync, statSync} = require('fs')
const {dirname, extname, join, parse} = require('path')

const {javascriptify} = require('./util')


const defaultParsers =
[
  [JSON.parse, '.json']
]


function multipleConfig(path, parsers)
{
  return Object.entries(parsers).map(function([extension, loader])
  {
    return loader(join(path, `.env${extension}`))
  })
}

function nestedConfig(dir, parsers)
{
  const configs = []

  while(true)
  {
    configs.push(...multipleConfig(dir, parsers))

    const parsed = parse(dir)
    if(parsed.dir === parsed.root) break
    dir = dirname(dir)
  }

  return configs
}

function reduce_parsers(acum, extensions)
{
  let parse

  if(extensions instanceof Function)
  {
    parse = extensions
    extensions = ['']
  }

  else
    [parse, ...extensions] = extensions

  function parser(path)
  {
    let data

    try
    {
      data = readFileSync(path, 'utf8')
    }
    catch(error)
    {
      if(error.code !== 'ENOENT') throw error

      return {}
    }

    return javascriptify(parse(data))
  }

  for(const extension of extensions)
    acum[extension] = parser

  return acum
}

function singleConfig(path, parsers)
{
  const loader = parsers[extname(path)]
  if(!loader)
  {
    console.warn(`Loader not found for file ${path}`)
    return {}
  }

  return loader(path)
}


module.exports = function(parsers = defaultParsers)
{
  parsers = parsers.reduce(reduce_parsers, {})

  return function envFiles(path = process.cwd())
  {
    // config directory
    if(statSync(path).isDirectory()) return nestedConfig(path, parsers)

    // explict config file
    return [singleConfig(path, parsers)]
  }

  // function envFilesDefaults(path = process.cwd())
  // {
  //   // config directory
  //   if(statSync(path).isDirectory()) return nestedConfig(path, parsers)
  //
  //   // explict config file
  //   return [singleConfig(`${path}.example${path}`, parsers)]
  // }
}
