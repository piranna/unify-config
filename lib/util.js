function reduce_objectFromEntries(acum, [key, value])
{
  acum[key] = value

  return acum
}


exports.reduce_objectFromEntries = reduce_objectFromEntries
