import { useState, useEffect } from 'react';
import { bookService, Book } from '../lib/bookService';
import { transactionService } from '../lib/transactionService';
import { useAuth } from '../contexts/AuthContext';
import { Library, Check, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function BookExplorer() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await bookService.getAllBooks();
      setBooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (book: Book) => {
    if (!user || !book.id) return;
    
    setProcessingId(book.id);
    try {
      await transactionService.issueBook(book.id, book.title, user.uid, user.displayName || 'Anonymous');
      alert(`Success! You have borrowed "${book.title}". Please return within 14 days.`);
      loadBooks();
    } catch (error: any) {
      alert(error.message || "Failed to borrow book");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-zinc-400">
      <Loader2 className="animate-spin mr-2" /> Loading collection...
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" id="book-explorer">
      {books.map((book) => (
        <motion.div 
          key={book.id}
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl border border-zinc-200 overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all group"
          id={`book-card-${book.id}`}
        >
          <div className="h-56 bg-zinc-100 relative overflow-hidden flex items-center justify-center text-zinc-300">
            {book.coverUrl ? (
              <img src={book.coverUrl} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt={book.title} />
            ) : (
              <Library size={64} strokeWidth={1} />
            )}
            <div className="absolute top-4 right-4 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold text-zinc-900 shadow-sm uppercase tracking-wider">
              {book.category}
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-zinc-900 leading-tight mb-1 group-hover:text-emerald-600 transition-colors">{book.title}</h3>
            <p className="text-sm text-zinc-500 font-medium mb-4">{book.author}</p>
            
            <p className="text-xs text-zinc-400 line-clamp-2 mt-auto mb-6 leading-relaxed">
              {book.description || "No description available for this title."}
            </p>

            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-auto">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Availability</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${book.availableCopies > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <span className={`text-xs font-bold ${book.availableCopies > 0 ? 'text-zinc-700' : 'text-red-500'}`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} Copies` : 'Checked Out'}
                  </span>
                </div>
              </div>

              <button 
                id={`borrow-btn-${book.id}`}
                disabled={book.availableCopies <= 0 || processingId === book.id}
                onClick={() => handleBorrow(book)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                  book.availableCopies > 0 
                  ? 'bg-zinc-950 text-white hover:bg-emerald-600 shadow-lg shadow-zinc-950/20' 
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
              >
                {processingId === book.id ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : book.availableCopies > 0 ? (
                  <>Borrow</>
                ) : (
                  <AlertCircle size={14} />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      ))}
      
      {books.length === 0 && (
        <div className="col-span-full py-12 text-center bg-zinc-100 rounded-3xl border-2 border-dashed border-zinc-200">
          <Library className="mx-auto text-zinc-300 mb-4" size={48} />
          <p className="text-zinc-500 font-medium">The collection is empty. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
