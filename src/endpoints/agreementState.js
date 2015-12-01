const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'agreementState';

/**
 * @api {post} /:id/state/:state Changes state of PayPal billing agreement
 * @apiVersion 1.0.0
 * @apiName AgreementChangeState
 * @apiGroup Agreements
 * @apiPermission user
 *
 * @apiDescription Returns nothing.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} Plan, according to plan schema.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/agreements/EC-0JP008296V451950C/state/suspended"
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 * @apiUse PaymentRequiredError
 * @apiUse PreconditionFailedError
 *
 * @apiSuccessExample {json} Success-Executed:
 *   HTTP/1.1 204 No Content
 */
exports.post = {
  path: '/:id/state/:state',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function agreementState(req, res, next) {
      const { id, state } = req.params;
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), { id, state }, {timeout: getTimeout(ROUTE_NAME)})
        .then(() => {
          res.send(204);
        })
        .asCallback(next);
    },
  },
};
