"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSentryNotification = sendSentryNotification;
const crypto_1 = __importDefault(require("crypto"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const SENTRY_WEBHOOK_URL = process.env.SENTRY_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.FEATURE_FLAG_WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
    throw new Error('FATAL ERROR: FEATURE_FLAG_WEBHOOK_SECRET is not defined in the environment.');
}
// Ensure Sentry webhook URL ends with a trailing slash
const ensuredSentryUrl = SENTRY_WEBHOOK_URL && !SENTRY_WEBHOOK_URL.endsWith('/')
    ? `${SENTRY_WEBHOOK_URL}/`
    : SENTRY_WEBHOOK_URL;
function hmacSha256HexDigest(secret, message) {
    return crypto_1.default.createHmac('sha256', secret)
        .update(message, 'utf-8')
        .digest('hex');
}
async function sendSentryNotification(flagName, action, userId, userType) {
    console.log(`\n📣 SENDING SENTRY NOTIFICATION 📣`);
    console.log(`🏷️  Flag: ${flagName}`);
    console.log(`🔄  Action: ${action}`);
    const now = new Date();
    const createdAt = now.toISOString().replace(/\.\d{3}Z$/, '+00:00');
    const changeId = Math.floor(Date.now()).toString();
    console.log(`🔑 Using change_id: ${changeId}`);
    const payload = {
        meta: { version: 1 },
        data: [{
                action,
                change_id: changeId,
                created_at: createdAt,
                created_by: {
                    id: userId || 'admin-menu@unborked.app',
                    type: userType || 'email',
                },
                flag: flagName,
            }],
    };
    let body = JSON.stringify(payload);
    body = body.replace(/"change_id":"(\d+)"/g, '"change_id":$1');
    const signature = hmacSha256HexDigest(WEBHOOK_SECRET, body);
    try {
        const sentryResponse = await fetch(ensuredSentryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Sentry-Signature': signature
            },
            body,
        });
        if (!sentryResponse.ok) {
            const errorText = await sentryResponse.text();
            console.error(`❌ Sentry webhook notification failed for ${flagName}: ${sentryResponse.status}`);
            console.error(`❌ Response body: ${errorText}`);
            return false;
        }
        const responseBody = await sentryResponse.text();
        console.log(`✅ Sentry notification sent successfully for ${flagName} (${action}).`);
        console.log(`✅ Response body: ${responseBody}`);
        return true;
    }
    catch (error) {
        console.error(`❌ Error sending Sentry notification for ${flagName}:`, error);
        return false;
    }
    finally {
        console.log(`📣 SENTRY NOTIFICATION COMPLETE 📣\n`);
    }
}
//# sourceMappingURL=sentry.js.map