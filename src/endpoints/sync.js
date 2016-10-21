const config = require('../config.js');

const { getRoute } = config;
const ROUTE_NAME = 'agreementSync';

/**
 * @api {post} /sync launches billing sync
 * @apiVersion 1.0.0
 * @apiName Sync
 * @apiGroup Sync
 * @apiPermission Service
 *
 * @apiDescription Allows user to see their transactions or admin to see all transactions in system.
 * Body must be provided as JWT encoded string with valid signature
 *
 * @apiParam (Query) {Number{0..}} [offset] how many objects to skip
 * @apiParam (Query) {Number{1..100}} [limit] how many objects to return per page
 * @apiParam (Query) {String} [filter] `encodeURIComponent(JSON.stringify(filterObject))`, pass it as value.
 * @apiParam (Query) {String} [sortBy] `encodeURIComponent(sortBy)`
 * @apiParam (Query) {String="ASC","DESC"} [order] sorting order, defaults to "ASC", case-insensitive
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X GET \
 *     -H 'Accept-Version: *' \
 *     -H 'Accept: application/vnd.api+json' \
 *     -H 'Accept-Encoding: gzip, deflate' \
 *     "https://api-sandbox.cappacity.matic.ninja/api/payments/sync"
 *
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success:
 *   HTTP/1.1 202 Accepted
 */
exports.post = {
  path: '/sync',
  middleware: ['service'],
  handlers: {
    '1.0.0': function sync(req, res, next) {
      return req.amqp
        .publish(getRoute(ROUTE_NAME), req.body, { confirm: true, mandatory: true })
        .then(() => {
          res.send(202);
          return false;
        })
        .asCallback(next);
    },
  },
};
