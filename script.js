// 加载题库数据
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    window.allQuestions = data;
    renderQuestions(data);
  })
  .catch(err => {
    document.getElementById('questionList').innerHTML = '<p>❌ 加载题库失败，请检查 data.json 是否存在。</p>';
    console.error(err);
  });

function renderQuestions(questions) {
  const container = document.getElementById('questionList');
  if (questions.length === 0) {
    container.innerHTML = '<p>📭 没有匹配的题目</p>';
    return;
  }

  const html = questions.map(q => `
    <div class="question-card" data-type="${q.类型}" data-text="${q.题目}">
      <div class="question-header">
        <span>第${q.题号}题</span>
        <span class="type-tag">${q.类型}</span>
      </div>
      <div class="question-text">${q.题目}</div>
      <div class="answer">✅ 正确答案：<strong>${q.标准答案}</strong></div>
      <button class="toggle-btn">显示/隐藏答案</button>
    </div>
  `).join('');

  container.innerHTML = html;

  // 绑定按钮事件（使用事件委托）
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-btn')) {
      const card = e.target.closest('.question-card');
      card.classList.toggle('show-answer');
      e.target.textContent = card.classList.contains('show-answer') ? '隐藏答案' : '显示/隐藏答案';
    }
  });
}

// 搜索和筛选
document.getElementById('searchInput').addEventListener('input', filterQuestions);
document.getElementById('typeFilter').addEventListener('change', filterQuestions);

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