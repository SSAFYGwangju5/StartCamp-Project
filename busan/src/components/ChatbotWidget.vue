<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- 챗봇 팝업 바디 -->
    <div v-if="isOpen" class="bg-white rounded-lg shadow-xl border w-96 max-w-sm h-128 flex flex-col mb-4 overflow-hidden transition-all duration-300 md:h-144" :class="{'fixed inset-0 w-full h-full max-w-none rounded-none mb-0': isMobile}">
      <!-- 헤더 -->
      <div class="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold">🤖 LocalHub 부산 안내원</span>
        </div>
        <button @click="isOpen = false" class="text-white hover:text-gray-200 text-lg font-bold">×</button>
      </div>

      <!-- 메시지 영역 -->
      <div class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-sm" ref="chatBox">
        <div class="bg-blue-100 text-blue-800 p-3 rounded-lg max-w-xs self-start">
          안녕하세요! 부산 권역의 축제, 모범 음식점, 관광지 등 궁금한 지역 정보를 무엇이든 물어보세요!
        </div>

        <div v-for="(msg, idx) in messages" :key="idx" class="flex flex-col" :class="{'items-end': msg.role === 'user', 'items-start': msg.role === 'assistant'}">
          <div class="p-3 rounded-lg max-w-xs whitespace-pre-line" :class="msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'">
            {{ msg.content }}
          </div>
        </div>
        <div v-if="sending" class="text-xs text-gray-400 italic px-2">LocalHub 답변 생성 중...</div>
      </div>

      <!-- 인풋 입력 창 -->
      <div class="p-3 bg-white border-t flex gap-2">
        <input v-model="userInput" @keyup.enter="sendMessage" type="text" placeholder="메시지를 입력하세요" :disabled="sending" class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50" />
        <button @click="sendMessage" :disabled="sending" class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">전송</button>
      </div>
    </div>

    <!-- 플로팅 토글 트리거 버튼 -->
    <button @click="isOpen = !isOpen" class="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-105 focus:outline-none">
      <svg v-if="!isOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, onMounted, onUnmounted } from 'vue';
import { ChatMessage } from '../types';

export default defineComponent({
  name: 'ChatbotWidget',
  setup() {
    const isOpen = ref(false);
    const userInput = ref('');
    const messages = ref<ChatMessage[]>([]);
    const sending = ref(false);
    const chatBox = ref<HTMLDivElement | null>(null);
    const isMobile = ref(false);

    const checkResize = () => {
      isMobile.value = window.innerWidth < 768;
    };

    const scrollToBottom = async () => {
      await nextTick();
      if (chatBox.value) {
        chatBox.value.scrollTop = chatBox.value.scrollHeight;
      }
    };

    const sendMessage = async () => {
      if (!userInput.value.trim() || sending.value) return;

      const userText = userInput.value;
      messages.value.push({ role: 'user', content: userText });
      userInput.value = '';
      sending.value = true;
      await scrollToBottom();

      try {
        const res = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            history: messages.value.slice(0, -1) // 현재 메시지 제외 이력 전송
          })
        });

        if (res.ok) {
          const data = await res.json();
          messages.value.push({ role: 'assistant', content: data.response });
        } else {
          messages.value.push({ role: 'assistant', content: '서버와 통신하는 중 문제가 발생했습니다.' });
        }
      } catch (err) {
        messages.value.push({ role: 'assistant', content: '네트워크 연결 상태를 확인해주세요.' });
      } finally {
        sending.value = false;
        await scrollToBottom();
      }
    };

    onMounted(() => {
      checkResize();
      window.addEventListener('resize', checkResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', checkResize);
    });

    return { isOpen, userInput, messages, sending, chatBox, isMobile, sendMessage };
  }
});
</script>

<style scoped>
.h-128 { height: 32rem; }
.h-144 { height: 36rem; }
</style>