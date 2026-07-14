<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- 상단 카테고리 탭 필터 -->
    <div class="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
      <button 
        v-for="cat in categories" :key="cat"
        @click="selectedCategory = cat"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition"
        :class="selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- 검색 바 영역 -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-2 mb-6">
      <div class="relative flex-1">
        <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="게시글 제목이나 내용을 입력하세요..." 
          class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button class="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
        검색
      </button>
    </div>

    <!-- 게시글 테이블 리스트 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
            <th class="p-4 w-16 text-center">번호</th>
            <th class="p-4">제목</th>
            <th class="p-4 w-28 text-center">작성일</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
          <tr v-for="post in filteredPosts" :key="post.id" class="hover:bg-gray-50 transition">
            <td class="p-4 text-center text-gray-400 font-mono">{{ post.id }}</td>
            <td class="p-4">
              <router-link :to="`/posts/${post.id}`" class="hover:text-blue-600 font-medium block">
                <span class="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded mr-2 font-semibold">
                  {{ post.category }}
                </span>
                {{ post.title }}
              </router-link>
            </td>
            <td class="p-4 text-center text-gray-400">{{ post.date }}</td>
          </tr>
          <tr v-if="filteredPosts.length === 0">
            <td colspan="3" class="p-12 text-center text-gray-400">검색 조건에 맞는 게시글이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="flex justify-center items-center gap-2 mt-8">
      <button class="px-3 py-1.5 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">&lt;</button>
      <button class="px-3 py-1.5 rounded bg-blue-600 text-white font-medium">1</button>
      <button class="px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50">2</button>
      <button class="px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50">3</button>
      <button class="px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50">&gt;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const categories = ['전체', '관광지', '맛집', '축제·행사', '자유게시판'];
const selectedCategory = ref('전체');
const searchQuery = ref('');

// 기획서 뷰 확인용 테스트 데이터 데이터
const mockPosts = ref([
  { id: 7, category: '축제·행사', title: '김대중컨벤션센터 이번 주말 브루어리 축제 일정 공유합니다!', date: '07.14' },
  { id: 6, category: '맛집', title: '광주 양림동 펭귄마을 근처 파스타 찐맛집 찾았네요', date: '07.12' },
  { id: 5, category: '관광지', title: '여수 오동도 동백열차 이용 꿀팁 및 주차 정보', date: '07.10' },
  { id: 4, category: '자유게시판', title: '오늘 전주 한옥마을 날씨 어떤가요? 여행 가려는데', date: '07.08' },
  { id: 3, category: '관광지', title: '순천만국가정원 관람코스 추천 (소요시간별 정리)', date: '07.06' },
  { id: 2, category: '맛집', title: '담양 국수거리 웨이팅 없는 맛있는 집 추천해주세요', date: '07.05' },
  { id: 1, category: '축제·행사', title: '보성 다향대축제 녹차밭 방문 후기 및 특산품 할인', date: '07.01' },
]);

const filteredPosts = computed(() => {
  return mockPosts.value.filter(post => {
    const matchesCategory = selectedCategory.value === '전체' || post.category === selectedCategory.value;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});
</script>