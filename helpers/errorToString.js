const errorToString = (errorArray) => {
  let msg = '';
  errorArray.array().forEach((err) => {
    msg = `${msg} ${err.msg} :::`;
  });
  return msg;
};

module.exports = errorToString;
