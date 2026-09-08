/*
 * Rebuild Structure — main.js
 * 必要最小限のVanilla JavaScript。
 * 機能：(1) ヘッダー高さのCSS変数への反映 (2) スマートフォン用メニューの開閉（背景スクロール抑止・フォーカス移動を含む） (3) FAQの開閉
 * ページ内スクロールは CSS の scroll-behavior / scroll-margin-top で対応済みのため、JS実装なし。
 */
(function () {
  "use strict";

  /* ---------- 1. ヘッダー高さのCSS変数への反映 ----------
   * --header-height はCSS側では固定値（フォールバック）だが、
   * モバイル幅ではヘッダー内のボタン折り返し等で実際の高さが変わるため、
   * 実測値で上書きする（.site-nav の位置ズレ・見切れを防ぐ）。
   */
  function initHeaderHeight() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function updateHeaderHeight() {
      document.documentElement.style.setProperty("--header-height", header.offsetHeight + "px");
    }

    updateHeaderHeight();

    if (window.ResizeObserver) {
      new ResizeObserver(updateHeaderHeight).observe(header);
    } else {
      window.addEventListener("resize", updateHeaderHeight);
    }
  }

  /* ---------- 2. スマートフォン用メニューの開閉 ----------
   * 開閉に加えて、(a) 背景スクロールの抑止 (b) 開閉に応じたフォーカス移動
   * (c) アクセシブルネームの状態同期 を行う。
   */
  function initNavToggle() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    var toggleLabel = toggle.querySelector(".visually-hidden");

    function closeNav(options) {
      options = options || {};
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      document.documentElement.classList.remove("has-nav-open");
      if (toggleLabel) toggleLabel.textContent = "メニューを開く";
      if (options.restoreFocus) {
        toggle.focus();
      }
    }

    function openNav() {
      toggle.setAttribute("aria-expanded", "true");
      nav.classList.add("is-open");
      document.documentElement.classList.add("has-nav-open");
      if (toggleLabel) toggleLabel.textContent = "メニューを閉じる";
      var firstLink = nav.querySelector("a");
      if (firstLink) firstLink.focus();
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeNav({ restoreFocus: true });
      } else {
        openNav();
      }
    });

    /* ナビ内のリンクをクリックしたら閉じる（アンカー移動後にメニューが開いたままにならないように） */
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeNav();
      });
    });

    /* Escapeキーで閉じる（開いている場合のみ、フォーカスをトグルボタンへ戻す） */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeNav({ restoreFocus: true });
      }
    });

    /* デスクトップ幅にリサイズされたら状態をリセット */
    var desktopQuery = window.matchMedia("(min-width: 1024px)");
    function handleQueryChange(event) {
      if (event.matches) {
        closeNav();
      }
    }
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", handleQueryChange);
    }
  }

  /* ---------- 3. FAQの開閉 ---------- */
  function initFaqAccordion() {
    var questions = document.querySelectorAll(".faq-question");
    questions.forEach(function (button) {
      button.addEventListener("click", function () {
        var expanded = button.getAttribute("aria-expanded") === "true";
        var panelId = button.getAttribute("aria-controls");
        var panel = panelId ? document.getElementById(panelId) : null;

        button.setAttribute("aria-expanded", String(!expanded));
        if (panel) {
          if (expanded) {
            panel.setAttribute("hidden", "");
          } else {
            panel.removeAttribute("hidden");
          }
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeaderHeight();
    initNavToggle();
    initFaqAccordion();
  });
})();
