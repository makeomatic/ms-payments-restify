const validator = require('../validator.js');
const config = require('../config.js');

const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'planUpdate';

/**
 * @api {patch} /plans Update plan
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
 * @apiParam (Params) {Object}  data.attributes agreement details.
 * @apiParam (Params) {Boolean} data.attributes.hidden Hides plan from users, default is false.
 * @apiParam (Params) {String}  data.attributes.alias Plan alias, e.g. 'professional' for internal use, required.
 * @apiParam (Params) {String}  data.attributes.description Optional description.
 * @apiParam (Params) {Object}  data.attributes.subscriptions Subscriptions options.
 * @apiParam (Params) {Object}  data.attributes.subscriptions.monthly Monthly options.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.monthly.models Amount of models for this subscription.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.monthly.modelPrice How much additional model cost.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.monthly.embeddings Amount of 3D images for embedding.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.monthly.storage Available disk storage for 3D models(in Gb).
 * @apiParam (Params) {Number}  data.attributes.subscriptions.monthly.traffic Traffic (in Gb)
 * @apiParam (Params) {String}  data.attributes.subscriptions.yearly Yearly options.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.yearly.models Amount of models for this subscription.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.yearly.modelPrice How much additional model cost.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.yearly.embeddings Amount of 3D images for embedding.
 * @apiParam (Params) {Number}  data.attributes.subscriptions.yearly.storage Available disk storage for 3D models(in Gb).
 * @apiParam (Params) {Number}  data.attributes.subscriptions.yearly.traffic Traffic(in Gb).
 *
 * @apiSuccess (200) {object} plan Plan object as returned from PayPal with additional fields like id.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X PATCH
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/plans"
 *     -d '{ "data": { "id": "PI-123456", "type": "plan", "attributes": {
 *       "alias": "new-nice-alias",
 *       "hidden": true,
 *       "description": "Test plan",
 *       "subscriptions": {
 *         "monthly": {
 *           "models": 100,
 *           "modelPrice": 0.09,
 *           "embeddings": 30,
 *           "traffic": 5.5,
 *           "storage": 20
 *         },
 *         "yearly": {
 *           "models": 1500,
 *           "modelPrice": 0.01,
 *           "embeddings": 400,
 *           "traffic": 70,
 *           "storage": 20
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
  path: '/plans',
  middleware: ['auth', 'admin'],
  handlers: {
    '1.0.0': function planUpdate(req, res, next) {
      return validator
        .validate('plan.update', req.body)
        .then((body) => {
          const plan = body.data;
          const { id, attributes } = plan;

          return req.amqp.publishAndWait(getRoute(ROUTE_NAME), { ...attributes, id }, { timeout: getTimeout(ROUTE_NAME) });
        })
        .then((updated) => {
          res.send(config.models.Plan.transform(updated, true));
          return false;
        })
        .asCallback(next);
    },
  },
};
