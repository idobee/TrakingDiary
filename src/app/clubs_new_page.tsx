'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth'

interface ClubsNewPageProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ClubsNewPage: React.FC<ClubsNewPageProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [category, setCategory] = useState<'hiking' | 'running' | 'cycling' | 'tracking' | 'general'>('hiking')
  const [description, setDescription] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('clubs')
        .insert({
          owner_id: user.id,
          name,
          category,
          description,
          contact_phone: contactPhone,
          applicant_id: user.email,
          applicant_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown',
          status: 'pending', // Pending system admin approval
        } as any)

      if (insertError) throw insertError

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error creating club:', err)
      setError(err.message || t('clubsNew.errorDefault'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-forest-container p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-start border-b border-gray-200 pb-4">
          <div>
            <h3 className="font-heading font-extrabold text-2xl text-forest mt-1">{t('clubsNew.title')}</h3>
            <p className="text-xs text-gray-500 font-body mt-0.5">{t('clubsNew.desc')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-label">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-forest mb-1">{t('clubsNew.nameLabel')}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition"
              placeholder={t('clubsNew.namePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest mb-1">{t('clubsNew.categoryLabel')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition"
            >
              <option value="hiking">{t('clubsNew.categoryHiking')}</option>
              <option value="running">{t('clubsNew.categoryRunning')}</option>
              <option value="cycling">{t('clubsNew.categoryCycling')}</option>
              <option value="tracking">{t('clubsNew.categoryTracking')}</option>
              <option value="general">{t('clubsNew.categoryGeneral')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest mb-1">{t('clubsNew.descLabel')}</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition resize-none"
              placeholder={t('clubsNew.descPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest mb-1">{t('clubsNew.contactLabel')}</label>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition"
              placeholder={t('clubsNew.contactPlaceholder')}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
            >
              {t('clubsNew.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-terracotta hover:bg-terracotta-dark transition shadow disabled:opacity-50"
            >
              {isSubmitting ? t('clubsNew.submitting') : t('clubsNew.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
