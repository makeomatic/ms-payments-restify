const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'saleGet';

/**
 * @api {get} /get/:sale List sales
 * @apiVersion 1.0.0
 * @apiName getSale
 * @apiGroup Sales
 * @apiPermission UserPermission
 *
 * @apiDescription Returns a single payment object
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {String} sale id of sale to return
 *
 * @apiSuccess (Code 200) {Object}   meta              response meta information
 * @apiSuccess (Code 200) {String}   meta.id           request id
 * @apiSuccess (Code 200) {Number}   meta.page         current page we are looking at
 * @apiSuccess (Code 200) {Number}   meta.pages        total number of pages
 * @apiSuccess (Code 200) {Number}   meta.cursor       set as offset for the next page
 * @apiSuccess (Code 200) {Object[]} data              response data
 * @apiSuccess (Code 200) {String}   data.type         response data type - always `sale`
 * @apiSuccess (Code 200) {String}   data.id           sales id
 * @apiSuccess (Code 200) {Object}   data.attributes   sales attributes
 * @apiSuccess (Code 200) {Object}   data.links        sales links
 * @apiSuccess (Code 200) {String}   data.links.self   link to the current resource
 * @apiSuccess (Code 200) {String}   links             links
 * @apiSuccess (Code 200) {String}   links.self        link to the current page
 * @apiSuccess (Code 200) {String}   links.next        link to the next page
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X GET
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/sales/PAY-1237198789d89"
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 *
 * @apiSuccessExample {json} Success:
 *   HTTP/1.1 200 OK
 * 		{
 * 			"meta": {
 * 				"id": "request-id",
 * 				"page": 10,
 * 				"pages": 10
 * 			},
 * 			"data": [{
 * 				"type": "sale",
 * 				"id": "PAY-1237198789d89",
 * 				"attributes": {
 * 					...
 * 				},
 * 				"links": {
 * 					"self": "https://localhost:443/api/payments/sales?cursor=81&limit=10"
 * 				}
 * 			}],
 * 			"links": {
 * 				"self": "https://localhost:443/api/payments/sales?cursor=91&limit=10"
 * 			}
 * 		}
 */
exports.get = {
  path: '/sales/:id',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function saleGet(req, res, next) {
      const isAdmin = req.user.isAdmin();
      const message = {
        id: req.params.id,
      };

      if (!isAdmin) {
        message.owner = req.user.id;
      }

      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), message, { timeout: getTimeout(ROUTE_NAME) })
        .then(sale => {
          res.send(config.models.Sale.transform(sale, true, isAdmin));
          return false;
        })
        .asCallback(next);
    },
  },
};
