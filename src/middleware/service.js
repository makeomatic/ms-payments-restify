const Errors = require('common-errors');
const config = require('../config.js');
const jwt = require('jsonwebtoken');
const { payments } = config;

module.exports = function allowOnlyService(req, res, next) {
  jwt.verify(req.body, payments.serviceSecret, {
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
