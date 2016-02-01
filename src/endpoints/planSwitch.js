const Promise = require('bluebird');
const validator = require('../validator.js');
const Errors = require('common-errors');
const config = require('../config.js');
const { getRoute, getTimeout } = config;
const moment = require('moment');
const agreementCreate = require('./agreementCreate.js').create;
const getMetadataPath = `${config.users.prefix}.${config.users.postfix.getMetadata}`;

function getCurrentAgreement(user, amqp) {
  const audience = config.users.audience;
  const getRequest = {
    username: user,
    audience,
  };

  return amqp.publishAndWait(getMetadataPath, getRequest, { timeout: 5000 })
    .get(audience)
    .then(metadata => {
      if (!metadata.agreement) {
        throw new Errors.NotSupportedError('Operation is not available on users not having agreement data.');
      }
      return metadata;
    });
}

function cancelAgreement(id, amqp) {
  const path = getRoute('agreementState');
  const message = {
    id,
    state: 'cancel',
    note: 'Cancelling agreement by user request to switch to free plan',
  };
  // will return true only if promise succeeds
  return amqp.publishAndWait(path, message, { timeout: getTimeout('agreementState') });
}

function createNewAgreement(req, body, user) {
  return agreementCreate(req, user)(body);
}

function getFreePlanData(amqp) {
  return amqp
    .publishAndWait(getRoute('planGet'), 'free', { timeout: getTimeout('planGet') })
    .then(plan => ({
      plan,
      price: plan.subs[0].price,
    }));
}

function saveFreeMetadata(user, price, amqp) {
  const period = 'month';
  const nextCycle = moment().add(1, period).valueOf();

  const updateRequest = {
    username: user,
    audience: config.users.audience,
    metadata: {
      $set: {
        nextCycle,
        agreement: 'free',
        plan: 'free',
        modelPrice: price,
      },
    },
  };

  return amqp.publishAndWait(getMetadataPath, updateRequest, { timeout: 5000 });
}

const execute = Promise.coroutine(function* generateSwitch(req) {
  // validate body
  const input = yield validator.validate('plan.switch', req.body);
  const body = input.data.attributes;

  // get current user agreement, if user is not admin, force it to current user no matter what's passed
  // also set it to current user if it's empty
  let user = body.user;
  if (!req.user.isAdmin() || !user) {
    user = req.user.id;
  }

  const agreementData = yield getCurrentAgreement(user, req.amqp);
  const planId = body.plan;

  const { agreement: currentAgreementId, plan: currentPlanId } = agreementData;
  if (currentPlanId === planId) {
    throw new Errors.NotSupportedError('you cant change to the same agreement');
  }

  if (currentAgreementId === 'free' || planId !== 'free') {
    // paid agreements will be automatically cancelled
    return yield createNewAgreement(req, body, user);
  }

  // and just write free plan metadata to user
  // cancel agreement when switching to free
  yield cancelAgreement(currentAgreementId, user, req.amqp);
  const freePlanData = yield getFreePlanData(req.amqp);
  yield saveFreeMetadata(user, freePlanData.price, req.amqp);

  // no need to approve free plan
  return {
    id: 'free',
    type: 'agreement',
    attributes: freePlanData.plan,
    links: {},
    meta: {},
  };
});

/**
 * @api {post} /plans/switch Change plan for user
 * @apiVersion 1.0.0
 * @apiName SwitchPlan
 * @apiGroup Plans
 * @apiPermission UserPermission
 *
 * @apiDescription
 * Changes plan.
 * Handles all required operations automatically.
 * User still needs to choose and approve new agreement.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object}  data Data container.
 * @apiParam (Params) {String="switch"}  data.type Data type, must be 'switch'.
 * @apiParam (Params) {Object}  data.attributes Details.
 * @apiParam (Params) {String} [data.attributes.user] If current user is not admin, overwrites any value with current user.
 * @apiParam (Params) {String}  data.attributes.plan Plan id, required.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST \
 *     -H 'Accept-Version: *' \
 *     -H 'Accept: application/vnd.api+json' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/payments/plans/switch" -d '{
 *       "data": {
 *         "type": "switch",
 *           "attributes": {
 *             "plan": "id of plan"
 *           }
 *       }
 *     }'
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Updated:
 *  HTTP/1.1 200 OK
 *
 *  {
 *    "meta": {
 *      "id": "reqid"
 *    },
 *    "data": {
 *      "id": "agreement-id",
 *      "type": "agreement",
 *      "attributes": {
 *        // ...
 *      },
 *      links: {
 *        approve: result.url, // if not present - no need to approve, ie 'free' plan
 *      },
 *      meta: {
 *        token: result.token,
 *      }
 *    }
 *  }
 */
exports.post = {
  path: '/plans/switch',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function planSwitch(req, res, next) {
      return execute(req).then(response => {
        res.send(201, response);
      }).asCallback(next);
    },
  },
};

exports.cancelAgreement = cancelAgreement;
