const errorToString = (errorArray) => {
  let msg = '';
  console.log(errorArray);
  errorArray.forEach((err) => {
    msg = `${msg} ${err.msg} :::`;
  });
  return msg;
};

module.exports = errorToString;
