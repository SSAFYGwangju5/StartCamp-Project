<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import { apiRequest } from "./api/client";
import KakaoMap from "./components/KakaoMap.vue";

const spotCategories = [
  { id: "tourist", label: "관광지" },
  { id: "culture", label: "문화시설" },
  { id: "lodging", label: "숙박" },
  { id: "shopping", label: "쇼핑" },
  { id: "sports", label: "레포츠" },
];

const viewMeta = {
  spots: { kicker: "관광지", title: "부산 관광지 리스트" },
  events: { kicker: "축제/행사", title: "부산 축제/행사 리스트" },
  courses: { kicker: "여행코스", title: "부산 여행코스 리스트" },
  community: { kicker: "커뮤니티", title: "부산 여행 커뮤니티" },
};

const fallbackImages = {
  tourist: "https://tong.visitkorea.or.kr/cms/resource/34/3090534_image2_1.JPG",
  culture: "https://tong.visitkorea.or.kr/cms/resource/16/4055716_image2_1.png",
  lodging: "https://tong.visitkorea.or.kr/cms/resource/69/4077869_image2_1.jpg",
  shopping: "https://tong.visitkorea.or.kr/cms/resource/73/3543373_image2_1.jpg",
  sports: "https://tong.visitkorea.or.kr/cms/resource/11/3495811_image2_1.jpg",
  events: "https://tong.visitkorea.or.kr/cms/resource/92/4077792_image2_1.jpg",
  courses: "http://tong.visitkorea.or.kr/cms/resource/83/2364283_image2_1.jpg",
};

const excludedTitleKeywords = ["성형외과", "의원", "주식회사"];

const currentView = ref("spots");
const spotCategory = ref("tourist");
const searchKeyword = ref("");
const cache = reactive({});
const currentItems = ref([]);
const selectedPlace = ref(null);
const posts = ref([]);
const selectedPost = ref(null);
const communityMode = ref("list");
const loadingText = ref("불러오는 중");
const errorText = ref("");
const postForm = reactive({ title: "", password: "", content: "" });
const editForm = reactive({ id: null, title: "", password: "", content: "" });
const chatInput = ref("");
const chatMessages = ref([{ type: "bot", text: "궁금한 부산 여행 정보를 물어보세요." }]);

const currentMeta = computed(() => viewMeta[currentView.value]);
const isPlaceView = computed(() => ["spots", "events", "courses"].includes(currentView.value));
const countLabel = computed(() => {
  if (currentView.value === "community") {
    if (communityMode.value === "detail") return "게시글 상세";
    if (communityMode.value === "write") return "새 글 작성";
    if (communityMode.value === "edit") return "게시글 수정";
    return `${posts.value.length}개 글`;
  }
  if (selectedPlace.value) return "상세 정보";
  return loadingText.value;
});

function tourCategoryForView() {
  if (currentView.value === "spots") return spotCategory.value;
  if (currentView.value === "events") return "events";
  return "courses";
}

function isDisplayableItem(item) {
  if (currentView.value !== "spots") return true;
  return !excludedTitleKeywords.some((keyword) => (item.title || "").includes(keyword));
}

function filterItems(items) {
  const keyword = searchKeyword.value.trim().toLowerCase();
  const displayableItems = items.filter(isDisplayableItem);
  if (!keyword) return displayableItems;

  return displayableItems.filter((item) =>
    [item.title, item.addr1, item.tel, item.eventplace].filter(Boolean).join(" ").toLowerCase().includes(keyword),
  );
}

function imageFor(item) {
  const category = currentView.value === "spots" ? spotCategory.value : currentView.value;
  return item.firstimage || item.firstimage2 || fallbackImages[category] || fallbackImages.tourist;
}

function formatDate(value) {
  if (!value) return "-";
  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
}

function formatPostDate(value) {
  if (!value) return "-";
  return value.slice(0, 10);
}

async function loadTourData() {
  selectedPlace.value = null;
  errorText.value = "";
  loadingText.value = "불러오는 중";
  const category = tourCategoryForView();
  const cacheKey = currentView.value === "spots" ? `spots:${category}` : currentView.value;

  try {
    if (!cache[cacheKey]) {
      cache[cacheKey] = await apiRequest(`/api/tour/${category}`);
    }
    const items = filterItems(cache[cacheKey].items || []);
    currentItems.value = items;
    loadingText.value = `${items.length.toLocaleString()}건`;
  } catch (error) {
    currentItems.value = [];
    loadingText.value = "오류";
    errorText.value = error.message;
  }
}

async function selectView(view) {
  currentView.value = view;
  searchKeyword.value = "";
  selectedPlace.value = null;
  selectedPost.value = null;
  communityMode.value = "list";

  if (view === "community") {
    await loadPosts();
  } else {
    await loadTourData();
  }
}

async function selectSpotCategory(category) {
  spotCategory.value = category;
  searchKeyword.value = "";
  await loadTourData();
}

async function applySearch() {
  const cacheKey = currentView.value === "spots" ? `spots:${spotCategory.value}` : currentView.value;
  const items = filterItems(cache[cacheKey]?.items || []);
  currentItems.value = items;
  loadingText.value = `${items.length.toLocaleString()}건`;
}

function showPlaceDetail(item) {
  selectedPlace.value = item;
}

function backToPlaceList() {
  selectedPlace.value = null;
}

async function loadPosts() {
  errorText.value = "";
  try {
    posts.value = await apiRequest("/api/posts");
    communityMode.value = "list";
  } catch (error) {
    errorText.value = "FastAPI 서버에 연결할 수 없습니다. backend에서 uvicorn app.main:app --port 8000을 실행해 주세요.";
  }
}

async function showPostDetail(postId) {
  try {
    selectedPost.value = await apiRequest(`/api/posts/${postId}`);
    communityMode.value = "detail";
  } catch (error) {
    window.alert(error.message);
  }
}

function showWriteForm() {
  postForm.title = "";
  postForm.password = "";
  postForm.content = "";
  communityMode.value = "write";
}

async function createPost() {
  const post = await apiRequest("/api/posts", {
    method: "POST",
    body: JSON.stringify({ ...postForm }),
  });
  await showPostDetail(post.id);
}

function showEditForm() {
  editForm.id = selectedPost.value.id;
  editForm.title = selectedPost.value.title;
  editForm.password = "";
  editForm.content = selectedPost.value.content;
  communityMode.value = "edit";
}

async function updatePost() {
  const post = await apiRequest(`/api/posts/${editForm.id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: editForm.title,
      password: editForm.password,
      content: editForm.content,
    }),
  });
  await showPostDetail(post.id);
}

async function deletePost() {
  const password = window.prompt("게시글 비밀번호를 입력하세요.");
  if (password === null || !window.confirm("게시글을 삭제할까요?")) return;

  try {
    await apiRequest(`/api/posts/${selectedPost.value.id}`, {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
    await loadPosts();
  } catch (error) {
    window.alert(error.message);
  }
}

async function sendChat() {
  const message = chatInput.value.trim();
  if (!message) return;

  chatMessages.value.push({ type: "user", text: message });
  chatInput.value = "";
  const loadingMessage = reactive({ type: "bot", text: "답변 생성중..." });
  chatMessages.value.push(loadingMessage);
  await nextTick();

  try {
    const data = await apiRequest("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    loadingMessage.text = data.answer;
  } catch (error) {
    loadingMessage.text = `챗봇 API에 연결할 수 없습니다. ${error.message}`;
  }
}

selectView("spots");
</script>

<template>
  <div class="app-shell">
    <header class="hero">
      <div class="hero-copy">
        <p class="eyebrow">BUSAN LOCALHUB</p>
        <h1>부산 여행 허브</h1>
        <p>관광지, 축제, 여행코스와 커뮤니티를 한 화면에서 둘러보세요.</p>
      </div>
    </header>

    <nav class="category-tabs" aria-label="주요 메뉴">
      <button
        v-for="(meta, view) in viewMeta"
        :key="view"
        class="tab-button"
        :class="{ active: currentView === view }"
        type="button"
        @click="selectView(view)"
      >
        {{ meta.kicker }}
      </button>
    </nav>

    <main class="content-layout">
      <section class="main-panel" aria-live="polite">
        <div class="panel-header">
          <div>
            <p class="section-kicker">{{ currentMeta.kicker }}</p>
            <h2>{{ currentMeta.title }}</h2>
          </div>
          <p class="count-label">{{ countLabel }}</p>
        </div>

        <template v-if="isPlaceView">
          <article v-if="selectedPlace" class="place-detail">
            <img class="place-detail-image" :src="imageFor(selectedPlace)" :alt="selectedPlace.title" />
            <div class="place-detail-content">
              <h3>{{ selectedPlace.title }}</h3>
              <dl>
                <dt>주소</dt>
                <dd>{{ selectedPlace.addr1 || "주소 정보 없음" }}</dd>
                <dt>전화</dt>
                <dd>{{ selectedPlace.tel || "전화번호 정보 없음" }}</dd>
                <dt>좌표</dt>
                <dd>{{ selectedPlace.mapy || "-" }}, {{ selectedPlace.mapx || "-" }}</dd>
              </dl>
              <dl v-if="currentView === 'events'">
                <dt>기간</dt>
                <dd>{{ formatDate(selectedPlace.eventstartdate) }} ~ {{ formatDate(selectedPlace.eventenddate) }}</dd>
                <dt>장소</dt>
                <dd>{{ selectedPlace.eventplace || selectedPlace.addr1 || "-" }}</dd>
              </dl>
              <div class="community-actions">
                <button class="write-button" type="button" @click="backToPlaceList">목록으로</button>
              </div>
            </div>
          </article>

          <article v-if="selectedPlace" class="place-map">
            <KakaoMap />
          </article>

          <template v-else>
            <div class="list-controls">
              <div v-if="currentView === 'spots'" class="filter-chips">
                <button
                  v-for="category in spotCategories"
                  :key="category.id"
                  class="filter-chip"
                  :class="{ active: spotCategory === category.id }"
                  type="button"
                  @click="selectSpotCategory(category.id)"
                >
                  {{ category.label }}
                </button>
              </div>
              <label class="search-box">
                <span class="sr-only">검색</span>
                <input
                  v-model="searchKeyword"
                  type="search"
                  :placeholder="currentView === 'events' ? '행사명 또는 장소 검색' : '장소명 또는 주소 검색'"
                  @input="applySearch"
                />
              </label>
              <p class="result-summary">검색 결과 {{ currentItems.length.toLocaleString() }}건</p>
            </div>

            <div v-if="errorText" class="empty-state">{{ errorText }}</div>

            <table v-else-if="currentView === 'events'" class="data-table">
              <thead>
                <tr>
                  <th>행사명</th>
                  <th>기간</th>
                  <th>장소</th>
                  <th>문의</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in currentItems.slice(0, 15)" :key="item.contentid">
                  <td><button class="link-button" type="button" @click="showPlaceDetail(item)">{{ item.title }}</button></td>
                  <td>{{ formatDate(item.eventstartdate) }} ~ {{ formatDate(item.eventenddate) }}</td>
                  <td>{{ item.eventplace || item.addr1 || "-" }}</td>
                  <td>{{ item.tel || "-" }}</td>
                </tr>
              </tbody>
            </table>

            <div v-else class="card-grid">
              <article v-for="item in currentItems.slice(0, 12)" :key="item.contentid" class="place-card">
                <img :src="imageFor(item)" :alt="item.title" loading="lazy" />
                <div class="place-card-content">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.addr1 || "주소 정보 없음" }}</p>
                  <button class="detail-button" type="button" @click="showPlaceDetail(item)">상세 보기</button>
                </div>
              </article>
            </div>
          </template>
        </template>

        <template v-else>
          <div v-if="errorText" class="empty-state">{{ errorText }}</div>

          <template v-else-if="communityMode === 'list'">
            <div class="community-actions">
              <button class="write-button" type="button" @click="showWriteForm">글쓰기</button>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>작성일</th>
                  <th>조회</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="post in posts" :key="post.id">
                  <td><button class="link-button" type="button" @click="showPostDetail(post.id)">{{ post.title }}</button></td>
                  <td>{{ post.author }}</td>
                  <td>{{ formatPostDate(post.created_at) }}</td>
                  <td>{{ post.views }}</td>
                </tr>
              </tbody>
            </table>
          </template>

          <article v-else-if="communityMode === 'detail'" class="post-detail">
            <div class="post-detail-header">
              <h3>{{ selectedPost.title }}</h3>
              <p>{{ selectedPost.author }} · {{ formatPostDate(selectedPost.created_at) }} · 조회 {{ selectedPost.views }}</p>
            </div>
            <div class="post-content">{{ selectedPost.content }}</div>
            <div class="community-actions">
              <button class="secondary-button" type="button" @click="loadPosts">목록으로</button>
              <button class="secondary-button" type="button" @click="showEditForm">수정</button>
              <button class="danger-button" type="button" @click="deletePost">삭제</button>
            </div>
          </article>

          <form v-else-if="communityMode === 'write'" class="write-form" @submit.prevent="createPost">
            <label>제목<input v-model="postForm.title" type="text" placeholder="제목을 입력하세요" required /></label>
            <label>비밀번호<input v-model="postForm.password" type="password" placeholder="수정/삭제용 비밀번호" required /></label>
            <label>내용<textarea v-model="postForm.content" placeholder="내용을 입력하세요" required></textarea></label>
            <div class="community-actions">
              <button class="secondary-button" type="button" @click="loadPosts">목록으로</button>
              <button class="write-button" type="submit">등록</button>
            </div>
          </form>

          <form v-else class="write-form" @submit.prevent="updatePost">
            <label>제목<input v-model="editForm.title" type="text" required /></label>
            <label>비밀번호<input v-model="editForm.password" type="password" placeholder="게시글 비밀번호" required /></label>
            <label>내용<textarea v-model="editForm.content" required></textarea></label>
            <div class="community-actions">
              <button class="secondary-button" type="button" @click="showPostDetail(editForm.id)">취소</button>
              <button class="write-button" type="submit">저장</button>
            </div>
          </form>
        </template>
      </section>

      <aside class="chat-panel">
        <div class="chat-header">
          <p class="section-kicker">챗봇</p>
          <h2>부산 여행 도우미</h2>
        </div>
        <div class="chat-log">
          <p v-for="(message, index) in chatMessages" :key="index" :class="message.type === 'user' ? 'user-message' : 'bot-message'">
            {{ message.text }}
          </p>
        </div>
        <form class="chat-form" @submit.prevent="sendChat">
          <label class="sr-only" for="chatInput">챗봇 프롬프트</label>
          <input id="chatInput" v-model="chatInput" type="text" placeholder="부산 가볼만한 곳 추천해줘" />
          <button type="submit">전송</button>
        </form>
      </aside>
    </main>

    <footer class="source-note">
      이 서비스는 한국관광공사 Tour API(TourAPI 4.0)의 데이터를 활용하였습니다.
      출처: 한국관광공사
      <a href="https://www.data.go.kr/data/15101578/openapi.do">공공데이터포털</a>
      / 라이선스: 공공누리 제3유형
    </footer>
  </div>
</template>
