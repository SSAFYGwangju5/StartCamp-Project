<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h2 class="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
        {{ isEditMode ? '게시글 수정하기' : '새 게시글 작성' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- 카테고리 선택 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">카테고리</label>
          <select v-model="form.category" class="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="관광지">관광지</option>
            <option value="맛집">맛집</option>
            <option value="축제·행사">축제·행사</option>
            <option value="자유게시판">자유게시판</option>
          </select>
        </div>

        <!-- 제목 입력 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">제목</label>
          <input 
            v-model="form.title"
            type="text" 
            placeholder="제목을 입력하세요" 
            class="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- 본문 입력 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">내용</label>
          <textarea 
            v-model="form.content"
            rows="8" 
            placeholder="지역 주민들과 관광객들을 위한 정보를 자유롭게 공유해 주세요. (비방성 글 금지)" 
            class="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>

        <!-- [RFP 필수] 평문 수정용 비밀번호 입력 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">수정용 비밀번호</label>
          <input 
            v-model="form.password"
            type="password" 
            placeholder="수정 및 삭제 시 사용할 비밀번호를 입력하세요" 
            class="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p class="text-xs text-gray-400 mt-1">※ 본 서비스는 익명 커뮤니티로, 입력하신 비밀번호는 평문으로 저장·비교됩니다.</p>
        </div>

        <!-- 하단 제어 버튼 -->
        <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <button type="button" @click="goBack" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            취소
          </button>
          <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition">
            {{ isEditMode ? '수정 완료' : '등록하기' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const isEditMode = ref(false);
const form = ref({
  category: '관광지',
  title: '',
  content: '',
  password: ''
});

onMounted(() => {
  // 라우터 경로에 edit 지표가 있거나 ID가 매핑되면 수정 모드로 전환 시뮬레이션
  if (route.path.includes('edit')) {
    isEditMode.value = true;
    // 수정 시 기존 데이터를 로드해오는 임시 목업 바인딩
    form.value = {
      category: '관광지',
      title: '여수 오동도 동백열차 이용 꿀팁 및 주차 정보',
      content: '이번 주말에 여수 오동도에 다녀왔습니다! 동백열차가 참 시원하고 좋더군요.',
      password: '' // 비밀번호 확인용은 비워둠
    };
  }
});

const handleSubmit = () => {
  alert(isEditMode.value ? '성공적으로 수정되었습니다.' : '새 게시글이 등록되었습니다.');
  router.push('/posts');
};

const goBack = () => {
  router.back();
};
</script>