<template>
  <div class="space-y-6">
    <!-- 1. 리스트 검색 및 툴바 필터 제어부 -->
    <div v-if="viewMode === 'list'" class="space-y-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl shadow-xl">
        <div class="relative w-full md:max-w-md flex gap-2">
          <input v-model="searchQuery" @keyup.enter="fetchPosts" type="text" placeholder="검색하고 싶은 키워드를 기입하세요..." class="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-600" />
          <button @click="fetchPosts" class="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors">검색</button>
        </div>
        <button @click="openWrite" class="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5">+ 에세이 남기기</button>
      </div>

      <!-- 리스트 섹션: 컴포넌트를 깔끔하게 담는 다크 글래스 가둠판 -->
      <div class="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl">
        <div class="hidden sm:grid grid-cols-12 px-6 py-3.5 bg-slate-900/80 border-b border-slate-800 text-xs font-bold text-slate-400 tracking-wider">
          <div class="col-span-1 text-center">INDEX</div>
          <div class="col-span-7">게시글 스레드 제목</div>
          <div class="col-span-2 text-center">HIT</div>
          <div class="col-span-2 text-center">DATE</div>
        </div>

        <div class="divide-y divide-slate-800/60">
          <div v-for="post in posts" :key="post.id" @click="viewDetail(post.id)" class="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 items-center hover:bg-slate-800/30 cursor-pointer transition-colors group text-sm">
            <div class="hidden sm:block col-span-1 text-center font-mono text-xs text-slate-600">{{ post.id }}</div>
            <div class="col-span-12 sm:col-span-7 font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate pr-4 py-1 sm:py-0">
              <span class="sm:hidden text-xs font-bold text-blue-500 mr-2">#{{ post.id }}</span>
              {{ post.title }}
            </div>
            <div class="col-span-6 sm:col-span-2 sm:text-center flex sm:justify-center items-center text-xs text-slate-400 gap-1">
              <span class="sm:hidden text-slate-600 mr-1">조회수:</span>
              <span class="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md font-medium font-mono">{{ post.view_count }}</span>
            </div>
            <div class="col-span-6 sm:col-span-2 text-right sm:text-center text-xs text-slate-500 font-light font-mono">{{ formatDate(post.created_at) }}</div>
          </div>

          <div v-if="posts.length === 0" class="text-center py-16 text-slate-500 font-medium">
            <div class="text-3xl mb-2">💬</div>
            작성된 대화가 없습니다. 첫 번째 발자국을 남겨보세요.
          </div>
        </div>
      </div>

      <!-- 페이지네이션 컨트롤 디자인 고도화 -->
      <div class="flex justify-center items-center gap-4 mt-6">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)" class="p-2 border border-slate-800 bg-slate-900 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 transition-colors">&larr; Prev</button>
        <span class="text-xs font-bold text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">{{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)" class="p-2 border border-slate-800 bg-slate-900 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 transition-colors">Next &rarr;</button>
      </div>
    </div>

    <!-- 2. 본문 인덱스 뷰어 상세창 -->
    <div v-else-if="viewMode === 'detail' && currentPost" class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 animate-fadeIn">
      <div class="border-b border-slate-800/80 pb-4 space-y-3">
        <h2 class="text-2xl font-black text-white leading-snug tracking-tight">{{ currentPost.title }}</h2>
        <div class="flex flex-wrap gap-4 text-xs font-mono text-slate-500 font-light">
          <span>IDENTITY: <span class="font-bold text-slate-400">ANONYMOUS</span></span>
          <span>POST_ID: <span class="text-slate-400">{{ currentPost.id }}</span></span>
          <span>VIEWS: <span class="text-slate-400">{{ currentPost.view_count }}</span></span>
          <span>TIMESTAMP: <span class="text-slate-400">{{ formatDate(currentPost.created_at) }}</span></span>
        </div>
      </div>
      <!-- 글이 길어져도 박스 안에 딱 붙어 정돈되도록 라인 높이와 폰트 크기 튜닝 -->
      <div class="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap min-h-[240px] font-normal tracking-wide">{{ currentPost.content }}</div>
      <div class="flex justify-between items-center pt-6 border-t border-slate-800/80">
        <button @click="viewMode = 'list'" class="px-4 py-2 border border-slate-800 bg-slate-950 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors">&larr; 목록 광장으로</button>
        <div class="flex gap-2">
          <button @click="openModal('edit')" class="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors">수정요청</button>
          <button @click="openModal('delete')" class="bg-red-950/40 border border-red-900/60 text-red-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-900 hover:text-white transition-colors">데이터 파기</button>
        </div>
      </div>
    </div>

    <!-- 3. 글쓰기 폼 에디터 인프라 수렴 -->
    <div v-else-if="viewMode === 'form'" class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn">
      <h3 class="text-md font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
        <span>{{ formAction === 'create' ? '📝 신규 익명 타임라인 개설' : '⚙️ 타임라인 데이터 정정' }}</span>
      </h3>
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">스레드 제목</label>
        <input v-model="formData.title" type="text" placeholder="전하고자 하는 대화의 에센스를 한 줄로 축약하세요..." class="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-700" />
      </div>
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">에세이 콘텐트</label>
        <textarea v-model="formData.content" rows="10" placeholder="자유로운 정보, 의견, 건의 사항을 이곳에 투명하게 작성하세요..." class="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-700"></textarea>
      </div>
      <div class="space-y-1.5 max-w-xs">
        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">보안 핀 검증 암호 (평문)</label>
        <input v-model="formData.password" type="password" placeholder="4자리 이상 입력" class="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-700" />
      </div>
      <div class="flex justify-end gap-2 pt-4 border-t border-slate-800/80">
        <button @click="cancelForm" class="bg-slate-950 border border-slate-800 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors">취소</button>
        <button @click="submitForm" class="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/10 transition-colors">광장에 동기화</button>
      </div>
    </div>

    <!-- 글래스모피즘 인증 모달창 -->
    <div v-if="modal.show" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
      <div class="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl space-y-4">
        <div class="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400 text-xl border border-blue-500/20">🔑</div>
        <div class="space-y-1">
          <h4 class="font-bold text-base text-white">시큐리티 데이터 대조</h4>
          <p class="text-xs text-slate-500 leading-normal">글 작성 시 부여했던 평문 패스워드 토큰을 입력하세요.</p>
        </div>
        <input v-model="modal.password" type="password" placeholder="비밀번호 토큰 입력" class="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm text-center text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
        <div class="flex gap-2 pt-2">
          <button @click="modal.show = false" class="w-1/2 bg-slate-950 border border-slate-800 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors">창 닫기</button>
          <button @click="handleModalConfirm" class="w-1/2 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-500 shadow-md transition-colors">인증실행</button>
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
        alert('모든 폼을 기입해 주세요.');
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
            alert('비밀번호 검증이 실패했습니다.');
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