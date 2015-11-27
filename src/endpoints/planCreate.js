const config = require('../config.js');
const ld = require('lodash');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planCreate';

/**
 * @api {post} / Creates new PayPal billing plan
 * @apiVersion 1.0.0
 * @apiName CreatePlan
 * @apiGroup Plans
 * @apiPermission admin
 *
 * @apiDescription Returns new plan object. If hidden is true, hides plan from regular users, allowing it to be used by admins on special occasions.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} Plan must suffice to plan schema and include correct return and cancel urls.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans"
 *     -d '{ "hidden": false, "alias": "mega-plan", "plan": <plan object> }'
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 * @apiUse PaymentRequiredError
 * @apiUse PreconditionFailedError
 *
 * @apiSuccessExample {json} Success-Created:
 *  HTTP/1.1 201 Created
 *  Location: https://api.sandbox.paypal.com/v1/payments/billing-plans/P-94458432VR012762KRWBZEUA
 *  { <plan object> }
 */
exports.post = {
  path: '/',
  middleware: ['auth', 'admin'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), req.body, {timeout: getTimeout(ROUTE_NAME)})
        .then(plan => {
          res.setHeader('Location', ld.findWhere(plan.links, {rel: 'self'}));
          res.status(302).send(plan);
        })
        .asCallback(next);
    },
  },
};
