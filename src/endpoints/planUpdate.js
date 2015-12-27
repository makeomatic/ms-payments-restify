// const config = require('../config.js');
// const { getRoute, getTimeout } = config;
// const ROUTE_NAME = 'planUpdate';

/**
 * @api {patch} /plans/:id Update plan
 * @apiVersion 1.0.0
 * @apiName UpdatePlan
 * @apiGroup Plans
 * @apiPermission AdminPermission
 *
 * @apiDescription Updates plan definition. Not implemented yet, always returns 505.
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
 *  { ... }
 */
exports.patch = {
  path: '/plans/:id',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function planUpdate(req, res, next) {
      res.send(505);
      return next(false);
      /*
      const { id } = req.params;
      const query = req.body;
      if (id === null || id === undefined) {
        return next(new Errors.ArgumentNullError('id'));
      }
      if (query === null || query === undefined) {
        return next(new Errors.ArgumentNullError('query'));
      }
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), { id, query }, {timeout: getTimeout(ROUTE_NAME)})
        .then(plan => {
          res.status(200).send(plan);
        })
        .asCallback(next);
      */
    },
  },
};
