import { 
  collection, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  orderBy,
  increment,
  runTransaction
} from 'firebase/firestore';
// NOTE: `doc(collection(...))` (no id) is used below to generate a
// Firestore-assigned document ID client-side *before* the transaction runs.
import { db } from './firebase';

export interface Transaction {
  id?: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  issueDate: any;
  dueDate: any;
  returnDate?: any;
  status: 'issued' | 'returned' | 'overdue';
}

const TRANSACTIONS_COLLECTION = 'transactions';

export const transactionService = {
  async issueBook(bookId: string, bookTitle: string, userId: string, userName: string, days: number = 14) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    // Use a Firestore transaction to atomically ensure availability and decrement count.
    // Pre-generate the transaction doc's ID *outside* the retryable callback so that if
    // Firestore retries the transaction (e.g. due to contention), we don't end up creating
    // multiple "issued" records for a single borrow — addDoc() inside runTransaction is not
    // part of the atomic transaction and is not safe to retry.
    const transRef = doc(collection(db, TRANSACTIONS_COLLECTION));

    await runTransaction(db, async (transaction) => {
      const bookRef = doc(db, 'books', bookId);
      const bookSnap = await transaction.get(bookRef);

      if (!bookSnap.exists()) throw new Error("Book does not exist!");
      if (bookSnap.data().availableCopies <= 0) throw new Error("No copies available!");

      const newTrans = {
        bookId,
        bookTitle,
        userId,
        userName,
        issueDate: serverTimestamp(),
        dueDate: dueDate.toISOString(),
        status: 'issued' as const
      };

      // Update book count
      transaction.update(bookRef, {
        availableCopies: increment(-1)
      });

      // Use transaction.set (not addDoc) so the record creation is part of the
      // same atomic transaction as the availableCopies decrement.
      transaction.set(transRef, newTrans);
    });

    return transRef.id;
  },

  async returnBook(transactionId: string, bookId: string) {
    return await runTransaction(db, async (transaction) => {
      const transRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
      const bookRef = doc(db, 'books', bookId);

      transaction.update(transRef, {
        status: 'returned' as const,
        returnDate: serverTimestamp()
      });

      transaction.update(bookRef, {
        availableCopies: increment(1)
      });
    });
  },

  async getUserTransactions(userId: string) {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION), 
      where('userId', '==', userId),
      orderBy('issueDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  },

  async getAllTransactions() {
    const q = query(collection(db, TRANSACTIONS_COLLECTION), orderBy('issueDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  }
};
