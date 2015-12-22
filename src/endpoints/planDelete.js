const Errors = require('common-errors');

const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planDelete';

/**
 * @api {delete} /plans/:id 3. Delete plan
 * @apiVersion 1.0.0
 * @apiName deletePlan
 * @apiGroup Plans
 * @apiPermission AdminPermission
 *
 * @apiDescription Deletes billing plan by id.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {string} id Plan id from list or create method.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X DELETE
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
 */
exports.del = {
  path: '/plans/:id',
  middleware: ['auth', 'admin'],
  handlers: {
    '1.0.0': (req, res, next) => {
      const { id } = req.params;
      if (id === null || id === undefined) {
        return next(new Errors.ArgumentNullError('id'));
      }
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), id, {timeout: getTimeout(ROUTE_NAME)})
        .then(() => {
          res.send(200);
        })
        .asCallback(next);
    },
  },
};
