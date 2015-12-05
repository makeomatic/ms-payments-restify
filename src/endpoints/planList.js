const ROUTE_NAME = 'planList';
const { createRequest, createResponse } = require('../listUtils');

/**
 * @api {get} /plans List plans
 * @apiVersion 1.0.0
 * @apiName ListPlans
 * @apiGroup Plans
 * @apiPermission UserPermission
 *
 * @apiDescription Returns array of plan objects.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} query list query, according to query schema.
 *
 * @apiSuccess (200) {Object[]} plans List of available plans, depending on user permission level.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X GET
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans"
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 *
 * @apiSuccessExample {json} Success:
 *   HTTP/1.1 200 OK
 *   [{ <plan object> }]
 */
exports.get = {
  path: '/plans',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return createRequest(req, ROUTE_NAME)
        .spread(createResponse(res))
        .then((plans) => { res.send(plans); })
        .asCallback(next);
    },
  },
};
