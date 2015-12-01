const ROUTE_NAME = 'transactionList';
const { createRequest, createResponse } = require('../listUtils');

/**
 * @api {get} / List transactions
 * @apiVersion 1.0.0
 * @apiName ListTransactions
 * @apiGroup Transactions
 * @apiPermission user, admin
 *
 * @apiDescription Returns array of plan objects.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} Plan list query, according to query schema.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X GET
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/transactions"
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 * @apiUse PaymentRequiredError
 * @apiUse PreconditionFailedError
 *
 * @apiSuccessExample {json} Success:
 *   HTTP/1.1 200 OK
 *   [{ <transaction object> }]
 */
exports.get = {
  path: '/',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return createRequest(req, ROUTE_NAME)
        .spread(createResponse(res))
        .then((plans) => { res.send(plans); })
        .asCallback(next);
    },
  },
};
