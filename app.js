// portfolio/app.js
(() => {
    const DB = window.PORTFOLIO;
    if (!DB) return;

    const $ = (sel) => document.querySelector(sel);

    // ---------- 공용: HTML escape ----------
    const esc = (s) =>
        String(s).replace(/[&<>"']/g, (m) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        }[m]));

    // ---------- 공용: 라이트박스 ----------
    function initLightbox() {
        const overlay = $(".lightbox");
        const img = $(".lightbox img");
        const btn = $(".lightbox .lb-close");

        if (!overlay || !img || !btn) return;

        const close = () => {
            overlay.classList.remove("is-open");
            overlay.setAttribute("aria-hidden", "true");
            img.src = "";
            img.alt = "";
        };

        // 배경 클릭 닫기
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) close();
        });

        // X 버튼
        btn.addEventListener("click", close);

        // ESC 닫기
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") close();
        });

        // 전역 함수로 노출(아래 렌더에서 사용)
        window.openLightbox = (src, alt = "Photo") => {
            img.src = src;
            img.alt = alt;
            overlay.classList.add("is-open");
            overlay.setAttribute("aria-hidden", "false");
        };
    }

    // ---------- index.html: masonry 카드 자동 생성 ----------
    function renderIndex() {
        const host = $("#masonry");
        if (!host) return;

        host.innerHTML = DB.series.map((s) => {
            const href = `series.html?id=${encodeURIComponent(s.id)}`;
            const count = Array.isArray(s.photos) ? s.photos.length : 0;

            return `
        <a class="card" href="${href}">
          <figure class="thumb">
            <img src="${esc(s.cover)}" alt="${esc(s.title)} cover" loading="lazy" decoding="async">
          </figure>
          <div class="meta">
            <div class="title">${esc(s.title)}</div>
            <div class="desc">${esc(s.year)} · ${count} photos</div>
          </div>
        </a>
      `;
        }).join("");
    }

    // ---------- series.html: 단일 템플릿에서 시리즈 렌더 ----------
    function renderSeries() {
        const host = $("#photos");
        if (!host) return;

        const params = new URLSearchParams(location.search);
        const id = params.get("id");
        const series = DB.series.find((x) => x.id === id) || DB.series[0];

        // 제목/브레드크럼
        const titleEl = $("#seriesTitle");
        const subEl = $("#seriesSub");
        const crumbEl = $("#seriesCrumb");

        if (titleEl) titleEl.textContent = series.title;
        if (subEl) subEl.textContent = `${series.year} · ${series.photos.length} photos`;
        if (crumbEl) crumbEl.textContent = series.title;

        // 사진만 쭉 (캡션 없음)
        host.innerHTML = series.photos.map((src, i) => {
            const alt = `${series.title} photo ${String(i + 1).padStart(2, "0")}`;
            return `
        <article class="photo">
          <figure class="photo-frame">
            <img
              src="${esc(src)}"
              alt="${esc(alt)}"
              loading="lazy"
              decoding="async"
              data-lb="1"
            >
          </figure>
        </article>
      `;
        }).join("");

        // 라이트박스 연결
        host.querySelectorAll('img[data-lb="1"]').forEach((img) => {
            img.addEventListener("click", () => {
                window.openLightbox?.(img.src, img.alt);
            });
        });
    }

    // ---------- 실행 ----------
    document.addEventListener("DOMContentLoaded", () => {
        // 사이트 이름 넣기(원하면)
        const nameEls = document.querySelectorAll("[data-site-name]");
        const subEls = document.querySelectorAll("[data-site-subtitle]");
        nameEls.forEach((el) => (el.textContent = DB.site.name));
        subEls.forEach((el) => (el.textContent = DB.site.subtitle));

        initLightbox();
        renderIndex();
        renderSeries();
    });
})();
