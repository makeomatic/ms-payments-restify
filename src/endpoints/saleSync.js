const config = require('../config.js');
const { getRoute } = config;
const validator = require('../validator.js');
const ROUTE_NAME = 'saleSync';

/**
 * @api {post} /sale/sync Sync payments
 * @apiVersion 1.0.0
 * @apiName saleSync
 * @apiGroup Sync
 * @apiPermission Service
 *
 * @apiDescription Synchronizes transactions for a single agreement with PayPal.
 * Should be used to determine when to reset monthly limits primarily.
 * Body must be provided as JWT encoded string with valid signature
 *
 * @apiParam (Params) {Object} data Data container.
 * @apiParam (Params) {String="sale"} data.type Data type, must be 'sale'.
 * @apiParam (Params) {Object} data.attributes sync details.
 * @apiParam (Params) {String} data.attributes.next_id iterate starting with this id
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/payments/sale/sync" -d 'contentsofjwttoken'
 *
 * @apiUse ValidationError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success:
 *  HTTP/1.1 202 Accepted
 */
exports.post = {
  path: '/sale/sync',
  middleware: ['service'],
  handlers: {
    '1.0.0': function saleSync(req, res, next) {
      return validator.validate('sale.sync', req.body)
        .then(body => {
          const nextId = body.data.attributes.next_id;
          const message = nextId ? { next_id: nextId } : {};

          return req.amqp.publish(getRoute(ROUTE_NAME), message, { confirm: true, mandatory: true });
        })
        .then(() => {
          res.send(202);
          return false;
        })
        .asCallback(next);
    },
  },
};
