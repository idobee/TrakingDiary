'use client'

import React, { useState } from 'react'
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { DashboardPage } from './dashboard_page'
import { DiariesPage } from './diaries_page'
import { MyPage } from './my_page'
import { ClubsPage } from './clubs_page'
import { LoginPage } from './login_page'
import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'

export default function Home() {
  const { t } = useTranslation()
  const { user, isLoading } = useAuth()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedClub, setSelectedClub] = useState('국립공원 산악회')

  // Modal States
  const [episodeModalOpen, setEpisodeModalOpen] = useState(false)
  const [episodeData, setEpisodeData] = useState({
    title: '',
    author: '',
    date: '',
    photo: '',
    content: '',
  })

  const [clubAdminModalOpen, setClubAdminModalOpen] = useState(false)
  const [adminTab, setAdminTab] = useState<'keys' | 'members' | 'hikes' | 'badges'>('keys')
  const [googleFolderId, setGoogleFolderId] = useState('1A2b3C4d5E6f7G8h9I0j')
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD_SampleGeminiKey987654321')
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false)

  // Handlers
  const handleOpenEpisodeModal = (
    title: string,
    author: string,
    date: string,
    photo: string,
    content: string
  ) => {
    setEpisodeData({ title, author, date, photo, content })
    setEpisodeModalOpen(true)
  }

  const handleSaveClubKeys = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccessAlert(true)
    setTimeout(() => setSavedSuccessAlert(false), 3000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-forest flex items-center justify-center">
        <p className="text-paper font-heading font-bold animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedClub={selectedClub}
          setSelectedClub={setSelectedClub}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenScheduleModal={(title) =>
                handleOpenEpisodeModal(
                  title,
                  t('modal.demoData.hikeLeader'),
                  t('modal.demoData.hikeDate'),
                  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900',
                  t('modal.demoData.hikeDesc'),
                )
              }
            />
          )}

          {activeTab === 'hikes' && (
            <DashboardPage
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenScheduleModal={(title) =>
                handleOpenEpisodeModal(
                  title,
                  t('modal.demoData.hikeLeader'),
                  t('modal.demoData.hikeDate'),
                  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900',
                  t('modal.demoData.hikesDetailDesc'),
                )
              }
            />
          )}

          {activeTab === 'diaries' && (
            <DiariesPage
              onOpenDiaryDetail={(title) =>
                handleOpenEpisodeModal(
                  title,
                  t('modal.demoData.diaryEditor'),
                  t('modal.demoData.diaryVol'),
                  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900',
                  t('modal.demoData.diaryDesc'),
                )
              }
            />
          )}

          {activeTab === 'gallery' && (
            <div className="bg-white p-8 rounded-3xl border border-paper-high shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h2 className="font-heading font-bold text-2xl text-forest">{t('gallery.title')}</h2>
                <span className="uc-tag">{t('gallery.ucTag')}</span>
              </div>
              <p className="text-xs text-gray-600 font-body">{t('gallery.description')}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600" className="rounded-xl shadow object-cover h-48 w-full" />
                <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600" className="rounded-xl shadow object-cover h-48 w-full" />
                <img src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600" className="rounded-xl shadow object-cover h-48 w-full" />
                <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600" className="rounded-xl shadow object-cover h-48 w-full" />
              </div>
            </div>
          )}

          {activeTab === 'my' && (
            <MyPage
              onOpenEpisodeModal={handleOpenEpisodeModal}
              onOpenBadgeGrantModal={(name) =>
                alert(t('modal.alerts.badgeGrant', { name }))
              }
            />
          )}

          {activeTab === 'clubs' && (
            <ClubsPage
              onOpenClubAdminModal={() => setClubAdminModalOpen(true)}
              onOpenClubCreateModal={() =>
                alert(t('modal.alerts.clubCreate'))
              }
            />
          )}
        </main>
      </div>

      {/* Episode Detail Popup Modal (UC10/UC16) */}
      {episodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-forest-container p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <span className="bg-terracotta text-white font-label text-[10px] px-2.5 py-0.5 rounded-full font-bold">{t('common.googleDriveLinkedTag')}</span>
                <h3 className="font-heading font-extrabold text-2xl text-forest mt-1">{episodeData.title}</h3>
                <p className="text-xs text-gray-500 font-label mt-0.5">{t('modal.episode.author')} {episodeData.author} • {episodeData.date}</p>
              </div>
              <button
                onClick={() => setEpisodeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-sm transition"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden shadow border border-sand bg-gray-100 max-h-96">
              <img src={episodeData.photo} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-3">
              <h4 className="font-heading font-bold text-base text-forest">{t('modal.episode.fullContentTitle')}</h4>
              <p className="text-sm text-gray-700 font-body leading-relaxed whitespace-pre-line bg-paper-low p-5 rounded-2xl border border-paper-high">
                {episodeData.content}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-4 text-xs font-label text-gray-500">
                <span>{t('modal.episode.likesCount', { count: '12' })}</span>
                <span>{t('modal.episode.commentsCount', { count: '4' })}</span>
              </div>
              <button
                onClick={() => setEpisodeModalOpen(false)}
                className="bg-forest text-white font-heading font-bold text-xs px-6 py-2.5 rounded-full hover:bg-forest-container transition shadow"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Club Admin Center Modal (UC15) */}
      {clubAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-forest-container p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-forest text-white font-label text-[10px] px-2.5 py-0.5 rounded-full font-bold">{t('modal.admin.ucTag')}</span>
                  <span className="bg-emerald-100 text-emerald-800 font-label text-[10px] px-2 py-0.5 rounded font-bold">{t('modal.admin.ownerBadge')}</span>
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-forest mt-1">{t('modal.admin.title', { clubName: selectedClub })}</h3>
                <p className="text-xs text-gray-500 font-body mt-0.5">{t('modal.admin.description')}</p>
              </div>
              <button
                onClick={() => setClubAdminModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Admin Tabs Navigation */}
            <div className="flex space-x-2 border-b border-gray-200 pb-2">
              <button
                onClick={() => setAdminTab('keys')}
                className={`px-4 py-2 rounded-xl font-heading font-bold text-xs transition ${
                  adminTab === 'keys' ? 'bg-forest text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('modal.admin.tabKeys')}
              </button>
              <button
                onClick={() => setAdminTab('members')}
                className={`px-4 py-2 rounded-xl font-heading font-bold text-xs transition ${
                  adminTab === 'members' ? 'bg-forest text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('modal.admin.tabMembers')}
              </button>
              <button
                onClick={() => setAdminTab('hikes')}
                className={`px-4 py-2 rounded-xl font-heading font-bold text-xs transition ${
                  adminTab === 'hikes' ? 'bg-forest text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('modal.admin.tabHikes')}
              </button>
              <button
                onClick={() => setAdminTab('badges')}
                className={`px-4 py-2 rounded-xl font-heading font-bold text-xs transition ${
                  adminTab === 'badges' ? 'bg-forest text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('modal.admin.tabBadges')}
              </button>
            </div>

            {/* Admin Tab 1: Keys Setup */}
            {adminTab === 'keys' && (
              <form onSubmit={handleSaveClubKeys} className="space-y-4">
                {savedSuccessAlert && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl font-label text-xs font-bold border border-emerald-300">
                    {t('modal.admin.keysSuccessAlert')}
                  </div>
                )}
                <div>
                  <label className="block font-heading font-bold text-xs text-forest mb-1">
                    {t('modal.admin.keysFolderLabel')}
                  </label>
                  <input
                    type="text"
                    value={googleFolderId}
                    onChange={(e) => setGoogleFolderId(e.target.value)}
                    className="w-full bg-paper-low border border-forest/20 rounded-xl px-4 py-2 text-xs font-label focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                  <p className="text-[10px] text-gray-400 font-label mt-1">{t('modal.admin.keysFolderHint')}</p>
                </div>

                <div>
                  <label className="block font-heading font-bold text-xs text-forest mb-1">
                    {t('modal.admin.keysGeminiLabel')}
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full bg-paper-low border border-forest/20 rounded-xl px-4 py-2 text-xs font-label focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                  <p className="text-[10px] text-gray-400 font-label mt-1">{t('modal.admin.keysGeminiHint')}</p>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="bg-terracotta text-white font-heading font-bold text-xs px-6 py-2.5 rounded-full hover:bg-terracotta-dark transition shadow"
                  >
                    {t('modal.admin.keysSaveBtn')}
                  </button>
                </div>
              </form>
            )}

            {/* Admin Tab 2: Member Approvals */}
            {adminTab === 'members' && (
              <div className="space-y-4">
                <h4 className="font-heading font-bold text-sm text-forest">{t('modal.admin.membersTitle')}</h4>
                <div className="border rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left font-body">
                    <thead className="bg-forest text-paper font-heading">
                      <tr>
                        <th className="p-3">{t('modal.admin.membersColApplicant')}</th>
                        <th className="p-3">{t('modal.admin.membersColDate')}</th>
                        <th className="p-3">{t('modal.admin.membersColInviteLink')}</th>
                        <th className="p-3">{t('modal.admin.membersColAction')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-3 font-bold">{t('modal.admin.membersSampleName')}</td>
                        <td className="p-3 font-label">{t('modal.admin.membersSampleDate')}</td>
                        <td className="p-3 text-emerald-600 font-bold">{t('modal.admin.membersSampleLink')}</td>
                        <td className="p-3 space-x-2">
                          <button onClick={() => alert(t('modal.alerts.approveSuccess'))} className="bg-emerald-600 text-white px-3 py-1 rounded-full font-bold">{t('common.approve')}</button>
                          <button onClick={() => alert(t('modal.alerts.rejectSuccess'))} className="bg-red-500 text-white px-3 py-1 rounded-full font-bold">{t('common.reject')}</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Admin Tab 3 & 4 Placeholders */}
            {(adminTab === 'hikes' || adminTab === 'badges') && (
              <div className="p-6 bg-paper-low rounded-2xl text-center space-y-2">
                <p className="font-heading font-bold text-sm text-forest">⚙️ {adminTab === 'hikes' ? t('modal.admin.hikesPlaceholder') : t('modal.admin.badgesPlaceholder')}</p>
                <p className="text-xs text-gray-500 font-body">{t('modal.admin.placeholderDesc')}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setClubAdminModalOpen(false)}
                className="bg-forest text-white font-heading font-bold text-xs px-6 py-2.5 rounded-full hover:bg-forest-container transition shadow"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}
