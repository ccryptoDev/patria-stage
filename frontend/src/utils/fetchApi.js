export const promise = function fetchApi(api) {
  return new Promise((resolve, reject) => {
    const res = api();
    if (res && !res.error) {
      resolve(res);
    } else {
      reject(new Error(res.error));
    }
  });
};
