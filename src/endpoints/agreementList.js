const ROUTE_NAME = 'agreementList';
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
 * @apiParam (Params) {Object} query Query, according to query schema.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X GET
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/agreements"
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success:
 *   HTTP/1.1 200 OK
 *   [{ <agreement object> }]
 */
exports.get = {
  path: '/agreements',
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
