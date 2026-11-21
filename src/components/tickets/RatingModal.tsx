'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Star, CheckCircle2 } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketNumber: string;
  onSubmit: (rating: number, feedback: string) => Promise<void>;
}

export function RatingModal({
  isOpen,
  onClose,
  ticketNumber,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(rating, feedback);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Tuntas & Beri Penilaian"
      subtitle={`Tiket #${ticketNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Apakah kendala Anda sudah benar-benar teratasi?</span>
          </p>
          <p className="text-[11px] text-emerald-700 leading-relaxed">
            Konfirmasi ini akan menutup tiket secara resmi dan mencatat penilaian Anda untuk evaluasi mutu layanan helpdesk kampus.
          </p>
        </div>

        {/* Star Rating Selector */}
        <div className="text-center py-2 space-y-2">
          <label className="block font-bold text-slate-800">
            Tingkat Kepuasan Penanganan
          </label>
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 cursor-pointer transition-transform hover:scale-125"
              >
                <Star
                  className={`w-7 h-7 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-600">
            {rating === 5 && 'Sangat Puas (5 / 5)'}
            {rating === 4 && 'Puas (4 / 5)'}
            {rating === 3 && 'Cukup (3 / 5)'}
            {rating === 2 && 'Kurang Puas (2 / 5)'}
            {rating === 1 && 'Tidak Puas (1 / 5)'}
          </span>
        </div>

        {/* Feedback Input */}
        <div className="space-y-1.5">
          <label htmlFor="feedbackInput" className="font-bold text-slate-800">
            Ulasan / Catatan untuk Petugas (Opsional)
          </label>
          <textarea
            id="feedbackInput"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tuliskan testimoni atau masukan Anda..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? 'Menyimpan...' : 'Konfirmasi Tuntas & Beri Nilai'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
