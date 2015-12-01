const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'transactionSync';

/**
 * @api {post} / Sync transactions for agreement from PayPal
 * @apiVersion 1.0.0
 * @apiName SyncTransactions
 * @apiGroup Transactions
 * @apiPermission admin
 *
 * @apiDescription
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} Plan must suffice to plan schema and include correct return and cancel urls.
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
 * @apiUse PaymentRequiredError
 * @apiUse PreconditionFailedError
 *
 * @apiSuccessExample {json} Success-Created:
 *  HTTP/1.1 200 OK
 */
exports.post = {
  path: '/sync',
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
