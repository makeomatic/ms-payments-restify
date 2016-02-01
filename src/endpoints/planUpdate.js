const { ArgumentNullError } = require('common-errors');
const validator = require('../validator.js');
const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planUpdate';

/**
 * @api {patch} /plans/:id Update plan
 * @apiVersion 1.0.0
 * @apiName UpdatePlan
 * @apiGroup Plans
 * @apiPermission AdminPermission
 *
 * @apiDescription Updates plan definition for non-activated plans.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object}  data Data container.
 * @apiParam (Params) {String}  data.id Plan id.
 * @apiParam (Params) {String}  data.type Data type, must be 'plan'.
 * @apiParam (Params) {Object}  data.attributes New agreement details.
 * @apiParam (Params) {Boolean} data.attributes.hidden Hides plan from users, default is false.
 * @apiParam (Params) {String}  data.attributes.alias Plan alias, e.g. 'professional' for internal use, required.
 * @apiParam (Params) {String}  data.attributes.name Name for a plan to be displayed in admin panel and for users, required.
 * @apiParam (Params) {String}  data.attributes.description Optional description.
 * @apiParam (Params) {Object}  data.attributes.subscriptions Subscriptions options.
 * @apiParam (Params) {Object}  data.attributes.subscriptions.monthly Monthly options.
 * @apiParam (Params) {String}  data.attributes.subscriptions.monthly.price Subscription price.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.monthly.models Amount of models for this subscription.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.monthly.modelPrice How much additional model cost.
 * @apiParam (Params) {String}  data.attributes.subscriptions.yearly Yearly options.
 * @apiParam (Params) {Object}  data.attributes.subscriptions.yearly.price Subscription price.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.yearly.models Amount of models for this subscription.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.yearly.modelPrice How much additional model cost.
 *
 * @apiSuccess (200) {object} plan Plan object as returned from PayPal with additional fields like id.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X PATCH
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans/:id"
 *     -d '{ "data": { "id": "PI-123456", "type": "plan", "attributes": {
 *       "name": "Test",
 *       "description": "Test plan",
 *       "subscriptions": {
 *         "monthly": {
 *           "price": 9.99,
 *           "models": 100,
 *           "modelPrice": 0.09
 *         },
 *         "yearly": {
 *           "price": 99.99,
 *           "models": 1500,
 *           "modelPrice": 0.01
 *         }
 *       }
 *     } }'
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Updated:
 *  HTTP/1.1 200 OK
 *  { ... }
 */
exports.patch = {
  path: '/plans/:id',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function planUpdate(req, res, next) {
      return validator
        .validate('plan.update', req.body)
        .then(body => {
          const plan = body.data.attributes;

          if (plan.subscriptions) {
            const monthly = {
              name: 'month',
              type: 'regular',
              frequency_interval: '1',
              frequency: 'month',
              cycles: '0',
              amount: {
                currency: 'USD',
                value: plan.subscriptions.monthly.price.toPrecision(2),
              },
              charge_models: [{
                type: 'tax',
                amount: {
                  currency: 'USD',
                  value: '0.0',
                },
              }],
            };

            const yearly = {
              name: 'year',
              type: 'regular',
              frequency_interval: '1',
              frequency: 'year',
              cycles: '0',
              amount: {
                currency: 'USD',
                value: plan.subscriptions.yearly.price.toPrecision(2),
              },
              charge_models: [{
                type: 'tax',
                amount: {
                  currency: 'USD',
                  value: '0.0',
                },
              }],
            };

            const message = {
              id: plan.id,
              hidden: plan.hidden || false,
              alias: plan.alias || '',
              plan: {
                name: plan.name,
                description: plan.description || '',
                type: 'infinite',
                state: 'active',
                payment_definitions: [monthly, yearly],
              },
              subscriptions: [{
                models: plan.subscriptions.monthly.models,
                price: plan.subscriptions.monthly.modelPrice,
                name: 'month',
              }, {
                models: plan.subscriptions.yearly.models,
                price: plan.subscriptions.yearly.modelPrice,
                name: 'year',
              }],
            };

            return req.amqp.publishAndWait(getRoute(ROUTE_NAME), message, { timeout: getTimeout(ROUTE_NAME) });
          } else {
            return req.amqp.publishAndWait(getRoute(ROUTE_NAME), plan, { timeout: getTimeout(ROUTE_NAME) });
          }
        })
        .then(updated => {
          res.send(config.models.Plan.transform(updated, true));
          return false;
        })
        .asCallback(next);
    },
  },
};
