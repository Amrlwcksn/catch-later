document.addEventListener('DOMContentLoaded', async function() {
  const saveBtn = document.getElementById('saveBtn');
  const viewSavedBtn = document.getElementById('viewSavedBtn');
  const articleTitle = document.getElementById('articleTitle');
  const articleUrl = document.getElementById('articleUrl');
  const savedCount = document.getElementById('savedCount');
  const status = document.getElementById('status');
  
  // Mengambil informasi tab aktif
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Menampilkan informasi artikel saat ini
  articleTitle.textContent = tab.title || 'Tidak ada judul';
  articleUrl.textContent = tab.url;
  
  // Menampilkan jumlah artikel tersimpan
  updateSavedCount();
  
  // Event listener untuk tombol simpan
  saveBtn.addEventListener('click', async function() {
    try {
      // Cek URL valid untuk content script
      if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) {
        showStatus('Tidak dapat menyimpan dari halaman ini', 'error');
        return;
      }
      
      // Inject content script jika belum ada
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (injectionError) {
        console.log('Content script mungkin sudah ter-inject:', injectionError);
      }
      
      // Tunggu sebentar untuk memastikan script ter-inject
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Ambil konten artikel dari content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getArticleContent' });
      
      if (response && response.content) {
        const article = {
          id: Date.now().toString(),
          title: tab.title,
          url: tab.url,
          content: response.content,
          excerpt: response.excerpt,
          savedAt: new Date().toISOString(),
          readingTime: response.readingTime
        };
        
        // Simpan artikel ke storage
        const { savedArticles = [] } = await chrome.storage.local.get(['savedArticles']);
        
        // Cek apakah artikel sudah ada
        const existingIndex = savedArticles.findIndex(a => a.url === article.url);
        if (existingIndex !== -1) {
          savedArticles[existingIndex] = article; // Update artikel yang sudah ada
          showStatus('Artikel berhasil diperbarui!', 'success');
        } else {
          savedArticles.unshift(article); // Tambah artikel baru di awal
          showStatus('Artikel berhasil disimpan!', 'success');
        }
        
        await chrome.storage.local.set({ savedArticles });
        updateSavedCount();
        
      } else if (response && response.error) {
        showStatus(response.error, 'error');
      } else {
        showStatus('Gagal mengambil konten artikel', 'error');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      
      
      if (error.message.includes('Could not establish connection')) {
        showStatus('Gagal terhubung ke halaman. Coba refresh halaman terlebih dahulu.', 'error');
      } else if (error.message.includes('Cannot access')) {
        showStatus('Tidak dapat mengakses halaman ini', 'error');
      } else {
        showStatus('Terjadi kesalahan saat menyimpan', 'error');
      }
    }
  });
  
  // tombol lihat artikel tersimpan
  viewSavedBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('saved-articles.html') });
  });
  
  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }
  
  async function updateSavedCount() {
    const { savedArticles = [] } = await chrome.storage.local.get(['savedArticles']);
    savedCount.textContent = savedArticles.length;
  }
});