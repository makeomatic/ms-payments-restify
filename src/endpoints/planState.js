const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planState';

/**
 * @api {patch} /plans/:id/state/:state Change state
 * @apiVersion 1.0.0
 * @apiName ChangePlanState
 * @apiGroup Plans
 * @apiPermission AdminPermission
 *
 * @apiDescription Shortcut to change plan state. State can be changed with update method as well.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {string} id Plan id.
 * @apiParam (Params) {string} state New state from list: created, active, inactive, deleted
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X PATCH
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans/state/P-94458432VR012762KRWBZEUA/active"
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Updated:
 *  HTTP/1.1 200 OK
 */
exports.patch = {
  path: '/plans/:id/state/:state',
  middleware: ['auth', 'admin'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), { id: req.params.id, state: req.params.state }, {timeout: getTimeout(ROUTE_NAME)})
        .then(plan => {
          res.send(200);
        })
        .asCallback(next);
    },
  },
};
