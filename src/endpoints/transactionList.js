const ROUTE_NAME = 'transactionList';
const { createRequest, createResponse } = require('../listUtils');

/**
 * @api {get} /transactions List transactions
 * @apiVersion 1.0.0
 * @apiName ListTransactions
 * @apiGroup Transactions
 * @apiPermission UserPermission
 *
 * @apiDescription Allows user to see their transactions or admin to see all transactions in system.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Query) {Number{0..}} [offset]         how many objects to skip
 * @apiParam (Query) {Number{1..100}} [limit]       how many objects to return per page
 * @apiParam (Query) {String} [filter]              `encodeURIComponent(JSON.stringify(filterObject))`, pass it as value.
 * @apiParam (Query) {String} [sortBy]              `encodeURIComponent(sortBy)`
 * @apiParam (Query) {String="ASC","DESC"} [order]  sorting order, defaults to "ASC", case-insensitive
 *
 * @apiSuccess (Code 200) {Object}   meta              response meta information
 * @apiSuccess (Code 200) {String}   meta.id           request id
 * @apiSuccess (Code 200) {Number}   meta.page         current page we are looking at
 * @apiSuccess (Code 200) {Number}   meta.pages        total number of pages
 * @apiSuccess (Code 200) {Number}   meta.cursor       set as offset for the next page
 * @apiSuccess (Code 200) {Object[]} data              response data
 * @apiSuccess (Code 200) {String}   data.type         response data type - always `user`
 * @apiSuccess (Code 200) {String}   data.id           transactions id
 * @apiSuccess (Code 200) {Object}   data.attributes   transactions attributes
 * @apiSuccess (Code 200) {Object}   data.links        transactions links
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
 *     "https://api-sandbox.cappacity.matic.ninja/api/transactions"
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
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
 * 				"id": "PP-10200414C5",
 * 				"attributes": {
 * 					...
 * 				},
 * 				"links": {
 * 					"self": "https://localhost:443/api/transactions/PP-10200414C5"
 * 				}
 * 			}],
 * 			"links": {
 * 				"self": "https://localhost:443/api/transactions?cursor=91&limit=10"
 * 			}
 * 		}
 */
exports.get = {
  path: '/transactions',
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
