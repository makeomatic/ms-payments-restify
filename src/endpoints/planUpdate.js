const config = require('../config.js');
const ld = require('lodash');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planUpdate';

/**
 * @api {patch} /plans/:id Updates billing plan
 * @apiVersion 1.0.0
 * @apiName UpdatePlan
 * @apiGroup Plans
 * @apiPermission admin
 *
 * @apiDescription Returns the updated plan object.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} Plan Plan, according to plan schema.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X PATCH
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans/:id"
 *     -d '{ "op": "replace", "path": "/", "value": { "type": "fixed" } }'
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 * @apiUse PaymentRequiredError
 * @apiUse PreconditionFailedError
 *
 * @apiSuccessExample {json} Success-Updated:
 *  HTTP/1.1 200 OK
 *  { <plan object> }
 */
exports.patch = {
  path: '/plans/:id',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), { id: req.params.id, query: req.body }, {timeout: getTimeout(ROUTE_NAME)})
        .then(plan => {
          res.status(200).send(plan);
        })
        .asCallback(next);
    }
  }
};
