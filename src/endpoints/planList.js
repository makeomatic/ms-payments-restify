const Errors = require('common-errors');
const validator = require('../validator.js');
const ld = require('lodash').runInContext();
const { stringify: qs } = require('querystring');

// adds all mixins
ld.mixin(require('mm-lodash'));

const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planList';

/**
 * @api {get} / List available billing plans
 * @apiVersion 1.0.0
 * @apiName ListPlans
 * @apiGroup Plans
 * @apiPermission user, admin
 *
 * @apiDescription Returns array of plan objects.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} Plan list query, according to query schema.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X GET
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans"
 *
 * @apiUse UserAuthResponse
 * @apiUse ValidationError
 * @apiUse PaymentRequiredError
 * @apiUse PreconditionFailedError
 *
 * @apiSuccessExample {json} Success:
 *   HTTP/1.1 200 OK
 *   [{ <plan object> }]
 */
exports.get = {
  path: '/',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return Promise.try(function verifyRights() {
        const { order, filter, offset, limit, sortBy } = req.query;
        const parsedFilter = filter && JSON.parse(decodeURIComponent(filter)) || undefined;
        return ld.compactObject({
          order: (order || 'DESC').toUpperCase(),
          offset: offset && +offset || undefined,
          limit: limit && +limit || 10,
          filter: parsedFilter || {},
          criteria: sortBy && decodeURIComponent(sortBy) || undefined,
        });
      })
      .catch(function validationError(err) {
        req.log.error('input error', err);
        throw new Errors.ValidationError('query.filter and query.sortBy must be uri encoded, and query.filter must be a valid JSON object', 400);
      })
      .then(function validateMessage(message) {
        return validator.validate('list', message);
      })
      .then(function askAMQP(message) {
        return Promise.join(
          req.amqp.publishAndWait(getRoute(ROUTE_NAME), message, {timeout: getTimeout(ROUTE_NAME)}),
          message
        );
      })
      .spread((answer, message) => {
        const { page, pages, cursor } = answer;
        const { order, filter, offset, limit, criteria: sortBy } = message;
        const selfQS = {
          order,
          limit,
          offset: offset || 0,
          sortBy,
          filter: encodeURIComponent(JSON.stringify(filter)),
        };

        res.meta = { page, pages };

        const base = config.host + config.files.attachPoint;
        res.links = {
          self: `${base}?${qs(selfQS)}`,
        };

        if (page < pages) {
          const nextQS = Object.assign({}, selfQS, { offset: cursor });
          res.meta.cursor = cursor;
          res.links.next = `${base}?${qs(nextQS)}`;
        }

        res.send(answer.plans);
      })
      .asCallback(next);
    },
  },
};
