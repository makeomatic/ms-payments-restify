const ROUTE_NAME = 'agreementGet';
const config = require('../config.js');
const { getRoute, getTimeout } = config;

/**
 * @api {get} /agreements/:id List common transactions
 * @apiVersion 1.0.0
 * @apiName GetAgreement
 * @apiGroup Agreements
 * @apiPermission UserPermission
 *
 * @apiDescription Allows user to see their transactions or admin to see all transactions in system.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
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
 *     "https://api-sandbox.cappacity.matic.ninja/api/agreements/get/I-dsajdkasgdjhasg1234187"
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

      const message = { id, owner: req.user.id };
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), message, { timeout: getTimeout(ROUTE_NAME) })
        .then(agreement => {
          res.send(200, config.models.Agreement.transform(agreement, true));
          return false;
        })
        .asCallback(next);
    },
  },
};
