const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'agreementBill';

/**
 * @api {post} /agreements/:id/bill Bill agreement
 * @apiVersion 1.0.0
 * @apiName SyncAgreements
 * @apiGroup Transactions
 * @apiPermission NonePermission
 *
 * @apiDescription
 * Used to check if user has been billed for current billing period and updates model count if neccessary.
 * Also calls "sync" method internally. Returns object containing agreement, plan, subscription data, and status of check.
 * If check passes also includes next billing date and transaction id.
 * A user can initiate check manually if they were not updated by cron, but primarily this should be called through cron.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {string} id Agreement id to check.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/agreements/PP-124135GS/bill"
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Created:
 *  HTTP/1.1 200 OK
 *  { plan: <plan object>, agreement: <agreement object>, subscriptions: [<sub object>], shouldUpdate: boolean }
 */
exports.post = {
  path: '/agreements/:id/bill',
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), req.params.id, {timeout: getTimeout(ROUTE_NAME)})
        .then(() => {
          res.send(200);
        })
        .asCallback(next);
    },
  },
};
