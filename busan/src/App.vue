<template>
  <!-- 배경 전체에 딥 마린 무드 그라데이션과 시각적 조명 효과 레이어 주입 -->
  <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
    
    <!-- 디자이너 조명 레이어 효과 (추가 CSS 없이 테일윈드로 구현한 상단 그라데이션 오라) -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none"></div>

    <!-- 네비게이션 헤더: 공중에 떠 있는 듯한 플로팅 글래스 효과 -->
    <header class="sticky top-4 z-50 max-w-6xl w-full mx-auto px-4 my-2">
      <div class="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-6 py-4 flex justify-between items-center shadow-2xl shadow-blue-950/20">
        <div @click="currentTab = 'home'" class="flex items-center gap-3 cursor-pointer group">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/30 group-hover:rotate-6 transition-transform">L</div>
          <h1 class="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">LocalHub</h1>
        </div>
        <nav class="flex p-1 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-semibold">
          <button @click="currentTab = 'home'" :class="currentTab === 'home' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'" class="px-4 py-2 rounded-lg transition-all duration-200">홈</button>
          <button @click="currentTab = 'board'" :class="currentTab === 'board' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'" class="px-4 py-2 rounded-lg transition-all duration-200">커뮤니티</button>
          <button @click="currentTab = 'dashboard'" :class="currentTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'" class="px-4 py-2 rounded-lg transition-all duration-200">대시보드</button>
        </nav>
      </div>
    </header>

    <!-- 메인 레이아웃 뷰포트 컨테이너 -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-8 relative z-10">
      
      <!-- 탭 1: 시네마틱 홈 레이아웃 -->
      <div v-if="currentTab === 'home'" class="space-y-8 animate-fadeIn">
        
        <!-- 초대형 시네마틱 히어로 카드 (초고화질 부산 해양 비주얼 백드롭 명시) -->
        <div class="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 min-h-[340px] flex items-end">
          <!-- 실제 Unsplash 프리미엄 부산 마린시티/바다 에셋 주입 및 암전 디밍 오버레이 처리 -->
          <img src="https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=80" alt="Busan Cityscape" class="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity hover:scale-105 transition-transform duration-700 pointer-events-none" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          
          <!-- 그리드 레이아웃 안에 흐트러짐 없이 타이포그래피 격리 정돈 -->
          <div class="relative z-10 p-8 md:p-12 space-y-3 w-full">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest animate-pulse">Dynamic Busan</span>
            <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">선정 권역: 부산광역시 정보를<br><span class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">한눈에 소비하는 공간</span></h2>
            <p class="text-slate-400 text-xs md:text-sm max-w-xl font-normal leading-relaxed">익명으로 투명하게 소통하는 공유 라운지와 한국관광공사 TourAPI 4.0 정량 데이터를 가공한 프리미엄 로컬 커뮤니티 플랫폼입니다.</p>
          </div>
        </div>

        <!-- 4대 카테고리 숏컷: 정밀한 마이크로 박스 디자인 격자화 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="(shortcut, idx) in shortcuts" :key="idx" @click="currentTab = 'dashboard'" class="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl text-center cursor-pointer shadow-lg hover:bg-slate-900 hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 group">
            <div class="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">{{ shortcut.icon }}</div>
            <div class="font-bold text-sm text-slate-300 group-hover:text-white transition-colors">{{ shortcut.label }}</div>
            <p class="text-[11px] text-slate-500 mt-1 font-light">공공 데이터 검색</p>
          </div>
        </div>

        <!-- 하단 실시간 프리뷰 영역: 여백 밸런싱을 맞추기 위한 섹션 카드 디자인 -->
        <div class="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 shadow-2xl relative">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <div>
                <h3 class="font-bold text-base text-white tracking-tight">📌 실시간 최근 자유 광장</h3>
                <p class="text-xs text-slate-500 font-light">사용자들이 자유롭게 개설한 익명 스레드 타임라인입니다.</p>
              </div>
            </div>
            <button @click="currentTab = 'board'" class="text-xs font-bold text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl bg-blue-500/5 hover:bg-blue-600 hover:text-white transition-all">라운지 입장 &rarr;</button>
          </div>
          <CommunityBoard />
        </div>
      </div>

      <!-- 탭 2/3: 내부 컴포넌트 라우팅 섹션 -->
      <div v-else-if="currentTab === 'board'" class="animate-fadeIn">
        <CommunityBoard />
      </div>
      <div v-else-if="currentTab === 'dashboard'" class="animate-fadeIn">
        <LocalDashboard />
      </div>
    </main>

    <!-- 프리미엄 하단 디자인 푸터 -->
    <footer class="bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-500 font-light relative z-10 mt-16">
      <div class="max-w-6xl mx-auto px-4 space-y-2">
        <p class="font-medium text-slate-400">© 2026 LocalHub. All rights reserved.</p>
        <p class="text-slate-600 max-w-xl mx-auto leading-normal">본 서비스는 한국관광공사 TourAPI 4.0 국문 관광정보 서비스를 정식 컴파일하여 활용하며, 저작권 보호 범위인 공공누리 제3유형 가이드를 엄격히 따릅니다.</p>
      </div>
    </footer>

    <!-- 백엔드 인공지능 챗봇 모듈 바인딩 -->
    <ChatbotWidget />
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
      { icon: '🗺️', label: '관광지 핫플레이스' },
      { icon: '🎭', label: '문화시설/전시관' },
      { icon: '⛵', label: '해양 레포츠 레저' },
      { icon: '🛒', label: '전통시장/쇼핑센터' }
    ];
    return { currentTab, shortcuts };
  }
});
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>