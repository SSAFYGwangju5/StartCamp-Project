<template>
  <div class="min-h-screen flex flex-col bg-slate-50 antialiased selection:bg-blue-500 selection:text-white">
    <!-- 고급스러운 상단 고정 헤더 -->
    <header class="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm transition-all">
      <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div @click="currentTab = 'home'" class="flex items-center gap-2 cursor-pointer group">
          <span class="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-indigo-500 transition-all">LocalHub</span>
          <span class="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full tracking-wider uppercase">Busan</span>
        </div>
        <nav class="flex gap-1 md:gap-2 p-1 bg-slate-100/80 rounded-xl text-sm font-medium">
          <button @click="currentTab = 'home'" :class="currentTab === 'home' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'" class="px-4 py-2 rounded-lg transition-all duration-200">홈</button>
          <button @click="currentTab = 'board'" :class="currentTab === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'" class="px-4 py-2 rounded-lg transition-all duration-200">커뮤니티</button>
          <button @click="currentTab = 'dashboard'" :class="currentTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'" class="px-4 py-2 rounded-lg transition-all duration-200">공공 대시보드</button>
        </nav>
      </div>
    </header>

    <!-- 메인 메인 콘텐츠 영역 -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
      <div v-if="currentTab === 'home'" class="space-y-8 animate-fadeIn">
        <!-- 메인 비주얼 배너 -->
        <div class="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-8 md:p-12 shadow-lg overflow-hidden border border-slate-800">
          <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10 max-w-2xl space-y-3">
            <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">선정 권역: 부산 광역시<br><span class="text-blue-400">LocalHub</span>로 한눈에 만나보세요</h2>
            <p class="text-slate-400 text-sm md:text-base leading-relaxed font-light">익명 기반의 자유로운 동네 소통 공간과 한국관광공사 TourAPI 4.0 공공데이터 기반의 신뢰도 높은 정보 인프라가 융합된 플랫폼입니다.</p>
          </div>
        </div>

        <!-- 카드 단축키 (Micro-interaction 적용) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="(shortcut, idx) in shortcuts" :key="idx" @click="currentTab = 'dashboard'" class="bg-white p-6 rounded-xl border border-slate-100 text-center cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
            <span class="text-3xl block mb-2 transform group-hover:scale-110 transition-transform duration-200">{{ shortcut.icon }}</span>
            <span class="font-bold text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{{ shortcut.label }}</span>
          </div>
        </div>

        <!-- 프리뷰 위젯 세션 -->
        <div class="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div class="flex justify-between items-center mb-6">
            <div class="space-y-1">
              <h3 class="font-bold text-lg text-slate-800 tracking-tight">📌 실시간 최근 게시글</h3>
              <p class="text-xs text-slate-400">지역 주민들과 관광객들이 나누는 실시간 익명 이야기입니다.</p>
            </div>
            <button @click="currentTab = 'board'" class="text-xs text-blue-600 font-bold hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors">전체보기 &rarr;</button>
          </div>
          <CommunityBoard />
        </div>
      </div>

      <!-- 동적 컴포넌트 탭 래퍼 -->
      <div v-else-if="currentTab === 'board'" class="animate-fadeIn">
        <CommunityBoard />
      </div>
      <div v-else-if="currentTab === 'dashboard'" class="animate-fadeIn">
        <LocalDashboard />
      </div>
    </main>

    <!-- 미니멀 모던 푸터 -->
    <footer class="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-light mt-12">
      <div class="max-w-6xl mx-auto px-6 space-y-1">
        <p>© 2026 LocalHub. All rights reserved.</p>
        <p class="text-slate-300">이 서비스는 한국관광공사 Tour API 데이터를 정식 활용하며, 공공누리 제3유형 라이선스를 준수합니다.</p>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import CommunityBoard from './components/CommunityBoard.vue';
import LocalDashboard from './components/LocalDashboard.vue';
import ChatbotWidget from './components/ChatbotWidget.vue';

export default defineComponent({
  name: 'App',
  components: { CommunityBoard, LocalDashboard, ChatbotWidget },
  setup() {
    const currentTab = ref<'home' | 'board' | 'dashboard'>('home');
    const shortcuts = [
      { icon: '🏖️', label: '관광지 명소' },
      { icon: '🏛️', label: '문화시설 탐방' },
      { icon: '🚴', label: '레포츠 / 쇼핑' },
      { icon: '🏨', label: '숙박 및 음식점' }
    ];
    return { currentTab, shortcuts };
  }
});
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
</style>