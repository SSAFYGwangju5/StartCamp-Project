<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const mapContainer = ref(null)

  onMounted(() => {

    const mapOption = {
      center: new kakao.maps.LatLng(35.1542200827, 129.1270373527),
      level: 3
    }
    const map = new kakao.maps.Map(mapContainer.value, mapOption)

    new kakao.maps.Marker({
      position: new kakao.maps.LatLng(35.1542200827,129.1270373527),
      map: map
    })

} )
</script>

<style scoped>
.map{
    width:100%;
    height:350px;
}
</style>