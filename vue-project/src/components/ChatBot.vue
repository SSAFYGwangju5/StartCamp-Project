<template>
  <div class="fixed bottom-6 right-6 z-50 font-sans">
    <!-- 접힌 상태 (플로팅 버튼) -->
    <button 
      v-if="!isOpen" 
      @click="toggleChat"
      class="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105"
    >
      <span class="text-2xl">💬</span>
    </button>

    <!-- 펼친 상태 (대화창) -->
    <div 
      v-else 
      class="bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 border border-gray-100
             w-[380px] h-[550px] max-md:fixed max-md:inset-0 max-md:w-full max-md:h-full max-md:rounded-none"
    >
      <!-- 대화창 헤더 -->
      <div class="p-4 bg-blue-600 text-white flex justify-between items-center rounded-t-2xl max-md:rounded-none">
        <div class="flex items-center gap-2">
          <span class="text-xl">🤖</span>
          <div>
            <h3 class="font-bold text-sm">LocalHub 지역 정보 비서</h3>
            <span class="text-xs text-blue-100">실시간 답변 가능</span>
          </div>
        </div>
        <button @click="toggleChat" class="text-white hover:text-gray-200 text-xl font-bold p-1">&times;</button>
      </div>

      <!-- 대화 영역 -->
      <div ref="chatBox" class="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        <div v-for="(msg, idx) in messages" :key="idx" class="flex" :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'">
          <div 
            class="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
            :class="msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100'"
          >
            {{ msg.text }}
          </div>
        </div>
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-white text-gray-400 px-4 py-2 rounded-2xl text-xs animate-pulse border border-gray-100">
            LocalHub 챗봇이 생각하는 중...
          </div>
        </div>
      </div>

      <!-- 입력창 -->
      <form @submit.prevent="sendMessage" class="p-3 border-t border-gray-100 bg-white flex gap-2 max-md:pb-6">
        <input 
          v-model="inputMessage" 
          type="text" 
          placeholder="관광지, 맛집에 대해 물어보세요..." 
          class="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="isTyping"
        />
        <button 
          type="submit" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
          :disabled="isTyping"
        >
          전송
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { chatApi } from '../services/api';

const isOpen = ref(false);
const isTyping = ref(false);
const inputMessage = ref('');
const chatBox = ref(null);
const messages = ref([
  { sender: 'bot', text: '안녕하세요! 광주/전라 지역 정보에 대해 무엇이든 편하게 물어보세요!' }
]);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) scrollBottom();
};

const scrollBottom = async () => {
  await nextTick();
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;
  
  const userText = inputMessage.value;
  messages.value.push({ sender: 'user', text: userText });
  inputMessage.value = '';
  isTyping.value = true;
  scrollBottom();

  try {
    const response = await chatApi.sendMessage(userText);
    messages.value.push({ sender: 'bot', text: response.data.reply });
  } catch (error) {
    messages.value.push({ sender: 'bot', text: '죄송합니다. 서버가 혼잡하여 답변을 가져올 수 없습니다.' });
  } finally {
    isTyping.value = false;
    scrollBottom();
  }
};
</script>