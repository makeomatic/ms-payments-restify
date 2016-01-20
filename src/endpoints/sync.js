const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'agreementSync';

exports.post = {
  path: '/sync',
  middleware: ['service'],
  handlers: {
    '1.0.0': function sync(req, res, next) {
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), req.body, { timeout: getTimeout(ROUTE_NAME) })
        .then(response => {
          res.send(response);
          return false;
        })
        .asCallback(next);
    },
  },
};
