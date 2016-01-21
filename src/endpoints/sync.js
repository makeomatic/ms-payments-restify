const config = require('../config.js');
const { getRoute } = config;
const ROUTE_NAME = 'agreementSync';

exports.post = {
  path: '/sync',
  middleware: ['service'],
  handlers: {
    '1.0.0': function sync(req, res, next) {
      return req.amqp
        .publish(getRoute(ROUTE_NAME), req.body, { confirm: true, mandatory: true, deliveryMode: 2 })
        .then(() => {
          res.send('OK');
          return false;
        })
        .asCallback(next);
    },
  },
};
