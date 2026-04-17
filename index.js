document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const icon = themeToggle.querySelector('i');

    // システム設定の監視
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // テーマ適用の初期化
    const currentTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
    applyTheme(currentTheme);

    // ボタンクリック時のイベント
    themeToggle.addEventListener('click', () => {
        const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // システム設定変更時の追従 (ユーザーが手動で設定していない場合のみ)
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    // 言語切り替え時の「にゅるっと」アニメーション完了を待ってから遷移
    const langSwitch = document.querySelector('.lang-switch-container');
    if (langSwitch) {
        langSwitch.addEventListener('click', (e) => {
            e.preventDefault();
            const targetUrl = langSwitch.getAttribute('href');
            const btns = langSwitch.querySelectorAll('.lang-switch-btn');
            
            // アニメーション用のクラス切り替え
            if (langSwitch.classList.contains('lang-jp')) {
                langSwitch.classList.replace('lang-jp', 'lang-en');
            } else {
                langSwitch.classList.replace('lang-en', 'lang-jp');
            }
            
            // アクティブ表示の文字色も即座に切り替え
            btns.forEach(btn => btn.classList.toggle('active'));
            
            // 遷移を少し遅らせてアニメーションを見せる
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 350); 
        });
    }
});
