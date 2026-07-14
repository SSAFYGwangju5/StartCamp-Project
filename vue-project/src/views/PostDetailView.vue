<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="mb-6">
      <router-link to="/posts" class="text-sm text-gray-500 hover:text-blue-600">&larr; 목록으로 돌아가기</router-link>
    </div>

    <!-- 게시글 본문 카드 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div class="flex items-center gap-2 mb-4">
        <span class="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded">관광지</span>
        <span class="text-xs text-gray-400 font-mono">작성일: 2026-07-14 10:30:30</span>
      </div>
      
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 leading-snug">
        여수 오동도 동백열차 이용 꿀팁 및 주차 정보
      </h1>
      
      <div class="prose max-w-none text-gray-800 leading-relaxed mb-8 space-y-4 whitespace-pre-line">
        이번 주말에 여수 오동도에 다녀왔습니다! 
        날씨가 더워서 동백열차를 타고 들어갔는데 인당 1,000원으로 아주 저렴하고 시원하게 이동할 수 있었네요.
        
        운행 간격은 15분 단위로 자주 있는 편이지만 주말 오후에는 대기가 길어질 수 있으니 오전 방문을 강력 추천합니다. 
        익명으로 꿀팁 공유하고 가요~! 모두 즐거운 여수 여행 되세요!
      </div>

      <!-- 수정 / 삭제 기능 영역 -->
      <div class="flex justify-end gap-2 border-t border-gray-100 pt-6">
        <button @click="openModal('edit')" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
          수정
        </button>
        <button @click="openModal('delete')" class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition">
          삭제
        </button>
      </div>
    </div>

    <!-- 평문 패스워드 검증 모달 컴포넌트 연동 -->
    <PasswordModal 
      :is-open="isModalOpen" 
      @close="isModalOpen = false" 
      @confirm="handlePasswordConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PasswordModal from '../components/PasswordModal.vue';

const router = useRouter();
const isModalOpen = ref(false);
const activeAction = ref(''); // 'edit' 또는 'delete'

const openModal = (action) => {
  activeAction.value = action;
  isModalOpen.value = true;
};

const handlePasswordConfirm = (password) => {
  isModalOpen.value = false;
  // RFP 요구사항에 따라 저장된 평문 패스워드(예시: 1234) 매칭 검증 시뮬레이션
  if (password === '1234') {
    if (activeAction.value === 'edit') {
      router.push('/posts/1/edit'); // 수정 폼 화면으로 이동
    } else {
      alert('게시글이 성공적으로 삭제되었습니다.');
      router.push('/posts');
    }
  } else {
    alert('비밀번호가 일치하지 않습니다. 다시 시도해 주세요.');
  }
};
</script>