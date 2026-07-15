<template>
  <div class="bg-white p-6 rounded-lg shadow-sm">
    <!-- 1. 리스트 화면 -->
    <div v-if="viewMode === 'list'">
      <div class="flex justify-between items-center mb-4">
        <div class="flex-1 max-w-md flex gap-2">
          <input v-model="searchQuery" @keyup.enter="fetchPosts" type="text" placeholder="게시글 검색어를 입력하세요" class="border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          <button @click="fetchPosts" class="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium">검색</button>
        </div>
        <button @click="openWrite" class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">+ 글쓰기</button>
      </div>

      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="bg-gray-100 text-gray-700 font-semibold border-b">
            <th class="py-3 px-4 w-16">번호</th>
            <th class="py-3 px-4">제목</th>
            <th class="py-3 px-4 w-24">조회수</th>
            <th class="py-3 px-4 w-32">작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id" class="border-b hover:bg-gray-50 cursor-pointer" @click="viewDetail(post.id)">
            <td class="py-3 px-4 text-gray-500">{{ post.id }}</td>
            <td class="py-3 px-4 font-medium text-blue-600 hover:underline">{{ post.title }}</td>
            <td class="py-3 px-4 text-gray-500">{{ post.view_count }}</td>
            <td class="py-3 px-4 text-gray-400">{{ formatDate(post.created_at) }}</td>
          </tr>
          <tr v-if="posts.length === 0">
            <td colspan="4" class="text-center py-8 text-gray-400">등록된 게시글이 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div class="flex justify-center items-center gap-2 mt-6">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)" class="px-3 py-1 border rounded text-xs disabled:opacity-50">이전</button>
        <span class="text-sm text-gray-600">{{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)" class="px-3 py-1 border rounded text-xs disabled:opacity-50">다음</button>
      </div>
    </div>

    <!-- 2. 상세 조회 화면 -->
    <div v-else-if="viewMode === 'detail' && currentPost" class="space-y-4">
      <div class="border-b pb-3">
        <h2 class="text-2xl font-bold text-gray-800">{{ currentPost.title }}</h2>
        <div class="text-xs text-gray-400 mt-2 flex gap-4">
          <span>번호: {{ currentPost.id }}</span>
          <span>조회수: {{ currentPost.view_count }}</span>
          <span>작성일: {{ formatDate(currentPost.created_at) }}</span>
        </div>
      </div>
      <div class="text-gray-700 whitespace-pre-wrap min-h-48 text-sm leading-relaxed">{{ currentPost.content }}</div>
      <div class="flex justify-end gap-2 pt-4 border-t">
        <button @click="viewMode = 'list'" class="border px-4 py-2 rounded text-sm">목록</button>
        <button @click="openModal('edit')" class="bg-yellow-500 text-white px-4 py-2 rounded text-sm">수정</button>
        <button @click="openModal('delete')" class="bg-red-500 text-white px-4 py-2 rounded text-sm">삭제</button>
      </div>
    </div>

    <!-- 3. 작성 및 수정 양식 화면 -->
    <div v-else-if="viewMode === 'form'" class="space-y-4">
      <h3 class="text-lg font-bold text-gray-800 border-b pb-2">{{ formAction === 'create' ? '게시글 작성' : '게시글 수정' }}</h3>
      <div>
        <label class="block text-xs font-bold text-gray-500 mb-1">제목</label>
        <input v-model="formData.title" type="text" placeholder="제목을 입력하세요" class="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-500 mb-1">내용</label>
        <textarea v-model="formData.content" rows="8" placeholder="내용을 작성하세요" class="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-500 mb-1">수정용 비밀번호</label>
        <input v-model="formData.password" type="password" placeholder="비밀번호를 입력하세요" class="border px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button @click="cancelForm" class="border px-4 py-2 rounded text-sm">취소</button>
        <button @click="submitForm" class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium">등록</button>
      </div>
    </div>

    <!-- 비밀번호 확인용 의뢰서 규격 커스텀 모달 레이어 -->
    <div v-if="modal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg max-w-sm w-full text-center shadow-lg">
        <h4 class="font-bold text-md text-gray-800 mb-2">비밀번호 확인</h4>
        <p class="text-xs text-gray-400 mb-4">요청을 처리하기 위해 작성 시 입력한 비밀번호를 입력해주세요.</p>
        <input v-model="modal.password" type="password" placeholder="수정용 비밀번호 입력" class="w-full border px-3 py-2 rounded text-sm text-center mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        <div class="flex gap-2">
          <button @click="modal.show = false" class="w-1/2 border py-2 rounded text-sm">취소</button>
          <button @click="handleModalConfirm" class="w-1/2 bg-blue-600 text-white py-2 rounded text-sm font-medium">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import type { Post } from '../types';

export default defineComponent({
  name: 'CommunityBoard',
  setup() {
    const posts = ref<Post[]>([]);
    const totalPosts = ref(0);
    const currentPage = ref(1);
    const limit = 10;
    const searchQuery = ref('');

    const viewMode = ref<'list' | 'detail' | 'form'>('list');
    const formAction = ref<'create' | 'edit'>('create');
    const currentPost = ref<Post | null>(null);

    const formData = ref({ title: '', content: '', password: '' });
    const modal = ref({ show: false, action: 'edit' as 'edit' | 'delete', password: '' });

    const totalPages = computed(() => Math.ceil(totalPosts.value / limit) || 1);

    const fetchPosts = async () => {
      try {
        let url = `http://localhost:8000/api/posts?page=${currentPage.value}&limit=${limit}`;
        if (searchQuery.value) url += `&search=${encodeURIComponent(searchQuery.value)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          posts.value = data.items;
          totalPosts.value = data.total;
        }
      } catch (err) {
        console.error('글 목록 수집 에러:', err);
      }
    };

    const viewDetail = async (id: number) => {
      try {
        const res = await fetch(`http://localhost:8000/api/posts/${id}`);
        if (res.ok) {
          currentPost.value = await res.json();
          viewMode.value = 'detail';
        }
      } catch (err) {
        console.error('글 상세 수집 에러:', err);
      }
    };

    const openWrite = () => {
      formAction.value = 'create';
      formData.value = { title: '', content: '', password: '' };
      viewMode.value = 'form';
    };

    const cancelForm = () => {
      viewMode.value = formAction.value === 'edit' ? 'detail' : 'list';
    };

    const submitForm = async () => {
      if (!formData.value.title || !formData.value.content || !formData.value.password) {
        alert('모든 양식을 누락 없이 채워주세요.');
        return;
      }
      try {
        if (formAction.value === 'create') {
          const res = await fetch('http://localhost:8000/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData.value)
          });
          if (res.ok) {
            currentPage.value = 1;
            await fetchPosts();
            viewMode.value = 'list';
          }
        } else if (formAction.value === 'edit' && currentPost.value) {
          const res = await fetch(`http://localhost:8000/api/posts/${currentPost.value.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData.value)
          });
          if (res.ok) {
            await viewDetail(currentPost.value.id);
          } else {
            alert('비밀번호가 틀렸거나 요청이 거부되었습니다.');
          }
        }
      } catch (err) {
        console.error('글 저장 실패:', err);
      }
    };

    const openModal = (action: 'edit' | 'delete') => {
      modal.value = { show: true, action, password: '' };
    };

    const handleModalConfirm = async () => {
      if (!modal.value.password || !currentPost.value) return;
      modal.value.show = false;

      if (modal.value.action === 'edit') {
        formData.value = {
          title: currentPost.value.title,
          content: currentPost.value.content,
          password: modal.value.password
        };
        formAction.value = 'edit';
        viewMode.value = 'form';
      } else if (modal.value.action === 'delete') {
        try {
          const res = await fetch(`http://localhost:8000/api/posts/${currentPost.value.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: modal.value.password })
          });
          if (res.ok) {
            await fetchPosts();
            viewMode.value = 'list';
          } else {
            alert('비밀번호가 올바르지 않습니다.');
          }
        } catch (err) {
          console.error('삭제 오류:', err);
        }
      }
    };

    const changePage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        fetchPosts();
      }
    };

    const formatDate = (isoStr: string) => {
      const d = new Date(isoStr);
      return `${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    onMounted(fetchPosts);

    return {
      posts, searchQuery, viewMode, currentPost, formData, formAction, modal, currentPage, totalPages,
      fetchPosts, viewDetail, openWrite, cancelForm, submitForm, openModal, handleModalConfirm, changePage, formatDate
    };
  }
});
</script>