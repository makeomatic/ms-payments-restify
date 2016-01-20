const Errors = require('common-errors');
const jwt = require('jsonwebtoken');

module.exports = function allowOnlyService(req, res, next) {
  jwt.verify(req.body, 'megasecret', {
    algorithms: ['HS512', 'RS512'],
    audience: 'service',
    issuer: 'cron',
    subject: 'perform_sync',
  }, function(error, decoded) {
    if (error) {
      return next(new Errors.NotPermittedError('operation not permitted', error));
    }
    req.body = decoded;
    return next();
  });
};
