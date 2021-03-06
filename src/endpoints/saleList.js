const config = require('../config.js');
const { createRequest, createResponse } = require('../listUtils');

const ROUTE_NAME = 'saleList';

/**
 * @api {get} /plans List sales
 * @apiVersion 1.0.0
 * @apiName ListSales
 * @apiGroup Sales
 * @apiPermission UserPermission
 *
 * @apiDescription Returns array of sale objects. Non-admin users can only get sale's data
 * for authenticated user
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Query) {Number{0..}} [offset] how many objects to skip
 * @apiParam (Query) {Number{1..100}} [limit] how many objects to return per page
 * @apiParam (Query) {String} [filter] `encodeURIComponent(JSON.stringify(filterObject))`, pass it as value.
 * @apiParam (Query) {String} [sortBy] `encodeURIComponent(sortBy)`
 * @apiParam (Query) {String} [owner] `encodeURIComponent(owner)`
 * @apiParam (Query) {String="ASC","DESC"} [order]  sorting order, defaults to "ASC", case-insensitive
 *
 * @apiSuccess (Code 200) {Object}   meta              response meta information
 * @apiSuccess (Code 200) {String}   meta.id           request id
 * @apiSuccess (Code 200) {Number}   meta.page         current page we are looking at
 * @apiSuccess (Code 200) {Number}   meta.pages        total number of pages
 * @apiSuccess (Code 200) {Number}   meta.cursor       set as offset for the next page
 * @apiSuccess (Code 200) {Object[]} data              response data
 * @apiSuccess (Code 200) {String}   data.type         response data type - always `user`
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
 *     "https://api-sandbox.cappacity.matic.ninja/api/sales"
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 *
 * @apiSuccessExample {json} Success:
 *   HTTP/1.1 200 OK
 *     {
 *       "meta": {
 *         "id": "request-id",
 *         "page": 10,
 *         "pages": 10
 *       },
 *       "data": [{
 *         "type": "sale",
 *         "id": "PP-10200414C5",
 *         "attributes": {
 *           ...
 *         },
 *         "links": {
 *           "self": "https://localhost:443/api/payments/sales?cursor=81&limit=10"
 *         }
 *       }],
 *       "links": {
 *         "self": "https://localhost:443/api/payments/sales?cursor=91&limit=10"
 *       }
 *     }
 */
exports.get = {
  path: '/sales',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function saleList(req, res, next) {
      return createRequest(req, ROUTE_NAME)
        .spread(createResponse(res, 'sales', config.models.Sale, 'sale.id', req.user.isAdmin()))
        .then((sales) => {
          res.send(200, sales);
          return false;
        })
        .asCallback(next);
    },
  },
};
