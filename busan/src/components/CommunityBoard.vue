<template>
  <div class="space-y-6">
    <!-- 1. 리스트 및 검색 화면 -->
    <div v-if="viewMode === 'list'" class="space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div class="relative w-full sm:max-w-md flex gap-2">
          <input v-model="searchQuery" @keyup.enter="fetchPosts" type="text" placeholder="검색어를 입력하고 엔터를 누르세요" class="w-full border border-slate-200 px-4 py-2.5 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          <button @click="fetchPosts" class="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">검색</button>
        </div>
        <button @click="openWrite" class="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-all flex items-center justify-center gap-1">+ 새 게시글 작성</button>
      </div>

      <!-- 리스트 컨테이너 -->
      <div class="overflow-x-auto rounded-xl border border-slate-100 shadow-sm bg-white">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50/70 text-slate-500 font-bold border-b border-slate-100">
              <th class="py-3.5 px-6 w-20 text-center">ID</th>
              <th class="py-3.5 px-6">글 제목</th>
              <th class="py-3.5 px-6 w-24 text-center">조회수</th>
              <th class="py-3.5 px-6 w-36 text-center">작성시간</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-for="post in posts" :key="post.id" class="hover:bg-slate-50/50 cursor-pointer transition-colors" @click="viewDetail(post.id)">
              <td class="py-4 px-6 text-center text-slate-400 font-mono text-xs">{{ post.id }}</td>
              <td class="py-4 px-6 font-semibold text-slate-900 group-hover:text-blue-600 max-w-lg truncate">{{ post.title }}</td>
              <td class="py-4 px-6 text-center"><span class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-medium">{{ post.view_count }}</span></td>
              <td class="py-4 px-6 text-center text-slate-400 text-xs font-light">{{ formatDate(post.created_at) }}</td>
            </tr>
            <tr v-if="posts.length === 0">
              <td colspan="4" class="text-center py-12 text-slate-400 font-medium">검색 조건에 맞는 커뮤니티 대화가 비어 있습니다[cite: 1].</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 미니멀한 페이지네이션 버튼 디자인 -->
      <div class="flex justify-center items-center gap-4 mt-6">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)" class="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">&larr;</button>
        <span class="text-sm font-semibold text-slate-600">{{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)" class="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">&rarr;</button>
      </div>
    </div>

    <!-- 2. 고급 본문 상세 내용 보기 조회 화면 -->
    <div v-else-if="viewMode === 'detail' && currentPost" class="border border-slate-100 rounded-xl p-6 bg-white shadow-sm space-y-6 animate-fadeIn">
      <div class="border-b border-slate-100 pb-4 space-y-3">
        <h2 class="text-2xl font-black text-slate-900 leading-snug tracking-tight">{{ currentPost.title }}</h2>
        <div class="flex flex-wrap gap-4 text-xs text-slate-400 font-light">
          <span>작성자: <span class="font-medium text-slate-600">익명 원문</span></span>[cite: 1]
          <span>글 번호: <span class="font-mono">{{ currentPost.id }}</span></span>
          <span>조회수: <span>{{ currentPost.view_count }}</span></span>
          <span>등록일: <span>{{ formatDate(currentPost.created_at) }}</span></span>
        </div>
      </div>
      <div class="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap min-h-64 font-normal">{{ currentPost.content }}</div>
      <div class="flex justify-between items-center pt-6 border-t border-slate-100">
        <button @click="viewMode = 'list'" class="px-5 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">목록으로</button>
        <div class="flex gap-2">
          <button @click="openModal('edit')" class="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">수정</button>
          <button @click="openModal('delete')" class="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">삭제</button>
        </div>
      </div>
    </div>

    <!-- 3. 작성 및 수정 인풋 폼 -->
    <div v-else-if="viewMode === 'form'" class="border border-slate-100 rounded-xl p-6 bg-white shadow-sm space-y-5 animate-fadeIn">
      <h3 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">{{ formAction === 'create' ? '✍️ 새 글 남기기' : '🛠️ 내용 업데이트' }}</h3>
      <div class="space-y-1">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">글 제목</label>
        <input v-model="formData.title" type="text" placeholder="명확하고 핵심적인 제목을 입력하세요" class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
      </div>
      <div class="space-y-1">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">내용</label>
        <textarea v-model="formData.content" rows="10" placeholder="부산 지역에 관한 공유 내용 및 자유 이야기를 남겨주세요." class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"></textarea>
      </div>
      <div class="space-y-1 max-w-xs">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">수정/삭제용 비밀번호</label>
        <input v-model="formData.password" type="password" placeholder="비밀번호 평문 입력" class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
      </div>
      <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <button @click="cancelForm" class="border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors">취소</button>
        <button @click="submitForm" class="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-colors">게시글 보관</button>
      </div>
    </div>

    <!-- 글래스모피즘이 가미된 모달 디자인 (TypeScript strict 가이드라인 준수) -->
    <div v-if="modal.show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div class="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-xl border border-slate-100 space-y-4">
        <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 text-xl">🔒</div>
        <div class="space-y-1">
          <h4 class="font-bold text-base text-slate-900">비밀번호 인증</h4>
          <p class="text-xs text-slate-400 leading-normal">의뢰서 설계에 따라 암호화 없이 평문 상태의 비밀번호를 대조합니다[cite: 1].</p>
        </div>
        <input v-model="modal.password" type="password" placeholder="평문 패스워드 입력" class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        <div class="flex gap-2 pt-2">
          <button @click="modal.show = false" class="w-1/2 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors">닫기</button>
          <button @click="handleModalConfirm" class="w-1/2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors">확인인증</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import type { Post } from '../types';  // 'verbatimModuleSyntax' 가이드라인에 따른 type-only import 명시

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
        alert('모든 데이터를 누락 없이 입력하세요.');
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
            alert('인증 비밀번호가 일치하지 않습니다[cite: 1].');
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
            alert('인증 비밀번호가 올바르지 않습니다[cite: 1].');
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
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    onMounted(fetchPosts);

    return {
      posts, searchQuery, viewMode, currentPost, formData, formAction, modal, currentPage, totalPages,
      fetchPosts, viewDetail, openWrite, cancelForm, submitForm, openModal, handleModalConfirm, changePage, formatDate
    };
  }
});
</script>