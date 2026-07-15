<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 네비게이션 상단 바 -->
    <header class="bg-white border-b sticky top-0 z-40 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 @click="currentTab = 'home'" class="text-2xl font-black text-blue-600 cursor-pointer tracking-tight">LocalHub</h1>
        <nav class="flex gap-6 text-sm font-semibold text-gray-600">
          <span @click="currentTab = 'home'" class="cursor-pointer hover:text-blue-600" :class="{'text-blue-600': currentTab==='home'}">홈</span>
          <span @click="currentTab = 'board'" class="cursor-pointer hover:text-blue-600" :class="{'text-blue-600': currentTab==='board'}">커뮤니티</span>
          <span @click="currentTab = 'dashboard'" class="cursor-pointer hover:text-blue-600" :class="{'text-blue-600': currentTab==='dashboard'}">공공 대시보드</span>
        </nav>
      </div>
    </header>

    <!-- 대화형 코어 메인 세션 -->
    <main class="flex-1 max-w-6xl w-full mx-auto p-4 space-y-6">
      <!-- 탭 1: 홈 화면 레이아웃 (의뢰서 준수) -->
      <div v-if="currentTab === 'home'" class="space-y-6">
        <!-- 선정 권역 소개 배너 -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-8 shadow-sm">
          <h2 class="text-3xl font-extrabold mb-2">🌊 부산(Busan) 지역 정보 커뮤니티</h2>
          <p class="text-blue-100 text-sm max-w-xl leading-relaxed">익명으로 자유롭게 소통하고 부산시의 최신 관광지, 레포츠, 숙박, 음식점 공공데이터를 기반으로 한 신뢰할 수 있는 지역 인프라를 소비하세요[cite: 1, 3].</p>
        </div>

        <!-- 카테고리 바로가기 인터페이스 구역 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div @click="currentTab = 'dashboard'" class="bg-white p-5 rounded-lg border text-center cursor-pointer hover:shadow-md transition">
            <span class="text-2xl block mb-1">📍</span>
            <span class="font-bold text-sm text-gray-700">관광지 / 문화시설</span>
          </div>
          <div @click="currentTab = 'dashboard'" class="bg-white p-5 rounded-lg border text-center cursor-pointer hover:shadow-md transition">
            <span class="text-2xl block mb-1">🎉</span>
            <span class="font-bold text-sm text-gray-700">축제 및 행사 일정</span>
          </div>
          <div @click="currentTab = 'dashboard'" class="bg-white p-5 rounded-lg border text-center cursor-pointer hover:shadow-md transition">
            <span class="text-2xl block mb-1">🛍️</span>
            <span class="font-bold text-sm text-gray-700">레포츠 / 쇼핑몰</span>
          </div>
          <div @click="currentTab = 'dashboard'" class="bg-white p-5 rounded-lg border text-center cursor-pointer hover:shadow-md transition">
            <span class="text-2xl block mb-1">🛏️</span>
            <span class="font-bold text-sm text-gray-700">숙박 및 음식점</span>
          </div>
        </div>

        <!-- 최근 게시글 컴포넌트 프리뷰 위젯 고정 -->
        <div class="bg-white rounded-lg border p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-md text-gray-800">📌 실시간 최근 게시글</h3>
            <span @click="currentTab = 'board'" class="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">전체보기 &gt;</span>
          </div>
          <CommunityBoard />
        </div>
      </div>

      <!-- 탭 2: 게시판 단독 전체 뷰 -->
      <div v-else-if="currentTab === 'board'">
        <CommunityBoard />
      </div>

      <!-- 탭 3: 선택 요구사항 통계 대시보드 뷰 -->
      <div v-else-if="currentTab === 'dashboard'">
        <LocalDashboard />
      </div>
    </main>

    <!-- 인공지능 챗봇 플로팅 컴포넌트 주입 -->
    <ChatbotWidget />

    <!-- 하단 푸터 명세 고지 영역 -->
    <footer class="bg-gray-100 border-t py-4 text-center text-xs text-gray-400">
      <p>© 2026 LocalHub. All rights reserved. 본 서비스는 한국관광공사 Tour API 데이터를 정식 활용합니다[cite: 1, 3].</p>
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
    return { currentTab };
  }
});
</script>