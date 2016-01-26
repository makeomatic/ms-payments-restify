const ROUTE_NAME = 'agreementList';
const config = require('../config.js');
const { createRequest, createResponse } = require('../listUtils');

/**
 * @api {get} /agreements List agreements
 * @apiVersion 1.0.0
 * @apiName ListAgreements
 * @apiGroup Agreements
 * @apiPermission AdminPermission
 *
 * @apiDescription Allows admin to see all agreements with users.
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
 * @apiSuccess (Code 200) {String}   data.type         response data type - always `agreement`
 * @apiSuccess (Code 200) {String}   data.id           agreement id, NOT the token, token is available in attributes
 * @apiSuccess (Code 200) {Object}   data.attributes   agreement attributes, reference:
 * 	https://github.com/makeomatic/restify-utils/blob/master/schemas/Agreement.json
 * @apiSuccess (Code 200) {Object}   data.links        agreement links
 * @apiSuccess (Code 200) {String}   data.links.self   link to the current resource
 * @apiSuccess (Code 200) {String}   links             links
 * @apiSuccess (Code 200) {String}   links.self        link to the current page
 * @apiSuccess (Code 200) {String}   links.next        link to the next page
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X GET \
 *     -H 'Accept-Version: *' \
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/payments/agreements"
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Agreements:
 * 		HTTP/1.1 200 OK
 * 		{
 * 			"meta": {
 * 				"id": "request-id",
 * 				"page": 10,
 * 				"pages": 10
 * 			},
 * 			"data": [{
 * 				"type": "agreement",
 * 				"id": "PP-10200414C5",
 * 				"attributes": {
 * 					...
 * 				},
 * 				"links": {
 * 					"self": "https://localhost:443/api/agremeents/PP-10200414C5"
 * 				}
 * 			}],
 * 			"links": {
 * 				"self": "https://localhost:443/api/agreements?cursor=91&limit=10"
 * 			}
 * 		}
 */
exports.get = {
  path: '/agreements',
  middleware: ['auth', 'admin'],
  handlers: {
    '1.0.0': function listAgreements(req, res, next) {
      return createRequest(req, ROUTE_NAME)
        .spread(createResponse(res, 'agreements', config.models.Agreement, 'agreement.id'))
        .then(agreements => {
          res.send(200, agreements);
          return false;
        })
        .asCallback(next);
    },
  },
};
