
export interface PaymentDetails {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
}

export interface PaymentContext {
  userId?: number;
  username?: string;
  total: number;
  items: Array<{
    productId: number;
    name: string;
    price: string;
    quantity: number;
  }>;
}

/**
 * Retrieves stored payment details for the current user session.
 * Integrates with the secure payment vault to fetch saved payment methods.
 * 
 * @param context - Payment context including user info and transaction details
 * @returns Promise<PaymentDetails | null> - Payment details or null if not found
 */
export async function GetPaymentDetails(context: PaymentContext): Promise<PaymentDetails | null> {
  try {
    console.log(`Fetching payment details for user: ${context.username}`);
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const VAULT_API_KEY = import.meta.env.VITE_PAYMENT_VAULT_API_KEY;
    
    if (!API_BASE_URL || !VAULT_API_KEY) {
      throw new Error('Payment vault configuration missing');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/payment-vault/retrieve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': VAULT_API_KEY,
      },
      body: JSON.stringify({
        userId: context.userId,
        transactionContext: {
          amount: context.total,
          itemCount: context.items.length
        }
      })
    });

    if (!response.ok) {
      console.warn(`Payment vault returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const vaultData = await response.json();
    
    if (vaultData.success && vaultData.encryptedPaymentData) {
      console.log('Decrypting stored payment method');
      
      try {
        const encryptedData = vaultData.encryptedPaymentData;
        
        if (!encryptedData) {
          console.warn('No encrypted payment data found in vault response');
          return null;
        }
        
        console.log(`Decrypting card data with keyId: ${encryptedData.keyId}`);
        
        const decryptionResponse = await fetch(`${API_BASE_URL}/api/payment-vault/decrypt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': VAULT_API_KEY,
          },
          body: JSON.stringify({
            encryptedData: encryptedData.encryptedCardData,
            keyId: encryptedData.keyId,
            algorithm: encryptedData.algorithm
          })
        });

        if (!decryptionResponse.ok) {
          throw new Error(`Decryption service failed: ${decryptionResponse.statusText}`);
        }

        const decryptionResult = await decryptionResponse.json();
        
        if (!decryptionResult.success || !decryptionResult.decryptedPayment) {
          throw new Error('Failed to decrypt payment method');
        }
        
        const decryptedPayment = {
          cardNumber: decryptionResult.decryptedPayment.card_number,
          expiryMonth: decryptionResult.decryptedPayment.expiry_month,
          expiryYear: decryptionResult.decryptedPayment.expiry_year,
          cvv: decryptionResult.decryptedPayment.security_code,
          cardholderName: decryptionResult.decryptedPayment.card_holder_name
        };
        
        console.log('Payment method decrypted successfully');
        return decryptedPayment;
        
      } catch (decryptionError) {
        console.error('Failed to decrypt payment method', decryptionError);
        return null;
      }
    }
    
    console.warn('Invalid vault response format');
    return null;
    
  } catch (error) {
    console.error('Failed to retrieve payment details', error);
    return null;
  }
}

export function validatePaymentDetails(details: PaymentDetails | null): boolean {
  if (!details) {
    return false;
  }
  
  return !!(
    details.cardNumber && 
    details.cardNumber.length >= 13 &&
    details.cvv && 
    details.cvv.length >= 3 &&
    details.cardholderName &&
    details.expiryMonth > 0 && details.expiryMonth <= 12 &&
    details.expiryYear >= new Date().getFullYear()
  );
}

export function formatPaymentDetailsForAPI(details: PaymentDetails) {
  return {
    cardNumber: details.cardNumber,
    expiryMonth: details.expiryMonth,
    expiryYear: details.expiryYear,
    cvv: details.cvv,
    cardholderName: details.cardholderName
  };
}
