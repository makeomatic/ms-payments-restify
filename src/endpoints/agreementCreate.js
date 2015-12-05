const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'agreementCreate';

/**
 * @api {post} /agreements Create new agreement
 * @apiVersion 1.0.0
 * @apiName CreateAgreement
 * @apiGroup Agreements
 * @apiPermission UserPermission
 *
 * @apiDescription
 * Returns new agreement object and link to approve it by user in Location header.
 * Link is also included in agreement.links[rel='approval_url'], user must open it in browser to approve agreement.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} Agreement Agreement object according to agreement schema.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/agreements"
 *     -d '{ <agreement object> }'
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 *
 * @apiSuccessExample {json} Success-Created:
 *  HTTP/1.1 201 Created
 *  Location: https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-0JP008296V451950C
 *  { token: <token>, agreement: <agreement object>, url: <approval url> }
 */
exports.post = {
  path: '/agreements',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), req.body, {timeout: getTimeout(ROUTE_NAME)})
        .then(result => {
          res.setHeader('Location', result.url);
          res.status(302).send(result);
        })
        .asCallback(next);
    },
  },
};
