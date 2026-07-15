const DATA_FILES = {
  spots: "./busan/부산_관광지.json",
  events: "./busan/부산_축제공연행사.json",
  courses: "./busan/부산_여행코스.json",
};

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
  cache: {},
  currentItems: [],
  posts: loadPosts(),
};

function loadPosts() {
  const savedPosts = localStorage.getItem("busan-localhub-posts");

  if (!savedPosts) {
    return defaultPosts;
  }

  try {
    return JSON.parse(savedPosts);
  } catch {
    return defaultPosts;
  }
}

function savePosts() {
  localStorage.setItem("busan-localhub-posts", JSON.stringify(state.posts));
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
  if (state.cache[view]) {
    return state.cache[view];
  }

  const response = await fetch(DATA_FILES[view]);
  if (!response.ok) {
    throw new Error(`${view} 데이터를 불러오지 못했습니다.`);
  }

  const data = await response.json();
  state.cache[view] = data;
  return data;
}

function setHeader(view, countText) {
  const meta = VIEW_META[view];
  viewKicker.textContent = meta.kicker;
  viewTitle.textContent = meta.title;
  viewCount.textContent = countText;
}

function imageOrPlaceholder(item) {
  return item.firstimage || item.firstimage2 || "";
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

function renderMiniMap(items) {
  const points = getValidPoints(items).slice(0, 60);

  if (!points.length) {
    return `
      <div class="map-placeholder">
        <strong>지도 영역</strong><br />
        표시할 좌표 정보가 없습니다.
      </div>
    `;
  }

  const minX = Math.min(...points.map((item) => item.x));
  const maxX = Math.max(...points.map((item) => item.x));
  const minY = Math.min(...points.map((item) => item.y));
  const maxY = Math.max(...points.map((item) => item.y));

  const markers = points
    .map((item) => {
      const left = ((item.x - minX) / (maxX - minX || 1)) * 86 + 7;
      const top = (1 - (item.y - minY) / (maxY - minY || 1)) * 78 + 11;

      return `
        <button
          class="map-marker"
          type="button"
          style="left:${left}%; top:${top}%"
          data-action="place-detail"
          data-item-index="${item.index}"
          title="${item.title}"
          aria-label="${item.title} 상세 보기"
        ></button>
      `;
    })
    .join("");

  return `
    <div class="mini-map" aria-label="부산 좌표 기반 마커 지도">
      <div class="map-water">Busan</div>
      ${markers}
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
    ${renderMiniMap(items)}
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
  const rows = items
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
    <table class="data-table">
      <thead>
        <tr>
          <th>행사명</th>
          <th>기간</th>
          <th>장소</th>
          <th>문의</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
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
          <td>${post.createdAt}</td>
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
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderPostDetail(postId) {
  const post = state.posts.find((item) => item.id === Number(postId));

  if (!post) {
    setHeader("community", "게시글 없음");
    viewBody.innerHTML = `
      <div class="empty-state">
        게시글을 찾을 수 없습니다.
        <button class="write-button" type="button" data-action="list">목록으로</button>
      </div>
    `;
    return;
  }

  post.views += 1;
  setHeader("community", "게시글 상세");
  viewBody.innerHTML = `
    <article class="post-detail">
      <div class="post-detail-header">
        <h3>${post.title}</h3>
        <p>${post.author} · ${post.createdAt} · 조회 ${post.views}</p>
      </div>
      <div class="post-content">${post.content}</div>
      <div class="community-actions">
        <button class="write-button" type="button" data-action="list">목록으로</button>
      </div>
    </article>
  `;
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

function createPost(form) {
  const formData = new FormData(form);
  const post = {
    id: Date.now(),
    title: String(formData.get("title")).trim(),
    author: "익명",
    createdAt: new Date().toISOString().slice(0, 10),
    views: 0,
    password: String(formData.get("password")).trim(),
    content: String(formData.get("content")).trim(),
  };

  if (!post.title || !post.password || !post.content) {
    return;
  }

  state.posts = [post, ...state.posts];
  savePosts();
  renderPostDetail(post.id);
}

async function renderView(view) {
  state.currentView = view;
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  if (view === "community") {
    setHeader(view, `${state.posts.length}개 글`);
    viewBody.innerHTML = renderCommunity();
    return;
  }

  setHeader(view, "불러오는 중");
  viewBody.innerHTML = `<div class="map-placeholder">데이터를 불러오고 있습니다.</div>`;

  try {
    const data = await loadData(view);
    const items = data.items || [];
    state.currentItems = items;
    setHeader(view, `${items.length.toLocaleString()}건`);
    viewBody.innerHTML = view === "events" ? renderEvents(items) : renderCards(items);
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

viewBody.addEventListener("click", (event) => {
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

  if (button.dataset.action === "back-current") {
    renderView(state.currentView);
  }

  if (button.dataset.action === "detail") {
    renderPostDetail(button.dataset.postId);
  }

  if (button.dataset.action === "list") {
    renderView("community");
  }
});

viewBody.addEventListener("submit", (event) => {
  event.preventDefault();

  if (event.target.id === "postForm") {
    createPost(event.target);
  }
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = chatInput.value.trim();
  if (!prompt) {
    return;
  }

  addChatMessage(prompt, "user");
  chatInput.value = "";
  addChatMessage("답변 생성중... FastAPI /api/chat 연결 예정입니다.", "bot");
});

renderView("spots");
