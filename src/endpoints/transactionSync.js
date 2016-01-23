const config = require('../config.js');
const { getRoute } = config;
const validator = require('../validator.js');
const ROUTE_NAME = 'transactionSync';

/**
 * @api {post} /transactions/sync Sync transactions
 * @apiVersion 1.0.0
 * @apiName SyncTransactions
 * @apiGroup Sync
 * @apiPermission Service
 *
 * @apiDescription Synchronizes transactions for a single agreement with PayPal.
 * Should be used to determine when to reset monthly limits primarily. Body must be provided
 * as JWT encoded string with valid signature
 *
 * @apiParam (Params) {Object} data Data container.
 * @apiParam (Params) {String="agreement"} data.type Data type, must be 'agreement'.
 * @apiParam (Params) {Object} data.attributes agreement details.
 * @apiParam (Params) {String} data.attributes.id Agreement id to sync transactions.
 * @apiParam (Params) {String} data.attributes.start Date to start sync from.
 * @apiParam (Params) {String} data.attributes.end Date to end sync on.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/transactions/sync"
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success:
 *  HTTP/1.1 200 OK
 */
exports.post = {
  path: '/transactions/sync',
  middleware: ['service'],
  handlers: {
    '1.0.0': function transactionsSync(req, res, next) {
      return validator.validate('transaction.sync', req.body)
        .then(body => {
          const attributes = body.data;
          const message = {
            id: attributes.id,
            start: attributes.start,
            end: attributes.end,
          };

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
