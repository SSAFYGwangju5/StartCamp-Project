<template>
  <div class="min-h-screen bg-gray-50 font-sans flex flex-col">
    <!-- 글로벌 상단 네비게이션 바 (GNB) -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-8">
          <!-- 로고 클릭 시 홈으로 -->
          <router-link to="/" class="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2">
            <span>🌐</span> LocalHub
          </router-link>
          <!-- 전체 메뉴 이동 링크 -->
          <nav class="flex items-center gap-6 text-sm font-medium text-gray-600 max-sm:hidden">
            <router-link to="/" class="hover:text-blue-600 transition" active-class="text-blue-600 font-bold">홈</router-link>
            <router-link to="/posts" class="hover:text-blue-600 transition" active-class="text-blue-600 font-bold">지역 게시판</router-link>
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <router-link to="/posts/write" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition">
            + 새 글 작성
          </router-link>
        </div>
      </div>
    </header>

    <!-- 모바일 하단 탭바 (반응형 지원) -->
    <nav class="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-around py-2 shadow-lg">
      <router-link to="/" class="flex flex-col items-center text-xs text-gray-500" active-class="text-blue-600 font-bold">
        <span class="text-xl">🏠</span>홈
      </router-link>
      <router-link to="/posts" class="flex flex-col items-center text-xs text-gray-500" active-class="text-blue-600 font-bold">
        <span class="text-xl">📋</span>게시판
      </router-link>
    </nav>

    <!-- 라우터에 의해 매핑된 화면이 렌더링되는 영역 -->
    <main class="flex-1 pb-16 sm:pb-0">
      <router-view />
    </main>

    <!-- [필수 요구사항] 챗봇 플로팅 위젯 -->
    <ChatBot />
  </div>
</template>

<script setup>
import ChatBot from './components/ChatBot.vue';
</script>

<style>
/* 라우터 트랜지션 및 전역 폰트 스무딩 */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>