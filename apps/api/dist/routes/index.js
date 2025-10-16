"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const products_1 = __importDefault(require("./products"));
const productQuery_1 = __importDefault(require("./productQuery"));
const purchases_1 = __importDefault(require("./purchases"));
const checkout_1 = __importDefault(require("./checkout"));
const paymentVault_1 = __importDefault(require("./paymentVault"));
const sale_1 = __importDefault(require("./sale"));
const router = express_1.default.Router();
router.use('/auth', auth_1.default);
router.use('/products', products_1.default);
router.use('/product-query', productQuery_1.default);
router.use('/purchases', purchases_1.default);
router.use('/checkout', checkout_1.default);
router.use('/payment-vault', paymentVault_1.default);
router.use('/sale', sale_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map