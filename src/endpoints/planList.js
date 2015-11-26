const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planList';

/**
 * @api {get} / List available billing plans
 * @apiVersion 1.0.0
 * @apiName ListPlans
 * @apiGroup Plans
 * @apiPermission user, admin
 *
 * @apiDescription Returns array of plan objects.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} Plan list query, according to query schema.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X GET
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans"
 *     -d '{ "status": "active" }'
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 * @apiUse PaymentRequiredError
 * @apiUse PreconditionFailedError
 *
 * @apiSuccessExample {json} Success:
 *   HTTP/1.1 200 OK
 *   [{ <plan object> }]
 */
exports.get = {
  path: '/',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), { query: req.body, hidden: req.user.isAdmin() }, {timeout: getTimeout(ROUTE_NAME)})
        .then(plans => {
          res.status(200).send(plans);
        })
        .asCallback(next);
    }
  }
};
