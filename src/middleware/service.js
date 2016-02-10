const Errors = require('common-errors');
const config = require('../config.js');
const jwt = require('jsonwebtoken');

module.exports = function allowOnlyService(req, res, next) {
  const { body } = req;

  jwt.verify(body, config.payments.serviceSecret, {
    algorithms: ['HS512'],
    audience: 'service',
    issuer: 'cron',
    subject: 'perform_sync',
  }, function decodedToken(error, decoded) {
    if (error) {
      return next(new Errors.NotPermittedError(`Error with token: ${body}`, error));
    }

    req.body = decoded;
    return next();
  });
};
