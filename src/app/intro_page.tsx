import React from 'react'

export const IntroPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4 py-12">
        <div className="inline-flex items-center space-x-2 bg-terracotta text-white px-3 py-1 rounded-full text-xs font-label font-bold uppercase mb-2">
          <span>About Feature</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest">함께쓰는 다이어리 기능 소개</h1>
        <p className="text-gray-500 font-body text-sm max-w-2xl mx-auto leading-relaxed">
          트레킹 다이어리는 산행의 모든 순간을 모임원들과 함께 기록하고 평생 간직할 수 있도록 돕는 디지털 아카이빙 플랫폼입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature 1 */}
        <div className="bg-white p-6 rounded-3xl border border-paper-high shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-forest text-white rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">
            📚
          </div>
          <h3 className="font-heading font-bold text-lg text-forest mb-2">교환일기 단행본 서가 (UC3)</h3>
          <p className="text-xs text-gray-600 font-body leading-relaxed">
            매월 모임원들이 함께 쓴 에피소드와 사진들이 모여 한 권의 디지털 양장본으로 출간됩니다. 책을 펼쳐 그때의 감동을 다시 느껴보세요.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white p-6 rounded-3xl border border-paper-high shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-terracotta text-white rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">
            📷
          </div>
          <h3 className="font-heading font-bold text-lg text-forest mb-2">구글 드라이브 원본 동기화 (UC9)</h3>
          <p className="text-xs text-gray-600 font-body leading-relaxed">
            모든 사진은 용량 제한 걱정 없이 동호회의 구글 공유 드라이브에 안전하게 원본으로 자동 저장되고 갤러리로 동기화됩니다.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white p-6 rounded-3xl border border-paper-high shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">
            🏆
          </div>
          <h3 className="font-heading font-bold text-lg text-forest mb-2">완등 스탬프 및 뱃지 수여 (UC5)</h3>
          <p className="text-xs text-gray-600 font-body leading-relaxed">
            목표했던 산행을 무사히 마치면 관리자로부터 특별한 기념 뱃지를 수여받을 수 있습니다. 마이 트레킹 갤러리를 채워보세요.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="bg-white p-6 rounded-3xl border border-paper-high shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">
            🤖
          </div>
          <h3 className="font-heading font-bold text-lg text-forest mb-2">AI 감성 윤색 기능</h3>
          <p className="text-xs text-gray-600 font-body leading-relaxed">
            에피소드 작성 시 감정선을 살려주는 AI 글쓰기 윤색 기능을 통해 더 아름다운 산행 일기를 완성할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
