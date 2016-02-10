const Errors = require('common-errors');
const config = require('../config.js');
const jwt = require('jsonwebtoken');
const { payments: { serviceSecret } } = config;

module.exports = function allowOnlyService(req, res, next) {
  const { body, log } = req;

  log.info('service input', body);

  jwt.verify(body, serviceSecret, {
    algorithms: ['HS512'],
    audience: 'service',
    issuer: 'cron',
    subject: 'perform_sync',
  }, function decodedToken(error, decoded) {
    if (error) {
      return next(new Errors.NotPermittedError('operation not permitted', error));
    }

    req.body = decoded;
    return next();
  });
};
