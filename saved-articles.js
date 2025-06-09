document.addEventListener('DOMContentLoaded', async function() {
  const articlesGrid = document.getElementById('articlesGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const totalArticles = document.getElementById('totalArticles');
  const totalReadingTime = document.getElementById('totalReadingTime');
  const thisWeek = document.getElementById('thisWeek');
  
  let allArticles = [];
  
  // Load articles saat halaman dimuat
  await loadArticles();
  
  // Event listener pencarian
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    filterArticles(searchTerm);
  });
  
  async function loadArticles() {
    try {
      const { savedArticles = [] } = await chrome.storage.local.get(['savedArticles']);
      allArticles = savedArticles;
      
      updateStats();
      displayArticles(allArticles);
      
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  }
  
  function updateStats() {
    const total = allArticles.length;
    const totalTime = allArticles.reduce((sum, article) => sum + (article.readingTime || 0), 0);
    
    // Hitung artikel minggu ini
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekCount = allArticles.filter(article => 
      new Date(article.savedAt) > oneWeekAgo
    ).length;
    
    totalArticles.textContent = total;
    totalReadingTime.textContent = totalTime;
    thisWeek.textContent = thisWeekCount;
  }
  
  function displayArticles(articles) {
    if (articles.length === 0) {
      articlesGrid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }
    
    articlesGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    articlesGrid.innerHTML = articles.map(article => `
      <div class="article-card" data-id="${article.id}">
        <div class="article-title">${escapeHtml(article.title)}</div>
        <div class="article-excerpt">${escapeHtml(article.excerpt || 'Tidak ada preview tersedia')}</div>
        <div class="article-meta">
          <span>📅 ${formatDate(article.savedAt)}</span>
          <span>⏱️ ${article.readingTime || 0} menit</span>
        </div>
        <div class="article-actions">
          <button class="btn btn-primary" data-action="open" data-url="${escapeHtml(article.url)}">
            🔗 Buka
          </button>
          <button class="btn btn-secondary" data-action="view" data-id="${article.id}">
            👁️ Lihat
          </button>
          <button class="btn btn-danger" data-action="delete" data-id="${article.id}">
            🗑️ Hapus
          </button>
        </div>
      </div>
    `).join('');
    
    // Tambahkan event listeners untuk tombol-tombol
    addButtonEventListeners();
  }
  
  function addButtonEventListeners() {
    // Event delegation untuk semua tombol
    articlesGrid.addEventListener('click', function(e) {
      if (e.target.classList.contains('btn')) {
        const action = e.target.getAttribute('data-action');
        const articleId = e.target.getAttribute('data-id');
        const url = e.target.getAttribute('data-url');
        
        switch(action) {
          case 'open':
            openArticle(url);
            break;
          case 'view':
            viewArticle(articleId);
            break;
          case 'delete':
            deleteArticle(articleId);
            break;
        }
      }
    });
  }
  
  function filterArticles(searchTerm) {
    if (!searchTerm) {
      displayArticles(allArticles);
      return;
    }
    
    const filtered = allArticles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm))
    );
    
    displayArticles(filtered);
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hari ini';
    if (diffDays === 2) return 'Kemarin';
    if (diffDays <= 7) return `${diffDays - 1} hari lalu`;
    
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Fungsi untuk membuka artikel di tab baru
  function openArticle(url) {
    if (chrome && chrome.tabs) {
      chrome.tabs.create({ url: url });
    } else {
      // Fallback untuk halaman biasa
      window.open(url, '_blank');
    }
  }
  
  // Fungsi untuk melihat artikel dalam tampilan bersih
  function viewArticle(articleId) {
    const article = allArticles.find(a => a.id === articleId);
    if (!article) {
      alert('Artikel tidak ditemukan');
      return;
    }
    
    // Buat halaman baru untuk menampilkan artikel
    const articleWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    
    if (!articleWindow) {
      alert('Popup diblokir. Silakan izinkan popup untuk melihat artikel.');
      return;
    }
    
    articleWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(article.title)}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
          }
          .header {
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #2c3e50;
            line-height: 1.3;
          }
          .meta {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .meta a {
            color: #007bff;
            text-decoration: none;
          }
          .meta a:hover {
            text-decoration: underline;
          }
          .content {
            font-size: 16px;
            line-height: 1.8;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .back-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
          }
          .back-btn:hover {
            background: #0056b3;
          }
          .toolbar {
            position: fixed;
            top: 20px;
            left: 20px;
            display: flex;
            gap: 10px;
            z-index: 1000;
          }
          .toolbar button {
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }
          .toolbar button:hover {
            background: #218838;
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <button onclick="window.print()">🖨️ Print</button>
          <button onclick="copyToClipboard()">📋 Copy</button>
        </div>
        <button class="back-btn" onclick="window.close()">✕ Tutup</button>
        <div class="header">
          <h1 class="title">${escapeHtml(article.title)}</h1>
          <div class="meta">
            📅 Disimpan pada ${formatDate(article.savedAt)} • 
            ⏱️ ${article.readingTime || 0} menit bacaan • 
            <a href="${escapeHtml(article.url)}" target="_blank">🔗 Lihat artikel asli</a>
          </div>
        </div>
        <div class="content" id="articleContent">${escapeHtml(article.content)}</div>
        
        <script>
          function copyToClipboard() {
            const content = document.getElementById('articleContent').textContent;
            navigator.clipboard.writeText(content).then(function() {
              alert('Konten berhasil disalin ke clipboard!');
            }).catch(function(err) {
              console.error('Gagal menyalin: ', err);
              // Fallback untuk browser lama
              const textArea = document.createElement('textarea');
              textArea.value = content;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              alert('Konten berhasil disalin ke clipboard!');
            });
          }
        </script>
      </body>
      </html>
    `);
    
    articleWindow.document.close();
  }
  
  // Fungsi untuk menghapus artikel
  async function deleteArticle(articleId) {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      return;
    }
    
    try {
      const { savedArticles = [] } = await chrome.storage.local.get(['savedArticles']);
      const updatedArticles = savedArticles.filter(article => article.id !== articleId);
      
      await chrome.storage.local.set({ savedArticles: updatedArticles });
      
      // Update tampilan
      allArticles = updatedArticles;
      updateStats();
      
      // Jika sedang dalam mode pencarian, filter ulang
      const searchTerm = searchInput.value.toLowerCase();
      if (searchTerm) {
        filterArticles(searchTerm);
      } else {
        displayArticles(allArticles);
      }
      
      // Notifikasi sukses
      showNotification('Artikel berhasil dihapus!', 'success');
      
    } catch (error) {
      console.error('Error deleting article:', error);
      showNotification('Terjadi kesalahan saat menghapus artikel', 'error');
    }
  }
  
  // Fungsi menampilkan notifikasi
  function showNotification(message, type) {
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    if (type === 'success') {
      notification.style.background = '#28a745';
    } else {
      notification.style.background = '#dc3545';
    }
    
    notification.textContent = message;
    
    // CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Hapus notifikasi setelah 3 detik
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
});