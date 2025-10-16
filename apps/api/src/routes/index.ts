import express from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import productQueryRoutes from './productQuery';
import purchaseRoutes from './purchases';
import checkoutRoutes from './checkout';
import paymentVaultRoutes from './paymentVault';
import saleRoutes from './sale';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/product-query', productQueryRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/payment-vault', paymentVaultRoutes);
router.use('/sale', saleRoutes);

export default router;
