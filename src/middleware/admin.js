const Errors = require('common-errors');
const ld = require('lodash');

module.exports = function allowOnlyAdmin(req, res, next) {
  const { user } = req.user;

  if (ld.isEmpty(user)) {
    return next(new Errors.HttpStatusError(401, 'authorization required'));
  }

  if (!user.isAdmin()) {
    return next(new Errors.HttpStatusError(403, 'access denied'));
  }

  next();
};
