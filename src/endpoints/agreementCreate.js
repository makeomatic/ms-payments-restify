const moment = require('moment');

const validator = require('../validator.js');
const config = require('../config.js');
const { getRoute, getTimeout } = config;
const ROUTE_NAME = 'agreementCreate';

/**
 * @api {post} /agreements Create new agreement
 * @apiVersion 1.0.0
 * @apiName CreateAgreement
 * @apiGroup Agreements
 * @apiPermission UserPermission
 *
 * @apiDescription
 * Returns new agreement object and link to approve it by user in Location header.
 * Link is also included in agreement.links[rel='approval_url'], user must open it in browser to approve agreement.
 *
 * @apiHeader (Authorization) {String} Authorization JWT :accessToken
 * @apiHeaderExample Authorization-Example:
 *   "Authorization: JWT myreallyniceandvalidjsonwebtoken"
 *
 * @apiParam (Params) {Object} data Data container.
 * @apiParam (Params) {Object} data.type Data type, must be 'agreement'.
 * @apiParam (Params) {Object} data.attributes.name Any name, required.
 * @apiParam (Params) {Object} data.attributes.description Any description, optional.
 * @apiParam (Params) {Object} data.attributes.start_date Optional date-time to start billing cycle. If not specified, current moment will be used.
 * @apiParam (Params) {Object} data.attributes.plan Plan id, required.
 *
 * @apiSuccess (Return)
 *
 * @apiExample {curl} Example usage:
 *   curl -i -X POST
 *     -H 'Accept-Version: *'
 *     -H 'Accept: application/vnd.api+json' -H 'Accept-Encoding: gzip, deflate' \
 *     -H "Authorization: JWT therealtokenhere" \
 *     "https://api-sandbox.cappacity.matic.ninja/api/agreements"
 *     -d '{ data: {...} }'
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
    '1.0.0': (req, res, next) => {
      return validator.validate('agreement.create', req.body)
        .then((body) => {
          const dateFormat = 'YYYY-MM-DDTHH:MM:SSZ';
          const realDate = body.attributes.start_date && moment(body.attributes.start_date) || moment();
          const message = {
            name: body.attributes.name,
            description: body.attributes.description,
            start_date: realDate.format(dateFormat),
            plan: {
              id: body.attributes.plan,
            },
            payer: {
              payment_method: 'paypal',
            },
          };
          return req.amqp.publishAndWait(getRoute(ROUTE_NAME), message, {timeout: getTimeout(ROUTE_NAME)});
        })
        .then(result => {
          const response = {
            'data': {
              'id': result.agreement.id,
              'type': 'agreement',
              'attributes': result.agreement,
              'links': {
                'approve': result.url,
              },
              'meta': {
                'token': result.token,
              },
            },
          };
          res.status(201).send(response);
        })
        .asCallback(next);
    },
  },
};
