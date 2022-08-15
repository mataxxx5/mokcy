export default () => {
  let resolver;
  return [
      new Promise((resolve, reject) => {
          resolver = resolve;
      }),
      resolver,
  ];
};