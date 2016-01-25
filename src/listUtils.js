const Promise = require('bluebird');
const mixins = require('mm-lodash');
const ld = require('lodash').runInContext();
ld.mixin(mixins);

const Errors = require('common-errors');
const validator = require('./validator.js');

const config = require('./config.js');
const { getRoute, getTimeout } = config;

const { stringify: qs } = require('querystring');

const USER_PROTECTED_ROUTES = ['agreementList', 'saleList', 'transactionList', 'transactionCommon'];

function createRequest(req, ROUTE_NAME) {
  return Promise.try(function verifyRights() {
    const { order, filter, offset, limit, sortBy } = req.query;
    const parsedFilter = filter && JSON.parse(decodeURIComponent(filter)) || {};

    if (!req.user || !req.user.isAdmin()) {
      if (USER_PROTECTED_ROUTES.indexOf(ROUTE_NAME) !== -1) {
        // user is always defined here as required by the right
        parsedFilter.owner = req.user.id;
      } else if (ROUTE_NAME === 'planList') {
        parsedFilter.hidden = 'false';
      }
    }

    return ld.compactObject({
      order: (order || 'DESC').toUpperCase(),
      offset: offset && +offset || undefined,
      limit: limit && +limit || 10,
      filter: parsedFilter,
      criteria: sortBy && decodeURIComponent(sortBy) || undefined,
    });
  })
  .catch(function validationError(err) {
    req.log.error('input error', err);
    throw new Errors.HttpStatusError(400, 'query.filter and query.sortBy must be uri encoded, and query.filter must be a valid JSON object'); // eslint-disable-line max-len
  })
  .then(function validateMessage(message) {
    return validator.validate('list', message);
  })
  .then(function askAMQP(message) {
    return Promise.join(
      req.amqp.publishAndWait(getRoute(ROUTE_NAME), message, { timeout: getTimeout(ROUTE_NAME) }),
      message
    );
  });
}

function modelTransform(model, isAdmin) {
  return function transform(item) {
    return model.transform(item, true, isAdmin);
  };
}

function dataTransform(type, idField) {
  if (idField) {
    return function transform(item) {
      return {
        id: ld.get(item, idField),
        type,
        attributes: item,
      };
    };
  }

  return function transform(item) {
    return {
      type,
      attributes: item,
    };
  };
}

function createResponse(res, subroute, type, idField, isAdmin) {
  return (answer, message) => {
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

    const base = `${config.host}${config.payments.attachPoint}/${subroute}`;
    res.links = {
      self: `${base}?${qs(selfQS)}`,
    };

    if (page < pages) {
      const nextQS = Object.assign({}, selfQS, { offset: cursor });
      res.meta.cursor = cursor;
      res.links.next = `${base}?${qs(nextQS)}`;
    }

    const transform = typeof type === 'function' ? modelTransform(type, isAdmin) : dataTransform(type, idField); // eslint-disable-line max-len
    return Promise.resolve(answer.items.map(transform));
  };
}

exports.createRequest = createRequest;
exports.createResponse = createResponse;
