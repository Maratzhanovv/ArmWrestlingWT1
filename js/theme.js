// Apply the saved preference before painting the page.
try {
    document.documentElement.dataset.theme = localStorage.getItem('kazaly.theme') === 'light' ? 'light' : 'dark';
} catch { document.documentElement.dataset.theme = 'dark'; }
