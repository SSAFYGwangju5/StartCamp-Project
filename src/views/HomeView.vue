<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- 선정 권역 소개 배너 -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-12 shadow-lg">
      <span class="bg-blue-500 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">LocalHub 서비스</span>
      <h1 class="text-4xl font-bold mt-4 mb-2">광주/전라 지역 정보 커뮤니티</h1>
      <p class="text-blue-100 text-lg">광주/전라 권역의 맞춤형 관광지, 맛집 정보와 실시간 동네 이야기를 만나보세요.</p>
    </div>

    <!-- 카테고리 바로가기 -->
    <div class="mb-12">
      <h2 class="text-xl font-bold text-gray-800 mb-6">카테고리 바로가기</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link to="/posts?category=관광지" class="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <span class="text-3xl mb-2">🗺️</span>
          <span class="font-medium text-gray-700">관광지</span>
        </router-link>
        <router-link to="/posts?category=맛집" class="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <span class="text-3xl mb-2">🍕</span>
          <span class="font-medium text-gray-700">맛집</span>
        </router-link>
        <router-link to="/posts?category=축제·행사" class="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <span class="text-3xl mb-2">🎉</span>
          <span class="font-medium text-gray-700">축제·행사</span>
        </router-link>
        <router-link to="/posts?category=자유게시판" class="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <span class="text-3xl mb-2">💬</span>
          <span class="font-medium text-gray-700">자유게시판</span>
        </router-link>
      </div>
    </div>

    <!-- 최근 게시글 -->
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">실시간 인기글</h2>
        <router-link to="/posts" class="text-sm text-blue-600 hover:underline">전체보기 &rarr;</router-link>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-gray-500">로딩 중...</div>
        <div v-else-if="recentPosts.length === 0" class="p-8 text-center text-gray-500">등록된 게시글이 없습니다.</div>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="post in recentPosts" :key="post.id" class="hover:bg-gray-50 transition">
            <router-link :to="`/posts/${post.id}`" class="block p-5">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2">{{ post.category }}</span>
                  <span class="text-gray-900 font-medium hover:text-blue-600">{{ post.title }}</span>
                </div>
                <span class="text-sm text-gray-400">{{ formatDate(post.created_at) }}</span>
              </div>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { boardApi } from '../services/api';

const recentPosts = ref([]);
const loading = ref(true);

const fetchRecentPosts = async () => {
  try {
    const response = await boardApi.getPosts({ limit: 5 });
    recentPosts.value = response.data.posts || [];
  } catch (error) {
    console.error('최근 게시글을 가져오는데 실패했습니다.', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

onMounted(fetchRecentPosts);
</script>