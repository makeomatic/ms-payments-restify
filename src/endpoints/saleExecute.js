const validator = require('../validator.js');

const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'saleExecute';

function execute(amqp, data) {
  const message = {
    payment_id: data.payment_id,
    payer_id: data.payer_id,
  };

  return amqp.publishAndWait(getRoute(ROUTE_NAME), message, { timeout: getTimeout(ROUTE_NAME) });
}

/**
 * @api {post} /sales/execute Execute sale
 * @apiVersion 1.0.0
 * @apiName ExecuteSale
 * @apiGroup Sales
 * @apiPermission none
 *
 * @apiDescription Executes sale. Sale must be approved by used first.
 * To execute a sale you need Sale ID and Payer ID. Both are passed as query params "paymentId" and "PayerID"
 * to return_url specified in config.sales.return_url. Script on that url must call saleExecute with
 * parameters that it gets from PayPal.
 * Important: The only way to get Payer ID is to get it from PayPal on return_url handler! Make sure that handler
 * saves data it received IMMEDIATELY, so in case of any failure you'll be able to re-attempt execution.
 *
 * @apiParam (Params) {Object} data Data container.
 * @apiParam (Params) {String} data.type Data type, must be 'executionOrder'.
 * @apiParam (Params) {Object} data.attributes Execution data.
 * @apiParam (Params) {String} data.attributes.payment_id Payment ID as returned by saleCreate or received from PayPal on return_url.
 * @apiParam (Params) {String} data.attributes.payer_id Payer ID, this is returned to return_url by PayPal.
 * @apiParam (Params) {String} data.attributes.owner User ID, this is used to add models. If not specified, current user is used.
 *
 * @apiSuccess (Return) {Object} data Data container.
 * @apiSuccess (Return) {String} data.id Id of newly created sale.
 * @apiSuccess (Return) {String} data.type Data type, always is 'sale'.
 * @apiSuccess (Return) {Object} data.attributes Full sale object returned by PayPal (contains additional data).
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST \
 *     -H 'Accept-Version: *' \
 *     -H 'Accept: application/vnd.api+json' \
 *     -H 'Content-Type: application/vnd.api+json' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/sales/execute/EC-0JP008296V451950C"
 *     -d '{ data: { type: "executionOrder", attributes: { "payment_id": "someid", "payer_id": "anotherid" } } }'
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 *
 * @apiSuccessExample {json} Success-Executed:
 *   HTTP/1.1 200 OK
 *   {
 *    data: {
 *      type: "sale",
 *      attributes: { ... }
 *    }
 *   }
 */
exports.post = {
  path: '/sales/execute',
  handlers: {
    '1.0.0': (req, res, next) => {
      return validator.validate('sale.execute', req.body)
        .then(body => {
          return execute(req.amqp, body.attributes);
        })
        .then(sale => {
          const response = {
            type: 'sale',
            attributes: sale,
          };

          res.send(200, response);
        })
        .asCallback(next);
    },
  },
};

exports.execute = execute;
