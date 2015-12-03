const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planDelete';

/**
 * @api {delete} /plans/:id Deletes PayPal billing plan
 * @apiVersion 1.0.0
 * @apiName deletePlan
 * @apiGroup Plans
 * @apiPermission admin
 *
 * @apiDescription Returns nothing.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} Plan, according to plan schema.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X DELETE
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans/P-94458432VR012762KRWBZEUA"
 *     -d '{ <plan object> }'
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 * @apiUse PaymentRequiredError
 * @apiUse PreconditionFailedError
 *
 * @apiSuccessExample {json} Success-Deleted:
 *  HTTP/1.1 200 OK
 */
exports.del = {
  path: '/plans/:id',
  middleware: ['auth', 'admin'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), req.params.id, {timeout: getTimeout(ROUTE_NAME)})
        .then(() => {
          res.send(200);
        })
        .asCallback(next);
    },
  },
};
