document.addEventListener('DOMContentLoaded', () => {
    const isJa = document.documentElement.lang === 'ja';

    /* ==========================================================================
       1. テーマ切り替え (Dark / Light)
       ========================================================================== */
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    if (themeToggle && themeIcon) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        const currentTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
        applyTheme(currentTheme);

        themeToggle.addEventListener('click', () => {
            const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });

        prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        function applyTheme(theme) {
            htmlElement.setAttribute('data-theme', theme);
            if (theme === 'dark') {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
        }
    }

    /* ==========================================================================
       2. 言語切り替えアニメーション
       ========================================================================== */
    const langSwitch = document.querySelector('.lang-switch-container');
    if (langSwitch) {
        langSwitch.addEventListener('click', (e) => {
            e.preventDefault();
            const targetUrl = langSwitch.getAttribute('href');
            const btns = langSwitch.querySelectorAll('.lang-switch-btn');

            if (langSwitch.classList.contains('lang-jp')) {
                langSwitch.classList.replace('lang-jp', 'lang-en');
            } else {
                langSwitch.classList.replace('lang-en', 'lang-jp');
            }

            btns.forEach(btn => btn.classList.toggle('active'));

            setTimeout(() => {
                window.location.href = targetUrl;
            }, 350);
        });
    }

    /* ==========================================================================
       3. トップに戻るボタン
       ========================================================================== */
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* ==========================================================================
       4. 研究業績リストの動的折りたたみ（最新3件表示＋もっと見る） & 件数バッジ
       ========================================================================== */
    const pubSection = document.getElementById('publications');
    const expandButtons = [];

    if (pubSection) {
        const pubLists = pubSection.querySelectorAll('ul.number-list');

        pubLists.forEach(list => {
            const items = Array.from(list.children).filter(child => child.tagName === 'LI');
            const total = items.length;
            if (total === 0) return;

            // 見出しに件数バッジを追加
            let prevHeader = list.previousElementSibling;
            while (prevHeader && !['H3', 'H4'].includes(prevHeader.tagName)) {
                prevHeader = prevHeader.previousElementSibling;
            }

            if (prevHeader && !prevHeader.querySelector('.pub-count-badge')) {
                const badge = document.createElement('span');
                badge.className = 'pub-count-badge';
                badge.textContent = isJa ? `全${total}件` : `${total} items`;
                prevHeader.appendChild(badge);
            }

            // 4件以上ある場合は3件だけ表示し、残りを折りたたむ
            const visibleThreshold = 3;
            if (total > visibleThreshold) {
                const hiddenItems = items.slice(visibleThreshold);
                hiddenItems.forEach(item => item.classList.add('pub-collapsed-item'));

                const remainingCount = hiddenItems.length;
                const wrapper = document.createElement('div');
                wrapper.className = 'pub-expand-wrapper';

                const btn = document.createElement('button');
                btn.className = 'pub-expand-btn';
                btn.setAttribute('type', 'button');

                const moreText = isJa ? `残り${remainingCount}件を表示` : `Show more (+${remainingCount})`;
                const lessText = isJa ? '閉じる' : 'Show less';

                btn.innerHTML = `<span class="btn-text">${moreText}</span><i class="fas fa-chevron-down"></i>`;

                btn.addEventListener('click', () => {
                    const isExpanded = btn.classList.toggle('is-expanded');
                    if (isExpanded) {
                        hiddenItems.forEach(item => item.classList.remove('pub-collapsed-item'));
                        btn.querySelector('.btn-text').textContent = lessText;
                    } else {
                        hiddenItems.forEach(item => item.classList.add('pub-collapsed-item'));
                        btn.querySelector('.btn-text').textContent = moreText;
                    }
                    updateGlobalToggleState();
                });

                wrapper.appendChild(btn);
                list.parentNode.insertBefore(wrapper, list.nextSibling);

                expandButtons.push({
                    btn: btn,
                    hiddenItems: hiddenItems,
                    moreText: moreText,
                    lessText: lessText
                });
            }
        });

        // 「すべて展開 / すべて折りたたむ」ボタン
        const toggleAllBtn = document.getElementById('pub-toggle-all');
        if (toggleAllBtn && expandButtons.length > 0) {
            toggleAllBtn.addEventListener('click', () => {
                const shouldExpand = !toggleAllBtn.classList.contains('all-expanded');

                expandButtons.forEach(({ btn, hiddenItems, moreText, lessText }) => {
                    if (shouldExpand) {
                        hiddenItems.forEach(item => item.classList.remove('pub-collapsed-item'));
                        btn.classList.add('is-expanded');
                        btn.querySelector('.btn-text').textContent = lessText;
                    } else {
                        hiddenItems.forEach(item => item.classList.add('pub-collapsed-item'));
                        btn.classList.remove('is-expanded');
                        btn.querySelector('.btn-text').textContent = moreText;
                    }
                });

                toggleAllBtn.classList.toggle('all-expanded', shouldExpand);
                updateGlobalToggleBtnText(shouldExpand);
            });
        }

        function updateGlobalToggleState() {
            if (!toggleAllBtn || expandButtons.length === 0) return;
            const allExpanded = expandButtons.every(({ btn }) => btn.classList.contains('is-expanded'));
            toggleAllBtn.classList.toggle('all-expanded', allExpanded);
            updateGlobalToggleBtnText(allExpanded);
        }

        function updateGlobalToggleBtnText(isAllExpanded) {
            if (!toggleAllBtn) return;
            const textSpan = toggleAllBtn.querySelector('span');
            const icon = toggleAllBtn.querySelector('i');
            if (isAllExpanded) {
                if (textSpan) textSpan.textContent = isJa ? 'すべて折りたたむ' : 'Collapse all';
                if (icon) icon.className = 'fas fa-angles-up';
            } else {
                if (textSpan) textSpan.textContent = isJa ? 'すべて展開' : 'Expand all';
                if (icon) icon.className = 'fas fa-angles-down';
            }
        }
    }

    /* ==========================================================================
       5. スクロールスパイ（メインナビ ＆ 動的サブメニューの追従ハイライト）
       ========================================================================== */
    const sections = document.querySelectorAll('main section');
    const mainNavLinks = document.querySelectorAll('nav > ul > li > a');
    const pubNavLi = document.querySelector('nav ul li.has-sub');
    const subNavLinks = document.querySelectorAll('.nav-sub li a');
    const pubSubHeaders = document.querySelectorAll('#publications h3[id], #publications h4[id]');

    // メインセクションの監視
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                // メインリンクのアクティブ切替
                mainNavLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });

                // 研究業績セクションにいる時はサブメニューを展開
                if (pubNavLi) {
                    if (id === 'publications') {
                        pubNavLi.classList.add('open');
                    } else {
                        pubNavLi.classList.remove('open');
                    }
                }
            }
        });
    }, {
        root: null,
        rootMargin: '-25% 0px -45% 0px',
        threshold: 0
    });

    sections.forEach(section => sectionObserver.observe(section));

    // 研究業績内のサブ見出しのスクロール追従ハイライト
    if (subNavLinks.length > 0 && pubSubHeaders.length > 0) {
        window.addEventListener('scroll', () => {
            if (!pubNavLi || !pubNavLi.classList.contains('open')) return;

            let currentSubId = '';
            const scrollPos = window.scrollY + 180;

            pubSubHeaders.forEach(header => {
                const top = header.getBoundingClientRect().top + window.scrollY;
                if (scrollPos >= top) {
                    currentSubId = header.getAttribute('id');
                }
            });

            subNavLinks.forEach(link => {
                link.classList.toggle('sub-active', link.getAttribute('href') === `#${currentSubId}`);
            });
        }, { passive: true });
    }

    /* ==========================================================================
       6. ポートフォリオのライトボックス（画像拡大表示）
       ========================================================================== */
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('img');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        const portfolioImages = document.querySelectorAll('.portfolio-item img');

        portfolioImages.forEach(img => {
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                lightboxImg.src = img.src;

                const captionEl = img.nextElementSibling;
                if (captionEl && captionEl.classList.contains('portfolio-caption')) {
                    lightboxCaption.textContent = captionEl.textContent;
                } else {
                    lightboxCaption.textContent = '';
                }

                lightbox.classList.add('show');
            });
        });

        document.addEventListener('click', () => {
            if (lightbox.classList.contains('show')) {
                lightbox.classList.remove('show');
            }
        });

        if (lightboxImg) {
            lightboxImg.addEventListener('mouseleave', () => {
                if (lightbox.classList.contains('show')) {
                    lightbox.classList.remove('show');
                }
            });
        }
    }
});
