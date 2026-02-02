/**
 * Request Logger Middleware
 * Detailed logging in development; minimal in production
 */

const SENSITIVE_FIELDS = ['password', 'passwordconfirm', 'token', 'accesstoken', 'refreshtoken'];
const logger = require('../utils/logger');

const isDebug = (process.env.LOG_LEVEL === 'debug') || (process.env.LOG_LEVEL === undefined && process.env.NODE_ENV !== 'production');

function redact(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const copy = Array.isArray(obj) ? [...obj] : { ...obj };
    for (const key of Object.keys(copy)) {
        try {
            if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
                copy[key] = 'REDACTED';
            } else if (typeof copy[key] === 'object') {
                copy[key] = redact(copy[key]);
            }
        } catch (e) {
            // ignore
        }
    }
    return copy;
}

const requestLogger = (req, res, next) => {
    const isProd = process.env.NODE_ENV === 'production';

    const timestamp = new Date().toLocaleString('tr-TR');
    const method = req.method;
    const url = req.originalUrl;
    const userAgent = req.get('user-agent');
    const userId = req.session?.userId || 'Anonymous';

    if (isDebug) {
        logger.debug('\n' + '='.repeat(80));
        logger.debug(`[${timestamp}] 📊 API REQUEST`);
        logger.debug('='.repeat(80));
        logger.debug(`🔗 ${method} ${url}`);
        logger.debug(`👤 User ID: ${userId}`);
        logger.debug(`📱 User-Agent: ${userAgent}`);
        logger.debug('📦 Body:', redact(req.body) || 'No body');
        logger.debug('📋 Query:', redact(req.query) || 'No query');
        logger.debug('📁 Params:', redact(req.params) || 'No params');
        logger.debug('📸 Files:', req.files ? req.files.map(f => f.filename).join(', ') : 'No files');
        logger.debug('='.repeat(80));

        // Override res.json for debug logging
        const originalJson = res.json.bind(res);
        res.json = function (data) {
            const ts = new Date().toLocaleString('tr-TR');
            logger.debug('\n' + '='.repeat(80));
            logger.debug(`[${ts}] 📊 API RESPONSE`);
            logger.debug('='.repeat(80));
            logger.debug(`🔗 ${method} ${url}`);
            logger.debug(`✅ Status: ${res.statusCode}`);
            logger.debug(`📤 Response Data: ${JSON.stringify(data, null, 2)}`);
            logger.debug('='.repeat(80) + '\n');

            return originalJson(data);
        };

        // Track res.status in debug
        const originalStatus = res.status.bind(res);
        res.status = function (code) {
            res.statusCode = code;
            return originalStatus(code);
        };
    } else {
        // Minimal single-line request log in production
        const ts = new Date().toISOString();
        logger.info(`[${ts}] ${method} ${url} - ${userId}`);
    }

    next();
};

module.exports = requestLogger;
