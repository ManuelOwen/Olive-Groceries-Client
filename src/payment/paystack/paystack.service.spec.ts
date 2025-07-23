// NOTE: React components should not be placed in .spec.ts files. Rename this file to .tsx to use the component below.
/*
import React from 'react'
import Paystack from '@paystack/inline-js'

const PaystackDemoButton: React.FC = () => {
  const handlePaystackPayment = () => {
    const paystack = new Paystack();
    paystack.newTransaction({
      key: 'pk_test_dea6c2d0dce3fa2e9dbeacaed823a08d74cf3863',
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
*/
