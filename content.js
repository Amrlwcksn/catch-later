// Content script untuk mengambil konten artikel dari halaman web
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getArticleContent') {
    try {
      const content = extractArticleContent();
      sendResponse(content);
    } catch (error) {
      console.error('Error extracting content:', error);
      sendResponse({ error: 'Failed to extract content' });
    }
  }
  return true; // Indicates we will send a response asynchronously
});

function extractArticleContent() {
  // Coba berbagai selector untuk menemukan konten artikel
  const selectors = [
    'article',
    '[role="main"]',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.content',
    'main',
    '.post-body',
    '.story-body',
    '.article-body',
    '.text-content',
    '.article-text',
    '.post-text'
  ];
  
  let articleElement = null;
  
  // Cari elemen artikel
  for (const selector of selectors) {
    articleElement = document.querySelector(selector);
    if (articleElement && articleElement.textContent.trim().length > 100) {
      break;
    }
  }
  
  // Jika tidak ditemukan, gunakan body sebagai fallback
  if (!articleElement) {
    articleElement = document.body;
  }
  
  // Ekstrak teks dari elemen
  const textContent = extractTextContent(articleElement);
  
  // Validasi konten
  if (!textContent || textContent.length < 50) {
    return {
      error: 'Konten artikel tidak ditemukan atau terlalu pendek'
    };
  }
  
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // Asumsi 200 kata per menit
  
  // Buat excerpt (150 karakter pertama)
  const excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
  
  return {
    content: textContent,
    excerpt: excerpt,
    wordCount: wordCount,
    readingTime: readingTime,
    extractedFrom: articleElement.tagName.toLowerCase()
  };
}

function extractTextContent(element) {
  // Clone element untuk menghindari modifikasi DOM asli
  const clone = element.cloneNode(true);
  
  // Hapus elemen yang tidak diinginkan
  const unwantedSelectors = [
    'script',
    'style',
    'nav',
    'header',
    'footer',
    '.advertisement',
    '.ads',
    '.social-share',
    '.comments',
    '.sidebar',
    '.related-posts',
    '.menu',
    '.navigation',
    '.breadcrumb',
    '.share-buttons',
    '.author-bio',
    '.tags',
    '.categories'
  ];
  
  unwantedSelectors.forEach(selector => {
    const elements = clone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });
  
  // Ambil teks dan bersihkan
  let text = clone.textContent || clone.innerText || '';
  
  // Bersihkan whitespace berlebih dan karakter khusus
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return text;
}

// Pastikan script berjalan setelah DOM loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Article Saver content script loaded');
  });
} else {
  console.log('Article Saver content script loaded');
}