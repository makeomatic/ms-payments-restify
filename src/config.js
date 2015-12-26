const ld = require('lodash');
const users = require('ms-users-restify');
const BLACK_LIST = ['reconfigure', 'getTimeout', 'getRoute'];

/**
 * Default configuration object
 * @type {Object}
 */
const config = module.exports = {
  users: {},
  payments: {
    prefix: 'payments',
    postfix: {
      'planCreate': 'plan.create',
      'planUpdate': 'plan.update',
      'planList': 'plan.list',
      'planDelete': 'plan.delete',
      'planState': 'plan.state',
      'planGet': 'plan.get',
      'agreementCreate': 'agreement.create',
      'agreementExecute': 'agreement.execute',
      'agreementList': 'agreement.list',
      'agreementBill': 'agreement.bill',
      'agreementState': 'agreement.state',
      'transactionList': 'transaction.list',
      'transactionSync': 'transaction.sync',
      'saleCreate': 'sale.create',
      'saleExecute': 'sale.execute',
      'saleList': 'sale.list',
    },
    timeouts: {},
    attachPoint: 'payments',
  },
  // point these to address that will execute sale in case of return or delete sale in case of cancel.
  // w/o these endpoints sales will not work.
  sales: {
    return_url: '',
    cancel_url: '',
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
  ld.merge(config, ld.omit(opts, BLACK_LIST));
  users.reconfigure(ld.omit(config, BLACK_LIST));
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
