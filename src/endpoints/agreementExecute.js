const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'agreementExecute';
const Errors = require('common-errors');

/**
 * @api {post} /agreements/:token/execute Execute agreement
 * @apiVersion 1.0.0
 * @apiName ExecuteAgreement
 * @apiGroup Agreements
 * @apiPermission UserPermission
 *
 * @apiDescription Executes billing agreement. Agreement must be created via create method first and approved by user.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {string} token Token, returned from create/list method.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/agreements/EC-0JP008296V451950C/execute"
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

      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), { token }, { timeout: getTimeout(ROUTE_NAME) })
        .then(() => {
          res.send(204);
        })
        .asCallback(next);
    },
  },
};
