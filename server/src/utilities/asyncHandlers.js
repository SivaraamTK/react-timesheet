// Wrap async route handlers with a function that catches errors
function asyncHandler(handler) {
  return function (req, res, next) {
    return handler(req, res, next).catch(next);
  };
}

module.exports = {
  asyncHandler,
};
