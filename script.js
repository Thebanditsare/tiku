// HTML 转义函数
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 格式化选择题选项
function formatQuestionText(text, type) {
  if (type !== '选择') return text;
  return text
    .replace(/([。？！\)])\s*([A-D]\.)/g, '$1<br>$2')
    .replace(/([A-D]\.)/g, '<br>$1')
    .replace(/^<br>/, '');
}

// 渲染题目
function renderQuestions(questions) {
  const container = document.getElementById('questionList');
  if (questions.length === 0) {
    container.innerHTML = '<p>📭 没有匹配的题目</p>';
    return;
  }

  const html = questions.map(q => {
    const safeQuestion = escapeHtml(q.题目);
    const safeAnswer = escapeHtml(q.标准答案);
    const formattedText = formatQuestionText(safeQuestion, q.类型);

    // ✅ 关键：为每道题添加 id="q{题号}" 作为锚点
    return `
      <div class="question-card" id="q${q.题号}" data-type="${q.类型}" data-text="${escapeHtml(q.题目)}">
        <div class="question-header">
          <span>第${q.题号}题</span>
          <span class="type-tag">${q.类型}</span>
        </div>
        <div class="question-text">${formattedText}</div>
        <div class="answer">✅ 正确答案：<strong>${safeAnswer}</strong></div>
        <button class="toggle-btn">显示/隐藏答案</button>
      </div>
    `;
  }).join('');

  container.innerHTML = html;

  // 渲染后尝试跳转到锚点
  scrollToAnchor();
}

// 跳转到锚点题号
function scrollToAnchor() {
  const hash = window.location.hash;
  if (!hash) return;

  const match = hash.match(/^#(\d+)$/);
  if (!match) return;

  const qNum = match[1];
  const element = document.getElementById(`q${qNum}`);

  if (element) {
    // 平滑滚动到题目
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // ✨ 可选：高亮 1 秒
    element.style.transition = 'background-color 0.3s';
    element.style.backgroundColor = '#fff9c4';
    setTimeout(() => {
      element.style.backgroundColor = '';
    }, 1000);
  }
}

// 筛选逻辑
function filterQuestions() {
  const searchText = document.getElementById('searchInput').value.toLowerCase();
  const typeFilter = document.getElementById('typeFilter').value;

  const filtered = window.allQuestions.filter(q => {
    const matchType = typeFilter === 'all' || q.类型 === typeFilter;
    const matchText = q.题目.toLowerCase().includes(searchText) ||
                      q.题号.toString().includes(searchText);
    return matchType && matchText;
  });

  renderQuestions(filtered);
}

// 页面加载完成
document.addEventListener('DOMContentLoaded', () => {
  // 事件委托（只绑定一次）
  const container = document.getElementById('questionList');
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-btn')) {
      const card = e.target.closest('.question-card');
      card.classList.toggle('show-answer');
      e.target.textContent = card.classList.contains('show-answer') ? '隐藏答案' : '显示/隐藏答案';
    }
  });

  // 绑定搜索和筛选
  document.getElementById('searchInput').addEventListener('input', filterQuestions);
  document.getElementById('typeFilter').addEventListener('change', filterQuestions);

  // 加载数据
  fetch('data.json')
    .then(response => {
      if (!response.ok) throw new Error('无法加载 data.json');
      return response.json();
    })
    .then(data => {
      window.allQuestions = data;
      renderQuestions(data);
    })
    .catch(err => {
      console.error('加载失败:', err);
      document.getElementById('questionList').innerHTML = `
        <p style="color:red; text-align:center;">
          ❌ 题库加载失败！请确保 data.json 文件存在。
        </p>
      `;
    });
});

// 监听 hash 变化（支持手动修改 #39 后跳转）
window.addEventListener('hashchange', scrollToAnchor);