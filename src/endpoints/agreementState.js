const Errors = require('common-errors');

const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'agreementState';

/**
 * @api {post} /agreements/:id/state/:state 3. Change agreement state
 * @apiVersion 1.0.0
 * @apiName AgreementChangeState
 * @apiGroup Agreements
 * @apiPermission UserPermission
 *
 * @apiDescription
 * Suspend temporarily disables agreement,
 * reactivate enables suspended agreement,
 * cancel allows to cancel agreement completely.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {string} id Plan id.
 * @apiParam (Params) {string} state One of these states: suspend, reactivate, cancel.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/agreements/EC-0JP008296V451950C/state/suspend"
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 *
 * @apiSuccessExample {json} Success-Executed:
 *   HTTP/1.1 204 No Content
 */
exports.post = {
  path: '/agreements/:id/state/:state',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function agreementState(req, res, next) {
      const { id, state } = req.params;
      if (id === null || id === undefined) {
        return next(new Errors.ArgumentNullError('id'));
      }
      if (state === null || state === undefined) {
        return next(new Errors.ArgumentNullError('state'));
      }
      return req.amqp
        .publishAndWait(getRoute(ROUTE_NAME), { id, state }, {timeout: getTimeout(ROUTE_NAME)})
        .then(() => {
          res.send(204);
        })
        .asCallback(next);
    },
  },
};
