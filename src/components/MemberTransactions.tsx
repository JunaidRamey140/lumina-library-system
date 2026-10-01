import { useState, useEffect } from 'react';
import { transactionService, Transaction } from '../lib/transactionService';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react';

export function MemberTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    try {
      const data = await transactionService.getUserTransactions(user!.uid);
      setTransactions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id: string, bookId: string) => {
    try {
      await transactionService.returnBook(id, bookId);
      alert("Book returned successfully!");
      loadTransactions();
    } catch (error) {
      alert("Error returning book");
    }
  };

  if (loading) return <div className="text-center py-20 text-zinc-400">Loading your history...</div>;

  const activeTransactions = transactions.filter(t => t.status === 'issued');
  const pastTransactions = transactions.filter(t => t.status !== 'issued');

  return (
    <div className="space-y-12" id="member-transactions">
      <section>
        <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <BookOpen className="text-emerald-600" size={24} />
          Your Active Borrowings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTransactions.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-3xl border border-zinc-200 flex flex-col gap-4 shadow-sm" id={`transaction-${t.id}`}>
              <div>
                <h3 className="font-bold text-lg text-zinc-900">{t.bookTitle}</h3>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                    <Calendar size={14} className="text-zinc-400" />
                    Due: {new Date(t.dueDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                    <Clock size={14} />
                    Active
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleReturn(t.id!, t.bookId)}
                className="w-full py-3 bg-zinc-950 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors text-sm"
              >
                Mark as Returned
              </button>
            </div>
          ))}
          {activeTransactions.length === 0 && (
            <div className="col-span-full py-10 text-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 text-zinc-400 text-sm">
              You don't have any books currently borrowed.
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <History className="text-blue-600" size={24} />
          Borrowing History
        </h2>
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Book Title</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Issue Date</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Return Date</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {pastTransactions.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-zinc-900">{t.bookTitle}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {t.issueDate?.seconds ? new Date(t.issueDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {t.returnDate?.seconds ? new Date(t.returnDate.seconds * 1000).toLocaleDateString() : 'In transit'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                      <CheckCircle size={10} />
                      Returned
                    </span>
                  </td>
                </tr>
              ))}
              {pastTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-zinc-400 text-sm italic">No past transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

import { History } from 'lucide-react';
