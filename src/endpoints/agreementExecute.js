const config = require('../config.js');
const Errors = require('common-errors');

const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'agreementExecute';

/**
 * @param  {AMQPTransport} amqp
 * @param  {String} token
 * @return {Promise}
 */
function execute(amqp, token) {
  return amqp.publishAndWait(getRoute(ROUTE_NAME), { token }, { timeout: getTimeout(ROUTE_NAME) });
}

/**
 * @api {post} /agreements/:token/execute Execute agreement
 * @apiVersion 1.0.0
 * @apiName ExecuteAgreement
 * @apiGroup Agreements
 * @apiPermission none
 *
 * @apiDescription Executes billing agreement. Agreement must be created via create method first and approved by user.
 * This is generally not used by the public, but, instead called internally on the return url specified by the agreement,
 * which was created prior to calling this URL
 *
 * @apiParam (Params) {string} token Token, returned from agreement create method.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST \
 *     -H 'Accept-Version: *' \
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/payments/agreements/EC-0JP008296V451950C/execute"
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 *
 * @apiSuccessExample {json} Success-Executed:
 *   HTTP/1.1 204 No Content
 */
exports.post = {
  path: '/agreements/:token/execute',
  handlers: {
    '1.0.0': (req, res, next) => {
      const { token } = req.params;

      if (!token) {
        return next(new Errors.ArgumentNullError('token'));
      }

      return execute(req.amqp, token).then(() => {
        res.send(204);
      })
      .asCallback(next);
    },
  },
};

/**
 * Executes agreement with a passed token
 * @public
 * @type {Function}
 */
exports.execute = execute;
