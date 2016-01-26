const validator = require('../validator.js');
const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planCreate';

/**
 * @api {post} /plans Create plan
 * @apiVersion 1.0.0
 * @apiName CreatePlan
 * @apiGroup Plans
 * @apiPermission AdminPermission
 *
 * @apiDescription
 * Returns new plan object.
 * If hidden is true, hides plan from regular users, allowing it to be used by admins on special occasions.
 *
 * @apiSuccess (201) {object} plan Plan object as returned from PayPal with additional fields like id.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object}  data Data container.
 * @apiParam (Params) {String}  data.type Data type, must be 'plan'.
 * @apiParam (Params) {Object}  data.attributes New agreement details.
 * @apiParam (Params) {Boolean} data.attributes.hidden Hides plan from users, default is false.
 * @apiParam (Params) {String}  data.attributes.alias Plan alias, e.g. 'professional' for internal use, required.
 * @apiParam (Params) {String}  data.attributes.name Name for a plan to be displayed in admin panel and for users, required.
 * @apiParam (Params) {String}  data.attributes.description Optional description.
 * @apiParam (Params) {Object}  data.attributes.subscriptions Subscriptions options.
 * @apiParam (Params) {Object}  data.attributes.subscriptions.monthly Monthly options.
 * @apiParam (Params) {String}  data.attributes.subscriptions.monthly.price Subscription price.
 * @apiParam (Params) {String}  data.attributes.subscriptions.monthly.models Amount of models for this subscription.
 * @apiParam (Params) {String}  data.attributes.subscriptions.monthly.model_price How much additional model cost.
 * @apiParam (Params) {String}  data.attributes.subscriptions.yearly Yearly options.
 * @apiParam (Params) {Object}  data.attributes.subscriptions.yearly.price Subscription price.
 * @apiParam (Params) {String}  data.attributes.subscriptions.yearly.models Amount of models for this subscription.
 * @apiParam (Params) {String}  data.attributes.subscriptions.yearly.model_price How much additional model cost.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans"
 *     -d '{ "data": { "type": "plan", "attributes": {
 *       "name": "Test",
 *       "description": "Test plan",
 *       "subscriptions": {
 *         "monthly": {
 *           "price": "9.99",
 *           "models": "100",
 *           "model_price": "0.09"
 *         },
 *         "yearly": {
 *           "price": "99.99",
 *           "models": "1500",
 *           "model_price": "0.01"
 *         }
 *       }
 *     } }'
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Created:
 *  HTTP/1.1 201 Created
 *  { "data": { "type": "plan", "attributes": { ... } }
 */
exports.post = {
  path: '/plans',
  middleware: ['auth', 'admin'],
  handlers: {
    '1.0.0': function createPlan(req, res, next) {
      return validator
        .validate('plan.create', req.body)
        .then(body => {
          const plan = body.data.attributes;

          const monthly = {
            name: 'monthly',
            type: 'regular',
            frequency_interval: '1',
            frequency: 'month',
            cycles: '0',
            amount: {
              currency: 'USD',
              value: plan.subscriptions.monthly.price,
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
            name: 'yearly',
            type: 'regular',
            frequency_interval: '1',
            frequency: 'year',
            cycles: '0',
            amount: {
              currency: 'USD',
              value: plan.subscriptions.yearly.price,
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
            hidden: plan.hidden || false,
            alias: plan.alias || '',
            plan: {
              name: plan.name,
              description: plan.description || '',
              type: 'infinite',
              payment_definitions: [monthly, yearly],
            },
            subscriptions: [{
              models: plan.subscriptions.monthly.models,
              price: plan.subscriptions.monthly.model_price,
              name: 'monthly',
            }, {
              models: plan.subscriptions.yearly.models,
              price: plan.subscriptions.yearly.model_price,
              name: 'yearly',
            }],
          };

          return req.amqp.publishAndWait(getRoute(ROUTE_NAME), message, { timeout: getTimeout(ROUTE_NAME) });
        })
        .then(plan => {
          res.send(201, config.models.Plan.transform(plan, true));
        })
        .asCallback(next);
    },
  },
};
