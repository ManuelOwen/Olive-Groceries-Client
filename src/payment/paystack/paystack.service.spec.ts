// Demo Paystack payment popup React component for testing Paystack integration
import React from 'react'
import Paystack from '@paystack/inline-js'

const PaystackDemoButton: React.FC = () => {
  const handlePaystackPayment = () => {
    const paystack = new Paystack();
    paystack.newTransaction({
      key: 'sk_test_9c9dbfb64727d1f10d66e9e07c65c3aa4ba92113', 
      email: 'owenmannuu9@gmail.com',
      amount: 5000,
      onSuccess: (transaction: any) => {
        alert('Payment complete! Reference: ' + transaction.reference);
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
      Pay with Paystack (Demo)
    </button>
  );
};

export default PaystackDemoButton;
