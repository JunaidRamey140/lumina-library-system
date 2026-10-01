import React, { useState, useEffect } from 'react';
import { bookService, Book } from '../lib/bookService';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function InventoryPanel() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    totalCopies: 1,
    coverUrl: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookService.addBook({
        ...formData,
        availableCopies: formData.totalCopies
      });
      setIsAdding(false);
      loadBooks();
      setFormData({ title: '', author: '', isbn: '', category: '', description: '', totalCopies: 1, coverUrl: '' });
    } catch (error) {
      alert("Error adding book");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      await bookService.deleteBook(id);
      loadBooks();
    }
  };

  return (
    <div className="space-y-6" id="inventory-panel">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-zinc-900">Manage Collection</h2>
        <button 
          id="add-book-trigger"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
        >
          <Plus size={18} />
          Add New Book
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm relative"
            id="add-book-form-container"
          >
            <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900">
              <X size={20} />
            </button>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Author</label>
                <input required type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">ISBN</label>
                <input required type="text" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Category</label>
                <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none" />
              </div>
              <div className="flex gap-4 md:col-span-2">
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Copies</label>
                  <input required type="number" min="1" value={formData.totalCopies} onChange={e => setFormData({...formData, totalCopies: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cover URL (optional)</label>
                  <input type="url" value={formData.coverUrl} onChange={e => setFormData({...formData, coverUrl: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="https://..." />
                </div>
              </div>
              <button type="submit" className="md:col-span-2 w-full py-3 bg-zinc-950 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors mt-2">
                Save Book to Inventory
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm" id="inventory-list">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Book Details</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">ISBN</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {books.map(book => (
              <tr key={book.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-9 bg-zinc-100 rounded flex-shrink-0 flex items-center justify-center text-zinc-400 overflow-hidden">
                      {book.coverUrl ? <img src={book.coverUrl} className="object-cover h-full w-full" /> : <Plus size={16} />}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 leading-tight">{book.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">{book.author}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{book.isbn}</td>
                <td className="px-6 py-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-zinc-100 text-zinc-600 rounded">
                    {book.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200">
                    <span className="text-xs font-bold">{book.availableCopies}</span>
                    <span className="text-[10px] text-zinc-500 ml-1">/ {book.totalCopies}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-zinc-400">
                    <button className="p-2 hover:text-emerald-600 transition-colors"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(book.id!)} className="p-2 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {books.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic text-sm">
                  No books found in the inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
