const Promise = require('bluebird');
const validator = require('../validator.js');
const Errors = require('common-errors');
const config = require('../config.js');
const { getRoute, getTimeout } = config;
const moment = require('moment');

function getCurrentAgreement(user, amqp) {
  const path = config.users.prefix + '.' + config.users.postfix.getMetadata;
  const getRequest = {
    username: user,
    audience: config.users.audience,
  };
  return amqp.publishAndWait(path, getRequest, {timeout: 5000})
    .then((metadata) => {
      // if user is on free plan, return free
      if (metadata.plan === 'free') return 'free';
      return metadata.agreement || new Errors.NotSupportedError('Operation is not available on users not having agreement data.');
    });
}

function suspendAgreement(id, amqp) {
  const path = getRoute('agreementState');
  const message = {
    id,
    state: 'suspend',
    note: 'Suspending agreement by user request to switch plan',
  };
  // will return true only if promise succeeds
  return amqp.publishAndWait(path, message, {timeout: getTimeout('agreementState')});
}

function cancelAgreement(id, amqp) {
  const path = getRoute('agreementState');
  const message = {
    id,
    state: 'cancel',
    note: 'Cancelling agreement by user request to switch to free plan',
  };
  // will return true only if promise succeeds
  return amqp.publishAndWait(path, message, {timeout: getTimeout('agreementState')});
}

function createNewAgreement(agreement, user, amqp) {
  const path = 'agreementCreate';
  const realDate = agreement.start_date && moment(agreement.start_date) || moment().add(1, 'minute');
  const message = {
    owner: user,
    agreement: {
      name: agreement.name,
      description: agreement.description,
      // fuck you paypal: 2015-02-19T00:37:04Z ?!
      start_date: realDate.format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
      plan: {
        id: agreement.plan,
      },
      payer: {
        payment_method: 'paypal',
      },
    },
  };

  return amqp.publishAndWait(getRoute(path), message, {timeout: getTimeout(path)});
}

function getFreeModelPrice(amqp) {
  return amqp
    .publishAndWait(getRoute('planGet'), 'free', { timeout: getTimeout('planGet') })
    .then(plan => {
      return plan.subs[0].price;
    });
}

function saveFreeMetadata(user, price, amqp) {
  const period = 'month';
  const nextCycle = moment().add(1, period).format();
  const path = config.users.prefix + '.' + config.users.postfix.updateMetadata;

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

  return amqp.publishAndWait(path, updateRequest, { timeout: 5000 });
}

const execute = Promise.coroutine(function* generateSwitch(req) {
  // validate body
  const body = (yield validator.validate('agreement.create', req.body)).data.attributes;
  // get current user agreement, if user is not admin, force it to current user no matter what's passed
  // also set it to current user if it's empty
  if (!req.user.isAdmin() || body.user === null || body.user === undefined) {
    body.user = req.user.id;
  }
  const agreementId = yield getCurrentAgreement(body.user, req.amqp);
  if (agreementId !== 'free') {
    if (body.agreement.plan === 'free') {
      // if we're switching to free plan, cancel old agreement immediately
      yield cancelAgreement(agreementId, req.amqp);
      // and just write free plan metadata to user
      const price = getFreeModelPrice(req.amqp);
      yield saveFreeMetadata(body.user, price, req.amqp);
      // and return at the end of function
    } else {
      // suspend agreement if id is not free
      yield suspendAgreement(agreementId, req.amqp);
      // create new agreement and allow user to proceed as usual, old agreement will be cancelled after executing new one
      const result = yield createNewAgreement(body.agreement, body.user, req.amqp);
      // return same data as from createAgreement to proceed naturally
      return {
        id: result.agreement.id,
        type: 'agreement',
        attributes: result.agreement,
        links: {
          approve: result.url,
        },
        meta: {
          token: result.token,
        },
      };
    }
  }

  // no need to approve free plan
  return {
    id: 'free',
    type: 'agreement',
    attributes: {},
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
 * @apiParam (Params) {String}  data.type Data type, must be 'switch'.
 * @apiParam (Params) {Object}  data.attributes Details.
 * @apiParam (Params) {Boolean} data.attributes.user User id, by default uses current user. If user is not admin, overwrites any value with current user.
 * @apiParam (Params) {String}  data.attributes.agreement New agreement data, same as what is passed to agreementCreate.
 * @apiParam (Params) {String}  data.attributes.agreement.name Any name, required.
 * @apiParam (Params) {String}  data.attributes.agreement.description Any description, optional.
 * @apiParam (Params) {String}  data.attributes.agreement.start_date Optional date-time to start billing cycle. If not specified, current moment will be used.
 * @apiParam (Params) {String}  data.attributes.agreement.plan Plan id, required.
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X PATCH \
 *     -H 'Accept-Version: *' \
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/payments/plans/switch"
 *
 * @apiUse ValidationError
 * @apiUse UnauthorizedError
 * @apiUse ForbiddenResponse
 *
 * @apiSuccessExample {json} Success-Updated:
 *  HTTP/1.1 200 No Content
 */
exports.post = {
  path: '/plans/switch',
  middleware: ['auth'],
  handlers: {
    '1.0.0': function planSwitch(req, res, next) {
      return execute(req).then(() => { res.send(200); }).asCallback(next);
    },
  },
};
