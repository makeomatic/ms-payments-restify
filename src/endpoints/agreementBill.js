const Errors = require('common-errors');
const config = require('../config.js');

const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'agreementBill';

/**
 * @api {post} /agreements/:id/bill Bill agreement
 * @apiVersion 1.0.0
 * @apiName BillAgreement
 * @apiGroup Sync
 * @apiPermission Service
 *
 * @apiDescription
 * Used to check if user has been billed for current billing period and updates model count if neccessary.
 * Also calls "sync" method internally. Returns object containing agreement, plan, subscription data, and status of check.
 * If check passes also includes next billing date and transaction id.
 * A user can initiate check manually if they were not updated by cron, but primarily this should be called through cron.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {String} id Agreement id to check.
 *
 * @apiSuccess (Body) {Object} data Data container.
 * @apiSuccess (Body) {String} data.type Always 'status'.
 * @apiSuccess (Body) {Object} data.attributes Status data.
 * @apiSuccess (Body) {Boolean} data.attributes.updated True if agreement was billed and models were applied to user.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST \
 *     -H 'Accept-Version: *' \
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/payments/agreements/I-124135GS/bill"
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Created:
 *  HTTP/1.1 200 OK
 *  { data: { type: 'status', attributes: { 'updated': true } } }
 */
exports.post = {
  path: '/agreements/:id/bill',
  middleware: ['service'],
  handlers: {
    '1.0.0': function agreementBill(req, res, next) {
      const { id } = req.params;
      if (id === null || id === undefined) {
        return next(new Errors.ArgumentNullError('id'));
      }

      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), id, { timeout: getTimeout(ROUTE_NAME) })
        .then((result) => {
          const response = {
            data: {
              type: 'status',
              attributes: {
                updated: result.shouldUpdate,
              },
            },
          };

          res.send(response);
        })
        .asCallback(next);
    },
  },
};
