// HTML 转义函数：防止题目中的 < > & 破坏页面结构
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 格式化选择题选项（A. B. C. D. 换行）
function formatQuestionText(text, type) {
  if (type !== '选择') {
    return text; // 判断题原样返回
  }

  // 在 A. B. C. D. 前插入 <br>，但不破坏已转义的文本
  return text
    .replace(/([。？！\)])\s*([A-D]\.)/g, '$1<br>$2')
    .replace(/([A-D]\.)/g, '<br>$1')
    .replace(/^<br>/, '');
}

// 渲染题目列表
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

    return `
      <div class="question-card" data-type="${q.类型}" data-text="${escapeHtml(q.题目)}">
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

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  // 仅绑定一次事件委托（关键修复点）
  const container = document.getElementById('questionList');
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-btn')) {
      const card = e.target.closest('.question-card');
      card.classList.toggle('show-answer');
      e.target.textContent = card.classList.contains('show-answer') ? '隐藏答案' : '显示/隐藏答案';
    }
  });

  // 绑定搜索和筛选事件
  document.getElementById('searchInput').addEventListener('input', filterQuestions);
  document.getElementById('typeFilter').addEventListener('change', filterQuestions);

  // 加载题库数据
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
          ❌ 题库加载失败！请确保 data.json 文件存在且格式正确。
        </p>
      `;
    });
});