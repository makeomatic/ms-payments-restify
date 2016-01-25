const merge = require('lodash/merge');
const omit = require('lodash/omit');
const users = require('ms-users-restify');
const BLACK_LIST = ['reconfigure', 'getTimeout', 'getRoute'];

/**
 * Default configuration object
 * @type {Object}
 */
const config = module.exports = {
  users: {
    audience: '*.localhost',
    prefix: 'users',
    postfix: {
      updateMetadata: 'updateMetadata',
      getMetadata: 'getMetadata',
    },
  },
  payments: {
    prefix: 'payments',
    postfix: {
      planCreate: 'plan.create',
      planUpdate: 'plan.update',
      planList: 'plan.list',
      planDelete: 'plan.delete',
      planState: 'plan.state',
      planGet: 'plan.get',
      agreementCreate: 'agreement.create',
      agreementExecute: 'agreement.execute',
      agreementList: 'agreement.list',
      agreementBill: 'agreement.bill',
      agreementState: 'agreement.state',
      agreementSync: 'agreement.sync',
      agreementGet: 'agreement.get',
      transactionGet: 'transaction.get',
      transactionList: 'transaction.list',
      transactionSync: 'transaction.sync',
      transactionCommon: 'transaction.common',
      saleCreate: 'sale.create',
      saleExecute: 'sale.execute',
      saleList: 'sale.list',
      saleSync: 'sale.sync',
      saleGet: 'sale.get',
    },
    timeouts: {
      agreementExecute: 25000,
      agreementCreate: 25000,
    },
    attachPoint: 'payments',
    serviceSecret: 'megasecret',
  },
};

/**
 * Returns configuration instance
 * @return {Object}
 */
module.exports = exports = config;

/**
 * Reconfigures instance
 */
exports.reconfigure = function reconfigure(opts) {
  merge(config, omit(opts, BLACK_LIST));
  users.reconfigure(omit(config, BLACK_LIST));
};

/**
 * returns timeout for a route
 */
exports.getTimeout = function getTimeout(route) {
  return config.payments.timeouts[route] || 5000;
};

/**
 * Returns text route
 */
exports.getRoute = function getRoute(route) {
  const payments = config.payments;
  return [payments.prefix, payments.postfix[route]].join('.');
};
