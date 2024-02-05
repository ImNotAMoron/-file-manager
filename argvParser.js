function getArguments() {
  const argsObject = {};
  const args = process.argv;
  args.filter((el) => el.startsWith("--")).map(el => {
    //const key = `${(el.split("=")[0])}`.substring(2);
    const [key, value] = el.split("=");
    argsObject[key.substring(2)] = el.split("=")[1];
  })
  return argsObject;
}

const args = getArguments();

export { args }
