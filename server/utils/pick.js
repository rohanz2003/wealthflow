function pick(obj, keys) {
  const result = {};
  if (!obj || typeof obj !== 'object') return result;
  keys.forEach((k) => {
    if (obj[k] !== undefined) result[k] = obj[k];
  });
  return result;
}

module.exports = pick;
