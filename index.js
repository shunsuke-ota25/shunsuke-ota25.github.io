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

    /* ==========================================================================
       7. スクロール回路シグナル光条 (Circuit Progress)
       ========================================================================== */
    const circuitProgress = document.getElementById('circuit-progress');
    if (circuitProgress) {
        const updateProgress = () => {
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
            circuitProgress.style.width = `${progress}%`;
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    /* ==========================================================================
       8. 半導体チップ・量子ドット動的アクセント (Circuit & Quantum Sparks Canvas)
       ========================================================================== */
    const canvas = document.getElementById('quantum-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        let mouse = { x: -1000, y: -1000, active: false };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        });

        window.addEventListener('mouseleave', () => {
            mouse.active = false;
        });

        // リサイズ対応
        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initCircuitElements();
        };
        window.addEventListener('resize', handleResize);

        // 回路ノードと量子ドット微粒子の生成
        let nodes = [];
        let pulses = [];
        let quantumDots = [];

        function initCircuitElements() {
            nodes = [];
            pulses = [];
            quantumDots = [];

            const nodeCount = Math.min(Math.floor((width * height) / 38000), 45);
            const dotCount = Math.min(Math.floor((width * height) / 22000), 60);

            // 回路グリッドノード
            for (let i = 0; i < nodeCount; i++) {
                nodes.push({
                    x: Math.round(Math.random() * width / 40) * 40,
                    y: Math.round(Math.random() * height / 40) * 40,
                    baseAlpha: 0.15 + Math.random() * 0.25,
                    radius: 2 + Math.random() * 2
                });
            }

            // 量子ドット（微小粒子）
            for (let i = 0; i < dotCount; i++) {
                quantumDots.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    size: 1 + Math.random() * 2.2,
                    alpha: 0.2 + Math.random() * 0.6,
                    pulseSpeed: 0.02 + Math.random() * 0.03,
                    colorType: Math.random() > 0.4 ? 'cyan' : (Math.random() > 0.5 ? 'emerald' : 'purple')
                });
            }

            // シグナルパルス（導線上を走る光条）
            for (let i = 0; i < 6; i++) {
                createPulse();
            }
        }

        function createPulse() {
            if (nodes.length < 2) return;
            const from = nodes[Math.floor(Math.random() * nodes.length)];
            // 最も近いまたはグリッド上で揃っている相手を探す
            const candidates = nodes.filter(n => n !== from && (Math.abs(n.x - from.x) < 260 || Math.abs(n.y - from.y) < 260));
            const to = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : nodes[Math.floor(Math.random() * nodes.length)];

            pulses.push({
                x1: from.x,
                y1: from.y,
                // 直角（L字）配線の中継点
                midX: Math.random() > 0.5 ? to.x : from.x,
                midY: Math.random() > 0.5 ? from.y : to.y,
                x2: to.x,
                y2: to.y,
                t: 0,
                speed: 0.007 + Math.random() * 0.012,
                colorType: Math.random() > 0.3 ? 'cyan' : 'emerald'
            });
        }

        initCircuitElements();

        let animId;
        function render() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            ctx.clearRect(0, 0, width, height);

            // カラーパレット定義（chip.png に基づくネオンシアン / エメラルド / パープル）
            const colors = isDark ? {
                line: 'rgba(0, 229, 255, 0.08)',
                lineActive: 'rgba(0, 229, 255, 0.35)',
                node: 'rgba(0, 240, 255, 0.6)',
                cyan: 'rgba(0, 229, 255, ',
                emerald: 'rgba(16, 185, 129, ',
                purple: 'rgba(168, 85, 247, '
            } : {
                line: 'rgba(2, 132, 199, 0.07)',
                lineActive: 'rgba(2, 132, 199, 0.25)',
                node: 'rgba(2, 132, 199, 0.45)',
                cyan: 'rgba(2, 132, 199, ',
                emerald: 'rgba(13, 148, 136, ',
                purple: 'rgba(126, 34, 206, '
            };

            // 1. 直角回路トレースの描画
            for (let i = 0; i < nodes.length; i++) {
                const n1 = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const n2 = nodes[j];
                    const dx = Math.abs(n1.x - n2.x);
                    const dy = Math.abs(n1.y - n2.y);
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 180) {
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        // 回路基板特有の直角配線（Manhattan routing）
                        ctx.lineTo(n2.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);

                        // マウス周辺は明るく
                        const distToMouse = Math.hypot((n1.x + n2.x) / 2 - mouse.x, (n1.y + n2.y) / 2 - mouse.y);
                        if (mouse.active && distToMouse < 160) {
                            ctx.strokeStyle = colors.lineActive;
                            ctx.lineWidth = 1.2;
                        } else {
                            ctx.strokeStyle = colors.line;
                            ctx.lineWidth = 0.8;
                        }
                        ctx.stroke();
                    }
                }

                // ノード（ビア / 端子）の描画
                ctx.beginPath();
                ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
                ctx.fillStyle = colors.node;
                ctx.fill();
            }

            // 2. 回路導線上を走る光パルス
            for (let p = pulses.length - 1; p >= 0; p--) {
                const pulse = pulses[p];
                pulse.t += pulse.speed;

                if (pulse.t >= 1) {
                    pulses.splice(p, 1);
                    createPulse();
                    continue;
                }

                // L字ルートに沿った現在位置の補間計算
                let curX, curY;
                if (pulse.t < 0.5) {
                    const localT = pulse.t * 2;
                    curX = pulse.x1 + (pulse.midX - pulse.x1) * localT;
                    curY = pulse.y1 + (pulse.midY - pulse.y1) * localT;
                } else {
                    const localT = (pulse.t - 0.5) * 2;
                    curX = pulse.midX + (pulse.x2 - pulse.midX) * localT;
                    curY = pulse.midY + (pulse.y2 - pulse.midY) * localT;
                }

                const alpha = Math.sin(pulse.t * Math.PI) * (isDark ? 0.9 : 0.7);
                const colPrefix = pulse.colorType === 'cyan' ? colors.cyan : colors.emerald;

                // 光条グロー
                ctx.beginPath();
                ctx.arc(curX, curY, 3, 0, Math.PI * 2);
                ctx.fillStyle = `${colPrefix}${alpha})`;
                ctx.shadowBlur = isDark ? 12 : 6;
                ctx.shadowColor = colPrefix + '0.8)';
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // 3. 量子ドット・微粒子の描画（チップのきらめき）
            for (let i = 0; i < quantumDots.length; i++) {
                const dot = quantumDots[i];
                dot.x += dot.vx;
                dot.y += dot.vy;

                if (dot.x < 0) dot.x = width;
                if (dot.x > width) dot.x = 0;
                if (dot.y < 0) dot.y = height;
                if (dot.y > height) dot.y = 0;

                dot.alpha += dot.pulseSpeed;
                const currentAlpha = 0.2 + (Math.sin(dot.alpha) + 1) * 0.35;

                const colPrefix = dot.colorType === 'cyan' ? colors.cyan : (dot.colorType === 'emerald' ? colors.emerald : colors.purple);

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                ctx.fillStyle = `${colPrefix}${currentAlpha * (isDark ? 0.85 : 0.6)})`;
                ctx.fill();
            }

            animId = requestAnimationFrame(render);
        }

        // Reduced Motionの考慮
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!prefersReduced.matches) {
            animId = requestAnimationFrame(render);
        }

        // タブ非アクティブ時の省電力制御
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animId);
            } else if (!prefersReduced.matches) {
                animId = requestAnimationFrame(render);
            }
        });
    }
});
