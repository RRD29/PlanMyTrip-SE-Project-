import React, { useState } from 'react';
import useApi from '../../hooks/useApi';
import { PageLoader, SkeletonText } from '../../components/common/Loaders';
import Button from '../../components/common/Button';

// --- MOCK DATA (Remove when API is ready) ---
const MOCK_TRANSACTIONS = [
  { _id: 't1', bookingId: 'b101', user: 'Alice Smith', guide: 'Bob Johnson', amount: 250, status: 'Paid/Escrowed', date: '2025-10-20T10:00:00Z' },
  { _id: 't2', bookingId: 'b102', user: 'Charlie Brown', guide: 'David Lee', amount: 400, status: 'Completed', date: '2025-10-19T11:30:00Z' },
  { _id: 't3', bookingId: 'b103', user: 'Eve Davis', guide: 'Frank White', amount: 320, status: 'Disputed', date: '2025-10-18T14:15:00Z' },
  { _id: 't4', bookingId: 'b104', user: 'Grace Hall', guide: 'Bob Johnson', amount: 180, status: 'Paid/Escrowed', date: '2025-10-17T09:05:00Z' },
];
// ---------------------------------------------

// Skeleton row for loading state
const TransactionRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-5 w-1/2" /></td>
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-5 w-3/4" /></td>
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-5 w-3/4" /></td>
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-5 w-1/2" /></td>
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-6 w-24" /></td>
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-5 w-3/4" /></td>
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-8 w-24" /></td>
  </tr>
);

// Helper to get color for status badge
const getStatusColor = (status) => {
  switch (status) {
    case 'Paid/Escrowed':
      return 'bg-yellow-100 text-yellow-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Disputed':
      return 'bg-red-100 text-red-800';
    case 'Cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const EscrowTransactions = () => {
  // const { data: transactions, loading, error } = useApi('/admin/transactions');
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleManualRelease = (transactionId) => {
    if (window.confirm('Manually release payment to guide? This cannot be undone.')) {
      // API call to release funds
      console.log(`Releasing funds for ${transactionId}`);
    }
  };
  
  const handleRefund = (transactionId) => {
    if (window.confirm('Refund payment to user? This cannot be undone.')) {
      // API call to refund user
      console.log(`Refunding user for ${transactionId}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Escrow Transactions</h1>
      
      <div className="bg-white shadow border border-gray-200 rounded-lg overflow-x-auto">
        {error && <p className="text-red-500 p-4">Error fetching transactions: {error}</p>}
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guide</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <>
                <TransactionRowSkeleton />
                <TransactionRowSkeleton />
              </>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.bookingId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.guide}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tx.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {tx.status === 'Disputed' && (
                      <>
                        <Button variant="primary" size="sm" onClick={() => handleManualRelease(tx._id)}>Release</Button>
                        <Button variant="danger" size="sm" onClick={() => handleRefund(tx._id)}>Refund</Button>
                      </>
                    )}
                    {tx.status === 'Paid/Escrowed' && (
                       <Button variant="ghost" size="sm">View</Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EscrowTransactions;