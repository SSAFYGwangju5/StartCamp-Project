<template>
  <div class="bg-white p-6 rounded-lg shadow-sm">
    <h2 class="text-xl font-bold mb-4 text-blue-600">📊 부산 권역 공공데이터 현황 대시보드</h2>
    <p class="text-sm text-gray-500 mb-6">LocalHub가 사전 수집·가공하여 SQLite DB에 연동 완료한 POI 정량 통계 정보입니다.</p>
    
    <div v-if="loading" class="text-center py-8 text-gray-400">데이터 통계 수집 중...</div>
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.category" class="border border-gray-100 p-4 rounded-lg bg-gray-50 text-center hover:shadow-md transition">
        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ stat.category }}</div>
        <div class="text-2xl font-extrabold text-gray-800 mt-1">{{ stat.count.toLocaleString() }} 건</div>
      </div>
    </div>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg text-xs text-gray-600 space-y-1">
      <p class="font-semibold">💡 데이터 출처 및 라이선스 고지</p>
      <p>본 서비스에서 제공하는 공공데이터는 한국관광공사 TourAPI 4.0 국문 관광정보 서비스를 기반으로 합니다.</p>
      <p>출처: 한국관광공사 (공공데이터 포털 배포) | 저작권 라이선스: 공공누리 제3유형 (출처표시 + 변경금지)</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import type { LocationStat } from '../types';

export default defineComponent({
  name: 'LocalDashboard',
  setup() {
    const stats = ref<LocationStat[]>([]);
    const loading = ref(true);

    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/locations/stats');
        if (res.ok) {
          stats.value = await res.json();
        }
      } catch (err) {
        console.error('통계 데이터 로드 실패:', err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchStats);

    return { stats, loading };
  }
});
</script>