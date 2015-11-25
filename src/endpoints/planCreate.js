const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planCreate';

/**
 * @api {post} / Creates new PayPal billing plan
 * @apiVersion 1.0.0
 * @apiName CreatePlan
 * @apiGroup Plans
 * @apiPermission admin
 *
 * @apiDescription Returns new plan object.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 * 		"Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} Plan, according to plan schema.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans/"
 *     -d '{ <plan object> }'
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 * @apiUse PaymentRequiredError
 * @apiUse PreconditionFailedError
 *
 * @apiSuccessExample {json} Success-Created:
 * 		HTTP/1.1 201 Created
 * 		{ <plan object> }
 */
exports.post = {
  path: '/',
  middleware: [ 'auth' ],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      const plan = req.body
      const { amqp } = req

      return amqp
        .publishAndWait(getRoute(ROUTE_NAME), plan, { timeout: getTimeout(ROUTE_NAME) })
        .then(signedURL => {
          res.setHeader('Location', signedURL);
          res.send(302);
        })
        .asCallback(next);
    },
  },
};
