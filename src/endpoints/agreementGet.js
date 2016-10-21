const config = require('../config.js');

const ROUTE_NAME = 'agreementGet';
const { getRoute, getTimeout } = config;

/**
 * @api {get} /agreements/:id Returns created agreement
 * @apiVersion 1.0.0
 * @apiName GetAgreement
 * @apiGroup Agreements
 * @apiPermission UserPermission
 *
 * @apiDescription Allows the user to see details of their agreement that was created.
 * Includes state, last billing information, next billing cycle and so on
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiSuccess (Code 200) {Object}   meta              response meta information
 * @apiSuccess (Code 200) {String}   meta.id           request id
 * @apiSuccess (Code 200) {Object}   data              agreement container
 * @apiSuccess (Code 200) {String}   data.type         response data type - always `agreement`
 * @apiSuccess (Code 200) {String}   data.id           agreement id
 * @apiSuccess (Code 200) {Object}   data.attributes   agreement attribute, complete reference can be seen here:
 *   https://github.com/makeomatic/restify-utils/blob/master/schemas/Agreement.json
 * @apiSuccess (Code 200) {Object}   data.links        agreement links
 * @apiSuccess (Code 200) {String}   data.links.self   link to the current resource
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X GET \
 *     -H 'Accept-Version: *' \
 *     -H 'Accept: application/vnd.api+json' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/payments/agreements/I-dsajdkasgdjhasg1234187"
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 *
 */
exports.get = {
  path: '/agreements/:id',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function transactionList(req, res, next) {
      const id = req.params.id;

      if (id === 'transactions') {
        return next('payments.agreementsTransactionList.get');
      }

      const message = { id };

      if (!req.user.isAdmin()) {
        message.owner = req.user.id;
      }

      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), message, { timeout: getTimeout(ROUTE_NAME) })
        .then((agreement) => {
          res.send(200, config.models.Agreement.transform(agreement, true));
          return false;
        })
        .asCallback(next);
    },
  },
};
