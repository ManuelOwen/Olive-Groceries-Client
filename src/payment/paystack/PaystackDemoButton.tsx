// Paystack payment popup React component
// Usage: <PaystackDemoButton email={user.email} amount={totalAmount} onSuccess={callback} />
import React from 'react'
import Paystack from '@paystack/inline-js'

interface PaystackDemoButtonProps {
  email: string
  amount: number // Amount in Naira (will be multiplied by 100 for kobo)
  onSuccess?: (transaction: any) => void
}

const PaystackDemoButton: React.FC<PaystackDemoButtonProps> = ({ email, amount, onSuccess }) => {
  const handlePaystackPayment = () => {
    const paystack = new Paystack();
    paystack.newTransaction({
      key: 'pk_test_dea6c2d0dce3fa2e9dbeacaed823a08d74cf3863', // pass with your Paystack public key
      email: email || 'testuser@example.com',
      amount: Math.round(amount * 100), // Convert Naira to kobo
      onSuccess: (transaction: any) => {
        if (onSuccess) onSuccess(transaction)
        else alert('Payment complete! Reference: ' + transaction.reference);
      },
      onCancel: () => {
        alert('Payment cancelled');
      },
    });
  };

  return (
    <button
      onClick={handlePaystackPayment}
      style={{
        padding: '12px 24px',
        background: '#f97316',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
    >
      Pay with Paystack
    </button>
  );
};

export default PaystackDemoButton; 