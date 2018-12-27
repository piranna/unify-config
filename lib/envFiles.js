const {readFileSync, statSync} = require('fs')
const {dirname, extname, join} = require('path')

const {javascriptify, reduce_objectFromEntries} = require('./util')


module.exports = function(parsers = [])
{
  parsers = parsers.reduce(function(acum, [parse, ...extensions])
  {
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
  }, {})

  const loaders = Object.entries(parsers)
  .reduce(reduce_objectFromEntries, {})

  function multipleConfig(path)
  {
    return Object.entries(loaders).map(function([extension, loader])
    {
      return loader(join(path, `.env${extension}`))
    })
  }

  function nestedConfig()
  {
    const configs = []

    let dir = process.cwd()
    while(true)
    {
      configs.push(...multipleConfig(dir))

      if(dir === '/') break
      dir = dirname(dir)
    }

    return configs
  }

  function singleConfig(path)
  {
    const loader = loaders[extname(path)]
    if(!loader)
    {
      console.warn(`Loader not found for file ${path}`)
      return {}
    }

    return loader(path)
  }

  return function envFiles(path)
  {
    // nested config files
    if(!path) return nestedConfig()

    // config directory
    if(statSync(path).isDirectory()) return multipleConfig(path)

    // explict config file
    return [singleConfig(path)]
  }

  // function envFilesDefaults(path)
  // {
  //   // nested config files
  //   if(!path) return nestedConfig()
  //
  //   // config directory
  //   if(statSync(path).isDirectory()) return multipleConfig(path)
  //
  //   // explict config file
  //   return [singleConfig(`${path}.example${path}`)]
  // }
}
