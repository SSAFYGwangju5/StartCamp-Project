const TOUR_API_CATEGORIES = {
  tourist: "tourist",
  culture: "culture",
  lodging: "lodging",
  shopping: "shopping",
  sports: "sports",
  events: "events",
  courses: "courses",
};

const API_BASE_URL = "http://127.0.0.1:8000";

const SPOT_CATEGORIES = [
  { id: "tourist", label: "관광지" },
  { id: "culture", label: "문화시설" },
  { id: "lodging", label: "숙박" },
  { id: "shopping", label: "쇼핑" },
  { id: "sports", label: "레포츠" },
];

const FALLBACK_IMAGES = {
  tourist: "https://tong.visitkorea.or.kr/cms/resource/34/3090534_image2_1.JPG",
  culture: "https://tong.visitkorea.or.kr/cms/resource/16/4055716_image2_1.png",
  lodging: "https://tong.visitkorea.or.kr/cms/resource/69/4077869_image2_1.jpg",
  shopping: "https://tong.visitkorea.or.kr/cms/resource/73/3543373_image2_1.jpg",
  sports: "https://tong.visitkorea.or.kr/cms/resource/11/3495811_image2_1.jpg",
  events: "https://tong.visitkorea.or.kr/cms/resource/92/4077792_image2_1.jpg",
  courses: "http://tong.visitkorea.or.kr/cms/resource/83/2364283_image2_1.jpg",
};

const EXCLUDED_TITLE_KEYWORDS = ["성형외과", "의원", "주식회사"];

const VIEW_META = {
  spots: {
    kicker: "관광지",
    title: "부산 관광지 리스트",
  },
  events: {
    kicker: "축제/행사",
    title: "부산 축제/행사 리스트",
  },
  courses: {
    kicker: "여행코스",
    title: "부산 여행코스 리스트",
  },
  community: {
    kicker: "커뮤니티",
    title: "부산 여행 커뮤니티",
  },
};

const defaultPosts = [
  {
    id: 1,
    title: "해운대 근처 저녁 산책 코스 추천",
    author: "익명",
    createdAt: "2026-07-15",
    views: 18,
    password: "1234",
    content:
      "저녁에는 해운대 해수욕장에서 동백섬 방향으로 걷는 코스를 추천합니다. 바다 쪽 산책로가 잘 정비되어 있고, 시간이 맞으면 마린시티 야경까지 함께 보기 좋습니다.",
  },
  {
    id: 2,
    title: "비 오는 날 가기 좋은 실내 관광지 있나요?",
    author: "익명",
    createdAt: "2026-07-15",
    views: 9,
    password: "1234",
    content:
      "비가 오면 부산현대미술관, 국립해양박물관, 영화의전당 같은 실내 중심 장소를 묶어서 움직이면 편합니다. 이동 거리가 길어지지 않게 권역을 하나로 잡는 게 좋아요.",
  },
];

const state = {
  currentView: "spots",
  spotCategory: "tourist",
  searchKeyword: "",
  cache: {},
  currentItems: [],
  posts: [],
};

function formatPostDate(value) {
  if (!value) {
    return "-";
  }
  return value.slice(0, 10);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "요청을 처리하지 못했습니다.";
    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Keep default message when the server does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

const viewKicker = document.querySelector("#viewKicker");
const viewTitle = document.querySelector("#viewTitle");
const viewCount = document.querySelector("#viewCount");
const viewBody = document.querySelector("#viewBody");
const tabButtons = document.querySelectorAll(".tab-button");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatLog = document.querySelector("#chatLog");

async function loadData(view) {
  const cacheKey = view === "spots" ? `${view}:${state.spotCategory}` : view;

  if (state.cache[cacheKey]) {
    return state.cache[cacheKey];
  }

  const category = view === "spots" ? state.spotCategory : TOUR_API_CATEGORIES[view];
  const data = await apiRequest(`/api/tour/${category}`);
  state.cache[cacheKey] = data;
  return data;
}

function setHeader(view, countText) {
  const meta = VIEW_META[view];
  viewKicker.textContent = meta.kicker;
  viewTitle.textContent = meta.title;
  viewCount.textContent = countText;
}

function imageOrPlaceholder(item) {
  const category = state.currentView === "spots" ? state.spotCategory : state.currentView;
  return item.firstimage || item.firstimage2 || FALLBACK_IMAGES[category] || FALLBACK_IMAGES.tourist;
}

function isDisplayableItem(item) {
  if (state.currentView !== "spots") {
    return true;
  }

  const title = item.title || "";
  return !EXCLUDED_TITLE_KEYWORDS.some((keyword) => title.includes(keyword));
}

function prepareItems(items) {
  return items.filter(isDisplayableItem);
}

function getValidPoints(items) {
  return items
    .map((item, index) => ({
      ...item,
      index,
      x: Number(item.mapx),
      y: Number(item.mapy),
    }))
    .filter((item) => Number.isFinite(item.x) && Number.isFinite(item.y));
}

function filterItems(items) {
  const keyword = state.searchKeyword.trim().toLowerCase();

  if (!keyword) {
    return items;
  }

  return items.filter((item) => {
    const searchableText = [item.title, item.addr1, item.tel, item.eventplace]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchableText.includes(keyword);
  });
}

function renderSpotControls(totalCount, filteredCount) {
  const categoryButtons = SPOT_CATEGORIES.map(
    (category) => `
      <button
        class="filter-chip ${state.spotCategory === category.id ? "active" : ""}"
        type="button"
        data-action="spot-category"
        data-category="${category.id}"
      >
        ${category.label}
      </button>
    `,
  ).join("");

  return `
    <div class="list-controls">
      <div class="filter-chips">${categoryButtons}</div>
      <label class="search-box">
        <span class="sr-only">장소 검색</span>
        <input id="searchInput" type="search" value="${state.searchKeyword}" placeholder="장소명 또는 주소 검색" />
      </label>
      <p class="result-summary">전체 ${totalCount.toLocaleString()}건 중 ${filteredCount.toLocaleString()}건</p>
    </div>
  `;
}

function renderCards(items) {
  const cards = items
    .slice(0, 12)
    .map((item, index) => {
      const image = imageOrPlaceholder(item);
      const imageMarkup = image
        ? `<img src="${image}" alt="${item.title}" loading="lazy" />`
        : `<div class="map-placeholder">이미지 없음</div>`;

      return `
        <article class="place-card">
          ${imageMarkup}
          <div class="place-card-content">
            <h3>${item.title}</h3>
            <p>${item.addr1 || "주소 정보 없음"}</p>
            <button class="detail-button" type="button" data-action="place-detail" data-item-index="${index}">
              상세 보기
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <div class="card-grid">${cards}</div>
  `;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
}

function renderEvents(items) {
  const filteredItems = filterItems(items);
  const rows = filteredItems
    .slice(0, 15)
    .map(
      (item, index) => `
        <tr>
          <td>
            <button class="link-button" type="button" data-action="place-detail" data-item-index="${index}">
              ${item.title}
            </button>
          </td>
          <td>${formatDate(item.eventstartdate)} ~ ${formatDate(item.eventenddate)}</td>
          <td>${item.eventplace || item.addr1 || "-"}</td>
          <td>${item.tel || "-"}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="list-controls">
      <label class="search-box">
        <span class="sr-only">행사 검색</span>
        <input id="searchInput" type="search" value="${state.searchKeyword}" placeholder="행사명 또는 장소 검색" />
      </label>
      <p class="result-summary">전체 ${items.length.toLocaleString()}건 중 ${filteredItems.length.toLocaleString()}건</p>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>행사명</th>
          <th>기간</th>
          <th>장소</th>
          <th>문의</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="4">검색 결과가 없습니다.</td></tr>`}</tbody>
    </table>
  `;
}

function renderPlaceDetail(itemIndex) {
  const item = state.currentItems[Number(itemIndex)];

  if (!item) {
    viewBody.innerHTML = `
      <div class="empty-state">
        항목을 찾을 수 없습니다.
        <button class="write-button" type="button" data-action="back-current">목록으로</button>
      </div>
    `;
    return;
  }

  const image = imageOrPlaceholder(item);
  const isEvent = state.currentView === "events";
  const dateInfo = isEvent
    ? `
      <dl>
        <dt>기간</dt>
        <dd>${formatDate(item.eventstartdate)} ~ ${formatDate(item.eventenddate)}</dd>
        <dt>장소</dt>
        <dd>${item.eventplace || item.addr1 || "-"}</dd>
      </dl>
    `
    : "";

  viewCount.textContent = "상세 정보";
  viewBody.innerHTML = `
    <article class="place-detail">
      ${
        image
          ? `<img class="place-detail-image" src="${image}" alt="${item.title}" />`
          : `<div class="place-detail-image empty-image">이미지 없음</div>`
      }
      <div class="place-detail-content">
        <h3>${item.title}</h3>
        <dl>
          <dt>주소</dt>
          <dd>${item.addr1 || "주소 정보 없음"}</dd>
          <dt>전화</dt>
          <dd>${item.tel || "전화번호 정보 없음"}</dd>
          <dt>좌표</dt>
          <dd>${item.mapy || "-"}, ${item.mapx || "-"}</dd>
        </dl>
        ${dateInfo}
        <div class="community-actions">
          <button class="write-button" type="button" data-action="back-current">목록으로</button>
        </div>
      </div>
    </article>
  `;
}

function renderCommunity() {
  const rows = state.posts
    .map(
      (post) => `
        <tr>
          <td>
            <button class="link-button" type="button" data-action="detail" data-post-id="${post.id}">
              ${post.title}
            </button>
          </td>
          <td>${post.author}</td>
          <td>${formatPostDate(post.created_at)}</td>
          <td>${post.views}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="community-actions">
      <button class="write-button" type="button" data-action="write">글쓰기</button>
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
      <tbody>${rows || `<tr><td colspan="4">게시글이 없습니다.</td></tr>`}</tbody>
    </table>
  `;
}

async function loadCommunity() {
  setHeader("community", "불러오는 중");
  viewBody.innerHTML = `<div class="map-placeholder">게시글을 불러오고 있습니다.</div>`;

  try {
    state.posts = await apiRequest("/api/posts");
    setHeader("community", `${state.posts.length}개 글`);
    viewBody.innerHTML = renderCommunity();
  } catch (error) {
    setHeader("community", "API 연결 필요");
    viewBody.innerHTML = `
      <div class="empty-state">
        FastAPI 서버에 연결할 수 없습니다.<br />
        backend에서 <strong>uvicorn app.main:app --reload --port 8000</strong>을 실행해 주세요.
      </div>
    `;
  }
}

async function renderPostDetail(postId) {
  try {
    const post = await apiRequest(`/api/posts/${postId}`);

    setHeader("community", "게시글 상세");
    viewBody.innerHTML = `
      <article class="post-detail">
        <div class="post-detail-header">
          <h3>${post.title}</h3>
          <p>${post.author} · ${formatPostDate(post.created_at)} · 조회 ${post.views}</p>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="community-actions">
          <button class="secondary-button" type="button" data-action="list">목록으로</button>
          <button class="secondary-button" type="button" data-action="edit-post" data-post-id="${post.id}">수정</button>
          <button class="danger-button" type="button" data-action="delete-post" data-post-id="${post.id}">삭제</button>
        </div>
      </article>
    `;
  } catch (error) {
    setHeader("community", "게시글 없음");
    viewBody.innerHTML = `
      <div class="empty-state">
        ${error.message}
        <button class="write-button" type="button" data-action="list">목록으로</button>
      </div>
    `;
  }
}

function renderWriteForm() {
  setHeader("community", "새 글 작성");
  viewBody.innerHTML = `
    <form class="write-form" id="postForm">
      <label>
        제목
        <input name="title" type="text" placeholder="제목을 입력하세요" required />
      </label>
      <label>
        비밀번호
        <input name="password" type="password" placeholder="수정/삭제용 비밀번호" required />
      </label>
      <label>
        내용
        <textarea name="content" placeholder="내용을 입력하세요" required></textarea>
      </label>
      <div class="community-actions">
        <button class="secondary-button" type="button" data-action="list">목록으로</button>
        <button class="write-button" type="submit">등록</button>
      </div>
    </form>
  `;
}

async function renderEditForm(postId) {
  const post = await apiRequest(`/api/posts/${postId}`);

  setHeader("community", "게시글 수정");
  viewBody.innerHTML = `
    <form class="write-form" id="editForm" data-post-id="${post.id}">
      <label>
        제목
        <input name="title" type="text" value="${post.title}" required />
      </label>
      <label>
        비밀번호
        <input name="password" type="password" placeholder="게시글 비밀번호" required />
      </label>
      <label>
        내용
        <textarea name="content" required>${post.content}</textarea>
      </label>
      <div class="community-actions">
        <button class="secondary-button" type="button" data-action="post-detail" data-post-id="${post.id}">취소</button>
        <button class="write-button" type="submit">저장</button>
      </div>
    </form>
  `;
}

async function createPost(form) {
  const formData = new FormData(form);
  const payload = {
    title: String(formData.get("title")).trim(),
    password: String(formData.get("password")).trim(),
    content: String(formData.get("content")).trim(),
  };

  if (!payload.title || !payload.password || !payload.content) {
    return;
  }

  const post = await apiRequest("/api/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  renderPostDetail(post.id);
}

async function updatePost(form) {
  const postId = Number(form.dataset.postId);
  const formData = new FormData(form);
  const payload = {
    title: String(formData.get("title")).trim(),
    password: String(formData.get("password")).trim(),
    content: String(formData.get("content")).trim(),
  };

  if (!payload.title || !payload.password || !payload.content) {
    return;
  }

  const post = await apiRequest(`/api/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  renderPostDetail(post.id);
}

async function deletePost(postId) {
  const password = window.prompt("게시글 비밀번호를 입력하세요.");
  if (password === null) {
    return;
  }

  const confirmed = window.confirm("게시글을 삭제할까요?");
  if (!confirmed) {
    return;
  }

  await apiRequest(`/api/posts/${postId}`, {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
  renderView("community");
}

async function renderView(view) {
  state.currentView = view;
  state.searchKeyword = "";
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  if (view === "community") {
    loadCommunity();
    return;
  }

  setHeader(view, "불러오는 중");
  viewBody.innerHTML = `<div class="map-placeholder">데이터를 불러오고 있습니다.</div>`;

  try {
    const data = await loadData(view);
    const items = prepareItems(data.items || []);
    const filteredItems = filterItems(items);
    state.currentItems = filteredItems;
    setHeader(view, `${filteredItems.length.toLocaleString()}건`);

    if (view === "spots") {
      viewBody.innerHTML = `${renderSpotControls(items.length, filteredItems.length)}${renderCards(filteredItems)}`;
      return;
    }

    viewBody.innerHTML = view === "events" ? renderEvents(items) : renderCards(filteredItems);
  } catch (error) {
    viewCount.textContent = "오류";
    viewBody.innerHTML = `<div class="map-placeholder">${error.message}</div>`;
  }
}

function addChatMessage(message, type) {
  const bubble = document.createElement("p");
  bubble.className = type === "user" ? "user-message" : "bot-message";
  bubble.textContent = message;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => renderView(button.dataset.view));
});

viewBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  if (button.dataset.action === "write") {
    renderWriteForm();
  }

  if (button.dataset.action === "place-detail") {
    renderPlaceDetail(button.dataset.itemIndex);
  }

  if (button.dataset.action === "spot-category") {
    state.spotCategory = button.dataset.category;
    state.searchKeyword = "";
    renderView("spots");
  }

  if (button.dataset.action === "back-current") {
    renderView(state.currentView);
  }

  if (button.dataset.action === "detail") {
    await renderPostDetail(button.dataset.postId);
  }

  if (button.dataset.action === "post-detail") {
    await renderPostDetail(button.dataset.postId);
  }

  if (button.dataset.action === "edit-post") {
    try {
      await renderEditForm(button.dataset.postId);
    } catch (error) {
      window.alert(error.message);
    }
  }

  if (button.dataset.action === "delete-post") {
    try {
      await deletePost(button.dataset.postId);
    } catch (error) {
      window.alert(error.message);
    }
  }

  if (button.dataset.action === "list") {
    renderView("community");
  }
});

viewBody.addEventListener("input", (event) => {
  if (event.target.id !== "searchInput") {
    return;
  }

  state.searchKeyword = event.target.value;
  const data = state.cache[state.currentView === "spots" ? `spots:${state.spotCategory}` : state.currentView];
  const items = prepareItems(data?.items || []);
  const filteredItems = filterItems(items);
  state.currentItems = filteredItems;
  setHeader(state.currentView, `${filteredItems.length.toLocaleString()}건`);

  if (state.currentView === "spots") {
    viewBody.innerHTML = `${renderSpotControls(items.length, filteredItems.length)}${renderCards(filteredItems)}`;
    document.querySelector("#searchInput")?.focus();
  }

  if (state.currentView === "events") {
    viewBody.innerHTML = renderEvents(items);
    document.querySelector("#searchInput")?.focus();
  }
});

viewBody.addEventListener("submit", (event) => {
  event.preventDefault();

  if (event.target.id === "postForm") {
    createPost(event.target).catch((error) => window.alert(error.message));
  }

  if (event.target.id === "editForm") {
    updatePost(event.target).catch((error) => window.alert(error.message));
  }
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const prompt = chatInput.value.trim();
  if (!prompt) {
    return;
  }

  addChatMessage(prompt, "user");
  chatInput.value = "";
  const loadingMessage = addChatMessage("답변 생성중...", "bot");

  try {
    const data = await apiRequest("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: prompt }),
    });
    loadingMessage.textContent = data.answer;
  } catch (error) {
    loadingMessage.textContent = `챗봇 API에 연결할 수 없습니다. ${error.message}`;
  }
});

renderView("spots");
