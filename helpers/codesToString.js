let msg = '';
const codesToString = async (controller, arr) => {
  const recurseProcessLeave = async () => {
    if (controller < arr.length) {
      msg = `${msg} ${arr[controller]} ::`;
      codesToString(controller + 1, arr);
    }
  };
  await recurseProcessLeave(controller, arr);
  return msg;
};

module.exports = codesToString;
