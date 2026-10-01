import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

export interface Book {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string;
  createdAt: any;
}

const BOOKS_COLLECTION = 'books';

export const bookService = {
  async getAllBooks() {
    const q = query(collection(db, BOOKS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
  },

  async addBook(book: Omit<Book, 'id' | 'createdAt'>) {
    return await addDoc(collection(db, BOOKS_COLLECTION), {
      ...book,
      createdAt: serverTimestamp()
    });
  },

  async updateBook(id: string, updates: Partial<Book>) {
    const bookRef = doc(db, BOOKS_COLLECTION, id);
    await updateDoc(bookRef, updates);
  },

  async deleteBook(id: string) {
    const bookRef = doc(db, BOOKS_COLLECTION, id);
    await deleteDoc(bookRef);
  },

  async searchBooks(searchTerm: string) {
    // This is a simple client-side search approximation as Firestore doesn't support full-text search natively
    // In production, we'd use Algolia or similar.
    const allBooks = await this.getAllBooks();
    return allBooks.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm)
    );
  }
};
