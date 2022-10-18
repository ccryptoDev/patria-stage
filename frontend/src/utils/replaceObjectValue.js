export const replaceObjectValue = ({ object, keys, value, initObj }) => {
  // KEYS: ARRAY OF PARENT NODES: {person: {name: "John"}} - ["person", "name"]
  if (keys.length === 1) {
    // eslint-disable-next-line
    object[keys[0]] = value;
    return initObj;
  }
  // eslint-disable-next-line
  object = object[keys[0]];
  keys.shift();
  return replaceObjectValue({ object, keys, value, initObj });
};
