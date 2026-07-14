<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div class="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl transform transition-all animate-fade-in">
      <h3 class="text-lg font-bold text-gray-900 mb-2">비밀번호 확인</h3>
      <p class="text-sm text-gray-500 mb-4">게시글 작성 시 등록한 비밀번호를 입력해주세요.</p>
      
      <form @submit.prevent="handleSubmit">
        <input 
          v-model="password" 
          type="password" 
          placeholder="비밀번호 입력" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          required
          ref="passwordInput"
        />
        <div class="flex justify-end gap-2">
          <button 
            type="button" 
            @click="close" 
            class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            취소
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            확인
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'confirm']);
const password = ref('');
const passwordInput = ref(null);

const close = () => {
  password.value = '';
  emit('close');
};

const handleSubmit = () => {
  emit('confirm', password.value);
  password.value = '';
};

// 모달이 열리면 자동으로 포커스 이동
watch(() => props.isOpen, async (val) => {
  if (val) {
    await nextTick();
    passwordInput.value?.focus();
  }
});
</script>