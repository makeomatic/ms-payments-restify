const Promise = require('bluebird');

const ld = require('lodash').runInContext();
ld.mixin(require('mm-lodash'));

const Errors = require('common-errors');
const validator = require('./validator.js');

const config = require('./config.js');
const { getRoute, getTimeout } = config;

const { stringify: qs } = require('querystring');

function createRequest(req, ROUTE_NAME) {
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
  });
}

function createResponse(res) {
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

    const base = config.host + config.files.attachPoint;
    res.links = {
      self: `${base}?${qs(selfQS)}`,
    };

    if (page < pages) {
      const nextQS = Object.assign({}, selfQS, { offset: cursor });
      res.meta.cursor = cursor;
      res.links.next = `${base}?${qs(nextQS)}`;
    }

    return Promise.resolve(answer.items);
  };
}

module.exports.createRequest = createRequest;
module.exports.createResponse = createResponse;
