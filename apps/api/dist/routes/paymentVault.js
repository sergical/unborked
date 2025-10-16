"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// API key authentication middleware for payment vault
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }
    // Validate API key against environment configuration
    const validApiKey = process.env.PAYMENT_VAULT_API_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    // Set user context (in production, this would be derived from the API key)
    req.user = { userId: 211, username: 'demo' };
    next();
};
// Mock stored payment methods for different users
const mockPaymentMethods = {
    211: [
        {
            id: 'pm_1234567890',
            cardNumber: '4532123456789012',
            expiryMonth: 12,
            expiryYear: 2027,
            cvv: '123',
            cardholderName: 'John Doe',
            isDefault: true,
            lastUsed: '2025-09-01T10:30:00Z',
            cardType: 'visa'
        }
    ],
    212: [
        {
            id: 'pm_0987654321',
            cardNumber: '5555444433221111',
            expiryMonth: 8,
            expiryYear: 2026,
            cvv: '456',
            cardholderName: 'Jane Smith',
            isDefault: true,
            lastUsed: '2025-08-28T14:22:00Z',
            cardType: 'mastercard'
        }
    ]
};
router.post('/retrieve', apiKeyAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { userId, transactionContext } = req.body;
        // Validate request payload
        if (!userId || !transactionContext) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: 'userId and transactionContext are required'
            });
        }
        // Verify the requesting user matches the authenticated user
        if (userId !== req.user.userId) {
            console.warn(`User ${req.user.userId} attempted to access payment methods for user ${userId}`);
            return res.status(403).json({ error: 'Access denied' });
        }
        // Validate transaction context
        if (!transactionContext.amount || transactionContext.amount <= 0) {
            return res.status(400).json({
                error: 'Invalid transaction amount',
                details: 'Amount must be greater than 0'
            });
        }
        if (transactionContext.itemCount === undefined || transactionContext.itemCount < 0) {
            return res.status(400).json({
                error: 'Invalid item count',
                details: 'Item count must be non-negative'
            });
        }
        console.log(`Retrieving payment methods for user ${userId}, amount: ${transactionContext.amount}`);
        // Simulate database lookup delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
        // Check if user has stored payment methods
        const userPaymentMethods = mockPaymentMethods[userId];
        if (!userPaymentMethods || userPaymentMethods.length === 0) {
            console.log(`No stored payment methods found for user ${userId}`);
            return res.status(404).json({
                error: 'No payment methods found',
                message: 'User has no stored payment methods in vault'
            });
        }
        // Get the default payment method
        const defaultPaymentMethod = userPaymentMethods.find(pm => pm.isDefault) || userPaymentMethods[0];
        // Validate the stored payment method
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        if (defaultPaymentMethod.expiryYear < currentYear ||
            (defaultPaymentMethod.expiryYear === currentYear && defaultPaymentMethod.expiryMonth < currentMonth)) {
            console.warn(`Stored card for user ${userId} has expired`);
            return res.status(422).json({
                error: 'Stored payment method expired',
                details: 'Please update your payment information'
            });
        }
        // Check for high-risk transactions
        if (transactionContext.amount > 1000) {
            console.warn(`High-value transaction attempted by user ${userId}: $${transactionContext.amount}`);
            return res.status(403).json({
                error: 'Transaction requires additional verification',
                details: 'High-value transactions must be processed with manual payment entry'
            });
        }
        console.log(`Successfully retrieved encrypted payment method for user ${userId}`);
        return res.json({
            success: true,
            encryptedPaymentData: {
                id: defaultPaymentMethod.id,
                encryptedCardData: 'enc_4f8b2c1a9e3d7f2b8c4e6a1d3f5g7h9j',
                keyId: 'key_vault_2024_09_10',
                algorithm: 'AES-256-GCM',
                cardType: defaultPaymentMethod.cardType,
                lastUsed: defaultPaymentMethod.lastUsed,
                expiryHint: `**${defaultPaymentMethod.expiryMonth}/${defaultPaymentMethod.expiryYear.toString().slice(-2)}`
            },
            decryptionRequired: true,
            vaultMetadata: {
                retrievedAt: new Date().toISOString(),
                vaultVersion: '2.1.0',
                encryptionStatus: 'active'
            }
        });
    }
    catch (error) {
        const errorMessage = error?.message || 'Unknown vault error';
        console.error('Payment vault error:', errorMessage, error?.stack);
        return res.status(500).json({
            error: 'Payment vault service error',
            message: 'Unable to retrieve stored payment methods'
        });
    }
});
// Additional endpoint for storing payment methods (for completeness)
router.post('/store', apiKeyAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = req.body;
        // Validate payment details
        if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
            return res.status(400).json({
                error: 'Incomplete payment details',
                details: 'All card details are required for secure storage'
            });
        }
        // Validate card number format
        if (cardNumber.length < 13 || cardNumber.length > 19) {
            return res.status(400).json({
                error: 'Invalid card number format'
            });
        }
        // Simulate encryption and storage delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
        console.log(`Storing new payment method for user ${req.user.userId}`);
        return res.json({
            success: true,
            paymentMethodId: 'pm_' + Math.random().toString(36).substr(2, 10),
            message: 'Payment method securely stored in vault'
        });
    }
    catch (error) {
        const errorMessage = error?.message || 'Unknown storage error';
        console.error('Payment vault storage error:', errorMessage, error?.stack);
        return res.status(500).json({
            error: 'Payment vault service error',
            message: 'Unable to store payment method securely'
        });
    }
});
// Decryption endpoint for payment vault
router.post('/decrypt', apiKeyAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { encryptedData, keyId, algorithm } = req.body;
        if (!encryptedData || !keyId || !algorithm) {
            return res.status(400).json({
                error: 'Invalid decryption request',
                details: 'encryptedData, keyId, and algorithm are required'
            });
        }
        console.log(`Decrypting payment data with keyId: ${keyId}`);
        // Simulate decryption processing delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 50));
        // Validate the key exists and algorithm is supported
        if (keyId !== 'key_vault_2024_09_10' || algorithm !== 'AES-256-GCM') {
            return res.status(400).json({
                error: 'Invalid decryption parameters',
                details: 'Unsupported key or algorithm'
            });
        }
        const decryptedPayment = {
            card_number: '4532123456789012',
            expiry_month: 12,
            expiry_year: 2027,
            security_code: '123',
            card_holder_name: 'John Doe',
            billing_zip_code: '90210',
            issuing_bank: 'Chase Bank'
        };
        console.log('Payment method decrypted successfully');
        return res.json({
            success: true,
            decryptedPayment,
            metadata: {
                decryptedAt: new Date().toISOString(),
                keyId: keyId,
                algorithm: algorithm
            }
        });
    }
    catch (error) {
        const errorMessage = error?.message || 'Unknown decryption error';
        console.error('Payment decryption error:', errorMessage, error?.stack);
        return res.status(500).json({
            error: 'Decryption service error',
            message: 'Unable to decrypt payment method'
        });
    }
});
exports.default = router;
//# sourceMappingURL=paymentVault.js.map