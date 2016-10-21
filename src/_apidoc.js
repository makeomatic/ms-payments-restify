/**
 * @apiDefine UserPermission User
 * This method can be called by any authorized user, including admin.
 */

/**
 * @apiDefine AdminPermission Admin
 * This method can be called by admin only.
 */

/**
 * @apiDefine NonePermission None
 * This method can be called by anyone (intended for cron use).
 */

/**
 * @apiDefine 201 Response: Created
 * Object has been successfully created.
 */

/**
 * @apiDefine 200 Response: OK
 * Request completed successfully.
 */

/**
 * @apiDefine ValidationError
 *
 * @apiError (Code 400) {Object}    meta                  response meta information
 * @apiError (Code 400) {String}    meta.id               request id
 * @apiError (Code 400) {Object[]}  errors                array of errors
 * @apiError (Code 400) {String}    errors.status         text code of error
 * @apiError (Code 400) {String}    errors.title          short error description
 * @apiError (Code 400) {String}    errors.code           code of error
 * @apiError (Code 400) {Object[]}  errors.detail         embedded errors that happened
 * @apiError (Code 400) {String}    errors.detail.text    short description of error
 * @apiError (Code 400) {String}    errors.detail.code    error code
 * @apiError (Code 400) {String}    errors.detail.field   input field, which was involved
 *
 * @apiErrorExample {json} ValidationError:
 *     HTTP/1.1 400 BadRequest
 *     {
 *       "meta": {
 *         "id": "request-id"
 *       },
 *       "errors": [{
 *         "status": "ValidationError",
 *         "code": 400,
 *         "title": "short description of the errors",
 *         "detail": [{
 *           "text": "invalid input type",
 *           "code": 400,
 *           "field": "data.type"
 *         }]
 *       }]
 *     }
 */

/**
 * @apiDefine UnauthorizedError
 *
 * @apiError (Code 401) {Object}    meta            response meta information
 * @apiError (Code 401) {String}    meta.id         request id
 * @apiError (Code 401) {Object[]}  errors          array of errors
 * @apiError (Code 401) {String}    errors.status   text code of error
 * @apiError (Code 401) {String}    errors.title    short error description
 * @apiError (Code 401) {String}    errors.code     code of error
 *
 * @apiErrorExample {json} UnauthorizedError:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "meta": {
 *         "id": "request-id"
 *       },
 *       "errors": [{
 *         "status": "HttpStatusError",
 *         "code": 401,
 *         "title": "you must authorize to use this endpoint",
 *       }]
 *     }
 */

/**
 * @apiDefine PaymentRequiredError
 *
 * @apiError (Code 402) {Object}    meta            response meta information
 * @apiError (Code 402) {String}    meta.id         request id
 * @apiError (Code 402) {Object[]}  errors          array of errors
 * @apiError (Code 402) {String}    errors.status   text code of error
 * @apiError (Code 402) {String}    errors.title    short error description
 * @apiError (Code 402) {String}    errors.code     code of error
 *
 * @apiErrorExample {json} UnauthorizedError:
 *     HTTP/1.1 402 Payment Required
 *     {
 *       "meta": {
 *         "id": "request-id"
 *       },
 *       "errors": [{
 *         "status": "HttpStatusError",
 *         "code": 402,
 *         "title": "no more paid models left",
 *       }]
 *     }
 */

/**
 * @apiDefine ForbiddenResponse
 *
 * @apiError (Code 403) {Object}    meta           response meta information
 * @apiError (Code 403) {String}    meta.id        request id
 * @apiError (Code 403) {Object[]}  errors         array of errors
 * @apiError (Code 403) {String}    errors.status  text code of error
 * @apiError (Code 403) {String}    errors.title   short error description
 * @apiError (Code 403) {String}    errors.code    code of error
 *
 * @apiErrorExample {json} ForbiddenResponse:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "meta": {
 *         "id": "request-id"
 *       },
 *       "errors": [{
 *         "status": "HttpStatusError",
 *         "code": 403,
 *         "title": "insufficient rights to perform this operation",
 *       }]
 *     }
 */

/**
 * @apiDefine UserNotFoundError
 *
 * @apiError (Code 404) {Object}    meta           response meta information
 * @apiError (Code 404) {String}    meta.id        request id
 * @apiError (Code 404) {Object[]}  errors         array of errors
 * @apiError (Code 404) {String}    errors.status  text code of error
 * @apiError (Code 404) {String}    errors.title   short error description
 * @apiError (Code 404) {String}    errors.code    code of error
 *
 * @apiErrorExample {json} UserNotFoundError:
 *     HTTP/1.1 404 NotFound
 *     {
 *       "meta": {
 *         "id": "request-id"
 *       },
 *       "errors": [{
 *         "status": "HttpStatusError",
 *         "code": 404,
 *         "title": "user test@example.com not found",
 *       }]
 *     }
 */

/**
 * @apiDefine FileNotFoundError
 *
 * @apiError (Code 404) {Object}    meta           response meta information
 * @apiError (Code 404) {String}    meta.id        request id
 * @apiError (Code 404) {Object[]}  errors         array of errors
 * @apiError (Code 404) {String}    errors.status  text code of error
 * @apiError (Code 404) {String}    errors.title   short error description
 * @apiError (Code 404) {String}    errors.code    code of error
 *
 * @apiErrorExample {json} UserNotFoundError:
 *     HTTP/1.1 404 NotFound
 *     {
 *       "meta": {
 *         "id": "request-id"
 *       },
 *       "errors": [{
 *         "status": "HttpStatusError",
 *         "code": 404,
 *         "title": "file :filename was not found",
 *       }]
 *     }
 */

/**
 * @apiDefine NotAllowedError
 *
 * @apiError (Code 405) {Object}    meta           response meta information
 * @apiError (Code 405) {String}    meta.id        request id
 * @apiError (Code 405) {Object[]}  errors         array of errors
 * @apiError (Code 405) {String}    errors.status  text code of error
 * @apiError (Code 405) {String}    errors.title   short error description
 * @apiError (Code 405) {String}    errors.code    code of error
 *
 * @apiErrorExample {json} PreconditionFailedError:
 *     HTTP/1.1 405 Not Allowed
 *     {
 *       "meta": {
 *         "id": "request-id"
 *       },
 *       "errors": [{
 *         "status": "HttpStatusError",
 *         "code": 405,
 *         "title": "provider reports that upload was not finished yet",
 *       }]
 *     }
 *
 */

/**
 * @apiDefine PreconditionFailedError
 *
 * @apiError (Code 412) {Object}    meta           response meta information
 * @apiError (Code 412) {String}    meta.id        request id
 * @apiError (Code 412) {Object[]}  errors         array of errors
 * @apiError (Code 412) {String}    errors.status  text code of error
 * @apiError (Code 412) {String}    errors.title   short error description
 * @apiError (Code 412) {String}    errors.code    code of error
 *
 * @apiErrorExample {json} PreconditionFailedError:
 *     HTTP/1.1 412 Precondition Failed
 *     {
 *       "meta": {
 *         "id": "request-id"
 *       },
 *       "errors": [{
 *         "status": "HttpStatusError",
 *         "code": 412,
 *         "title": "user is already active",
 *       }]
 *     }
 *
 */

/**
 * @apiDefine LockedError
 *
 * @apiError (Code 423) {Object}    meta           response meta information
 * @apiError (Code 423) {String}    meta.id        request id
 * @apiError (Code 423) {Object[]}  errors         array of errors
 * @apiError (Code 423) {String}    errors.status  text code of error
 * @apiError (Code 423) {String}    errors.title   short error description
 * @apiError (Code 423) {String}    errors.code    code of error
 *
 * @apiErrorExample {json} LockedError:
 *     HTTP/1.1 423 Locked
 *     {
 *       "meta": {
 *         "id": "request-id"
 *       },
 *       "errors": [{
 *         "status": "HttpStatusError",
 *         "code": 423,
 *         "title": "account has been locked",
 *       }]
 *     }
 */

/**
 * @apiDefine TooManyRequestsError
 *
 * @apiError (Code 429) {Object}    meta           response meta information
 * @apiError (Code 429) {String}    meta.id        request id
 * @apiError (Code 429) {Object[]}  errors         array of errors
 * @apiError (Code 429) {String}    errors.status  text code of error
 * @apiError (Code 429) {String}    errors.title   short error description
 * @apiError (Code 429) {String}    errors.code    code of error
 *
 * @apiErrorExample {json} PreconditionFailedError:
 *     HTTP/1.1 429 Too Many Requests
 *     {
 *       "meta": {
 *         "id": "request-id"
 *       },
 *       "errors": [{
 *         "status": "HttpStatusError",
 *         "code": 429,
 *         "title": "you have requested to perform this action too many times",
 *       }]
 *     }
 */

/**
 * @apiDefine UserAuthResponse
 *
 * @apiSuccess (Code 200) {Object} meta              response meta information
 * @apiSuccess (Code 200) {String} meta.id           request id
 * @apiSuccess (Code 200) {String} meta.jwt          jsonwebtoken to be used for further authentication
 * @apiSuccess (Code 200) {Object} data              response data
 * @apiSuccess (Code 200) {String} data.type         response data type - always `user`
 * @apiSuccess (Code 200) {String} data.id           username, always an email
 * @apiSuccess (Code 200) {Object} data.attributes   user attributes
 * @apiSuccess (Code 200) {Object} data.links        user links
 * @apiSuccess (Code 200) {String} data.links.self   link to the user resource
 *
 * @apiSuccessExample {json} Success-User:
 *     HTTP/1.1 200 OK
 *     {
 *       "meta": {
 *         "id": "request-id",
 *         "jwt": "jsonwebtoken"
 *       },
 *       "data": {
 *         "type": "user",
 *         "id": "user@example.com",
 *         "attributes": {
 *           "firstName": "Anna",
 *           "lastName": "Maria"
 *         },
 *         "links": {
 *           "self": "https://localhost:443/api/users/user%40example.com"
 *         }
 *       }
 *     }
 */
