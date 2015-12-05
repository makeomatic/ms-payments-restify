const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planUpdate';

/**
 * @api {patch} /plans/:id Update plan
 * @apiVersion 1.0.0
 * @apiName UpdatePlan
 * @apiGroup Plans
 * @apiPermission AdminPermission
 *
 * @apiDescription Updates plan definition.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {string} id Plan id.
 * @apiParam (Params) {object} plan Any updates to plan schema.
 *
 * @apiSuccess (200) {Object} plan Updated plan.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X PATCH
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans/:id"
 *     -d '{ "op": "replace", "path": "/", "value": { "type": "fixed" } }'
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
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
