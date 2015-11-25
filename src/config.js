const ld = require('lodash');
const users = require('ms-users-restify');

/**
 * Default configuration object
 * @type {Object}
 */
const config = module.exports = {
  users: {},
  files: {
    prefix: "payments",
    postfix: {
      "planCreate": "plan.create"
    },
    timeouts: {},
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
  ld.merge(config, opts);
  users.reconfigure(config);
};

/**
 * returns timeout for a route
 */
exports.getTimeout = function getTimeout(route) {
  return config.files.timeouts[route] || 5000;
};

/**
 * Returns text route
 */
exports.getRoute = function getRoute(route) {
  const files = config.files;
  return [files.prefix, files.postfix[route]].join('.');
};
