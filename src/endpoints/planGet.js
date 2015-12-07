const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planGet';

/**
 * @api {get} /plans/:id Get plan
 * @apiVersion 1.0.0
 * @apiName getPlan
 * @apiGroup Plans
 * @apiPermission UserPermission
 *
 * @apiDescription Get billing plan data by id.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {string} id Plan id from list or create method.
 *
 * @apiExample {curl} Example usage:
 *   curl -i
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans/P-94458432VR012762KRWBZEUA"
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Deleted:
 *  HTTP/1.1 200 OK
 *  { <plan data> }
 */
exports.get = {
  path: '/plans/:id',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), req.params.id, {timeout: getTimeout(ROUTE_NAME)})
        .then(plan => {
          res.status(200).send(plan);
        })
        .asCallback(next);
    },
  },
};
