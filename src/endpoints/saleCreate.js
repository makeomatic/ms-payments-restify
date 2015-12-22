const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'saleCreate';

/**
 * @api {post} /sales Create a sale
 * @apiVersion 1.0.0
 * @apiName CreateSale
 * @apiGroup Sales
 * @apiPermission UserPermission
 *
 * @apiDescription Use this to create a sale for additional models.
 *
 * @apiSuccess (201) {object} plan Plan object as returned from PayPal with additional fields like id.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {string} owner Owner for this purchase.
 * @apiParam (Params) {object} sale Sale object, according to schema.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/sales"
 *     -d '{ "owner": "test@test.com", "sale": <sale object> }'
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Created:
 *  HTTP/1.1 201 Created
 *  Location: https://api.paypal.com/v1/payments/cgi-bin/webscr?cmd=_express-checkout&token=EC-60385559L1062554J
 *  { token: <token>, url: <approval_url>, sale: <sale object> }
 */
exports.post = {
  path: '/sales',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), req.body, {timeout: getTimeout(ROUTE_NAME)})
        .then(sale => {
          res.setHeader('Location', sale.url);
          res.status(201).send(sale.sale);
        })
        .asCallback(next);
    },
  },
};
