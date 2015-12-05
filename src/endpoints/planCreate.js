const config = require('../config.js');
const ld = require('lodash');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planCreate';

/**
 * @api {post} /plans Create plan
 * @apiVersion 1.0.0
 * @apiName CreatePlan
 * @apiGroup Plans
 * @apiPermission AdminPermission
 *
 * @apiDescription
 * Returns new plan object.
 * If hidden is true, hides plan from regular users, allowing it to be used by admins on special occasions.
 *
 * @apiSuccess (201) {object} plan Plan object as returned from PayPal with additional fields like id.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {boolean} hidden Hides plan from users.
 * @apiParam (Params) {string} alias Readable name for plan, mostly for admin usage.
 * @apiParam (Params) {object} plan Plan object, according to schema.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans"
 *     -d '{ "hidden": false, "alias": "mega-plan", "plan": <plan object> }'
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Created:
 *  HTTP/1.1 201 Created
 *  Location: https://api.sandbox.paypal.com/v1/payments/billing-plans/P-94458432VR012762KRWBZEUA
 *  { <plan object> }
 */
exports.post = {
  path: '/plans',
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
