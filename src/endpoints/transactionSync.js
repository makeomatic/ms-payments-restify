const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'transactionSync';

/**
 * @api {post} /transactions/sync Sync transactions
 * @apiVersion 1.0.0
 * @apiName SyncTransactions
 * @apiGroup Transactions
 * @apiPermission UserPermission
 *
 * @apiDescription Synchronizes transactions for a single agreement with PayPal.
 * Should be used to determine when to reset monthly limits primarily.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} data Data container.
 * @apiParam (Params) {String} data.type Data type, must be 'agreement'.
 * @apiParam (Params) {Object} data.attributes New agreement details.
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
  middleware: ['auth', 'admin'],
  handlers: {
    '1.0.0': (req, res, next) => {
      return validator.validate('agreement.create', req.body)
        .then((body) => {
          const message = {
            id: body.data.attributes.id,
            start: body.data.attributes.start,
            end: body.data.attributes.end,
          };
          return req.amqp.publishAndWait(getRoute(ROUTE_NAME), message, {timeout: getTimeout(ROUTE_NAME)});
        })
        .then(() => { res.send(200); })
        .asCallback(next);
    },
  },
};
