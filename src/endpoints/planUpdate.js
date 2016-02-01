const { ArgumentNullError } = require('common-errors');

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
 * @apiDescription Updates plan definition for non-activated plans.
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
 *     -d '{ "plan": { "name": "Updated name" } }'
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Updated:
 *  HTTP/1.1 200 OK
 *  { ... }
 */
exports.patch = {
  path: '/plans/:id',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function planUpdate(req, res, next) {
      const { id } = req.params;
      const plan = req.body;
      if (id === null || id === undefined) {
        return next(new ArgumentNullError('id'));
      }
      if (plan === null || plan === undefined) {
        return next(new ArgumentNullError('query'));
      }
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), { id, plan }, {timeout: getTimeout(ROUTE_NAME)})
        .then(updated => {
          res.send(config.models.Plan.transform(updated, true));
          return false;
        })
        .asCallback(next);
    },
  },
};
