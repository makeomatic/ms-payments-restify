const validator = require('../validator.js');
const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'saleCreateDynamic';

/**
 * @api {post} /sales/custom Create custom sale
 * @apiVersion 1.0.0
 * @apiName CreateDynamicSale
 * @apiGroup Sales
 * @apiPermission UserPermission
 *
 * @apiDescription Use this to create a sale for any custom price.
 *
 * @apiSuccess (201) {object} sale Sale object as returned from PayPal with additional fields like id.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} data Data container.
 * @apiParam (Params) {String} data.type Data type, must be 'sale'.
 * @apiParam (Params) {Object} data.attributes New sale details.
 * @apiParam (Params) {String} data.attributes.user Optional user, if sent by non-admin ignored and automatically set to current user.
 * @apiParam (Params) {String} data.attributes.amount Price.
 * @apiParam (Params) {String} data.attributes.type Sale type. Use 2 for 3D printing service, other types are not accepted at the moment.
 * @apiParam (Params) {Object} data.attributes.cart Shopping cart metadata, required.
 * @apiParam (Params) {String} data.attributes.cart.id Shopping cart id.
 * @apiParam (Params) {String} data.attributes.cart.shipping_type Shipping type.
 * @apiParam (Params) {Number} data.attributes.cart.shipping_price Shipping price.
 * @apiParam (Params) {Number} data.attributes.cart.printing_price Printing price.
 * @apiParam (Params) {Number} data.attributes.cart.service_price Price to pay for printing service.
 * @apiParam (Params) {Number} data.attributes.cart.user_price Amount of money to charge from user.
 *
 * @apiSuccess (Return) {Object} data Data container.
 * @apiSuccess (Return) {String} data.id Id of newly created sale.
 * @apiSuccess (Return) {String} data.type Data type, always is 'sale'.
 * @apiSuccess (Return) {Object} data.attributes Full sale object returned by PayPal (contains additional data).
 * @apiSuccess (Return) {Object} data.links
 * @apiSuccess (Return) {String} data.links.approve Link user must open to complete payment.
 * @apiSuccess (Return) {Object} data.meta
 * @apiSuccess (Return) {String} data.meta.token Token (not used, but sent just in case).
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/sales"
 *     -d '{ "data": { "type": "sale", "attributes": { "amount": "50", "type": 2 } } }'
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Created:
 *  HTTP/1.1 201 Created
 *  {
 *    data:
 *    {
 *      id: 'PAY-1B56960729604235TKQQIYVY',
 *      type: 'sale',
 *      attributes: {...},
 *      links: {
 *        approve: 'https://api.paypal.com/v1/payments/cgi-bin/webscr?cmd=_express-checkout&token=EC-60385559L1062554J'
 *      },
 *      meta: {
 *        token: 'EC-60385559L1062554J'
 *      }
 *    }
 *  }
 */
exports.post = {
  path: '/sales',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function createSale(req, res, next) {
      return validator.validate('sale.create.dyn', req.body)
        .then(body => {
          let user;
          if (!req.user.isAdmin()) {
            user = req.user.id;
          } else {
            user = body.data.attributes.user || req.user.id;
          }

          const message = {
            owner: user,
            amount: body.data.attributes.amount,
            type: body.data.attributes.type,
            cart: body.data.attributes.cart,
          };

          return req.amqp.publishAndWait(getRoute(ROUTE_NAME), message, { timeout: getTimeout(ROUTE_NAME) });
        })
        .then(result => {
          const response = {
            id: result.sale.id,
            type: 'sale',
            attributes: result.sale,
            links: {
              approve: result.url,
            },
            meta: {
              token: result.token,
            },
          };
          res.send(201, response);
        })
        .asCallback(next);
    },
  },
};
