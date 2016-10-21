const validator = require('../validator.js');
const config = require('../config.js');

const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'agreementCreate';

function create(req, user) {
  return function processBody(agreement) {
    return req.amqp
      .publishAndWait(getRoute('planGet'), agreement.plan, { timeout: getTimeout('planGet') })
      .then((data) => {
        const [subscription] = data.subs;
        const name = data.plan.description;
        const description = [
          `${subscription.name} ${name}`,
          `Provides ${subscription.models} models. Extra for ${subscription.price}${subscription.definition.amount.currency} per model`,
        ].join('. ').slice(0, 127);

        const message = {
          owner: user || agreement.user,
          agreement: {
            name,
            description,
            plan: {
              id: agreement.plan,
            },
            payer: {
              payment_method: 'paypal',
            },
          },
        };

        return req.amqp.publishAndWait(getRoute(ROUTE_NAME), message, { timeout: getTimeout(ROUTE_NAME) });
      })
      .then(result => ({
        id: result.agreement.id,
        type: 'agreement',
        attributes: result.agreement,
        links: {
          approve: result.url,
        },
        meta: {
          token: result.token,
        },
      }));
  };
}

/**
 * @public
 * @type {Function}
 */
exports.create = create;

/**
 * @api {post} /agreements Create agreement
 * @apiVersion 1.0.0
 * @apiName CreateAgreement
 * @apiGroup Agreements
 * @apiPermission UserPermission
 *
 * @apiDescription
 * Makes PayPal request to create new agreement based on pre-defined plan.
 * Returns new agreement object and link to approve it by user.
 * When response is returned, application must open `data.links.approve` in the browser
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} data Data container.
 * @apiParam (Params) {String} data.type Data type, must be 'agreement'.
 * @apiParam (Params) {Object} data.attributes New agreement details.
 * @apiParam (Params) {String} data.attributes.plan Plan id, required.
 *
 * @apiSuccess (Return) {Object} data Data container.
 * @apiSuccess (Return) {String} data.id Id of newly created agreement.
 * @apiSuccess (Return) {String} data.type Data type, always is 'agreement'.
 * @apiSuccess (Return) {Object} data.attributes Full agreement object returned by PayPal (contains additional data from plan).
 * @apiSuccess (Return) {Object} data.links
 * @apiSuccess (Return) {String} data.links.approve Link user must open to choose desired cycle option (monthly or annual) and approve agreement.
 * @apiSuccess (Return) {Object} data.meta
 * @apiSuccess (Return) {String} data.meta.token Agreement token, this must be used to execute approved agreement (see agreementExecute).
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST -H 'Accept-Version: *' \
 *    -H 'Accept: application/vnd.api+json' \
 *    -H 'Content-Type: application/vnd.api+json' \
 *    -H "Authorization: JWT realjwtroken" \
 *    "https://api-sandbox.cappasity.matic.ninja/api/payments/agreements" -d '{
 *      "data": {
 *        "type": "agreement",
 *         "attributes": {
 *          "plan": "PD-3EH44571MW10700544AOMJ3I"
 *        }
 *      }
 *    }'
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 *
 * @apiSuccessExample {json} Success-Created:
 *  HTTP/1.1 201 Created
 *  {
 *    data:
 *    {
 *      id: 'PP-10200414C5',
 *      type: 'agreement',
 *      attributes: {...},
 *      links: {
 *        approve: 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-0JP008296V451950C'
 *      },
 *      meta: {
 *        token: 'EC-0JP008296V451950C'
 *      }
 *    }
 *  }
 */
exports.post = {
  path: '/agreements',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function agreementCreate(req, res, next) {
      return validator
        .validate('agreement.create', req.body)
        .get('data')
        .get('attributes')
        .then(create(req, req.user.id))
        .then((response) => {
          res.send(201, response);
        })
        .asCallback(next);
    },
  },
};
