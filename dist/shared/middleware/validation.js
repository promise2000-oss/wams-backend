"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateParams = validateParams;
exports.validateQuery = validateQuery;
const zod_1 = require("zod");
function validate(schema, source = 'body') {
    return (req, res, next) => {
        try {
            const data = schema.parse(req[source]);
            req[source] = data;
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                return res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        requestId: req.requestId,
                        details: err.errors.map((e) => ({
                            path: e.path.join('.'),
                            message: e.message,
                        })),
                    },
                });
            }
            next(err);
        }
    };
}
function validateParams(schema) {
    return validate(schema, 'params');
}
function validateQuery(schema) {
    return validate(schema, 'query');
}
//# sourceMappingURL=validation.js.map