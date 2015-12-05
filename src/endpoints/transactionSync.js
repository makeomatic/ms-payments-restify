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
 * @apiParam (Params) {string} id Agreement id to sync transactions.
 * @apiParam (Params) {string} start Date to start sync from.
 * @apiParam (Params) {string} end Date to end sync on.
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
 * @apiSuccessExample {json} Success-Created:
 *  HTTP/1.1 200 OK
 */
exports.post = {
  path: '/transactions/sync',
  middleware: ['auth', 'admin'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), req.body, {timeout: getTimeout(ROUTE_NAME)})
        .then(() => {
          res.send(200);
        })
        .asCallback(next);
    },
  },
};
