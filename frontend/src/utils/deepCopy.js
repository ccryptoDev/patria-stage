export function deepCopy(obj) {
  if (typeof obj === "object" && obj !== null) {
    return Object.keys(obj)
      .map((k) => ({ [k]: deepCopy(obj[k]) }))
      .reduce((a, c) => Object.assign(a, c), {});
  }
  if (Array.isArray(obj)) {
    return obj.map(deepCopy);
  }
  return obj;
}
