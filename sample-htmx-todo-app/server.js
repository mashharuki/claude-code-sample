const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'todos.json');

// CORSミドルウェア（Live Server等からのアクセスを許可）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, HX-Request, HX-Trigger, HX-Target, HX-Current-URL');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ミドルウェア
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// データの読み込み（ローカルストレージの代わりにJSONファイルを使用）
function loadTodos() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading todos:', error);
  }
  return [];
}

// データの保存
function saveTodos(todos) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
  } catch (error) {
    console.error('Error saving todos:', error);
  }
}

// APIのベースURL（CORS対応でフルURLを使用）
const API_BASE = `http://localhost:${PORT}`;

// 単一のTodoアイテムをHTML形式で生成
function renderTodoItem(todo) {
  const completedClass = todo.completed ? 'completed' : '';
  const checkedAttr = todo.completed ? 'checked' : '';

  return `
    <li class="todo-item ${completedClass}" id="todo-${todo.id}">
      <!-- チェックボックス: クリックで完了状態を切り替え -->
      <input
        type="checkbox"
        class="todo-checkbox"
        ${checkedAttr}
        hx-put="${API_BASE}/api/todos/${todo.id}"
        hx-target="#todo-${todo.id}"
        hx-swap="outerHTML"
        hx-vals='{"completed": ${!todo.completed}}'
      />
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <!-- 削除ボタン: クリックでタスクを削除 -->
      <button
        class="delete-btn"
        hx-delete="${API_BASE}/api/todos/${todo.id}"
        hx-target="#todo-${todo.id}"
        hx-swap="outerHTML"
        hx-confirm="Delete this task?"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </li>
  `;
}

// HTMLエスケープ（XSS対策）
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// GET /api/todos - すべてのタスクを取得
app.get('/api/todos', (req, res) => {
  const todos = loadTodos();
  const html = todos.map(renderTodoItem).join('');
  res.send(html || '<li class="empty-message">No tasks yet. Add one to get started.</li>');
});

// POST /api/todos - 新しいタスクを追加
app.post('/api/todos', (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).send('<li class="error-message">Please enter a task</li>');
  }

  const todos = loadTodos();
  const newTodo = {
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  saveTodos(todos);

  // 新しいタスクのHTMLを返す
  res.send(renderTodoItem(newTodo));
});

// PUT /api/todos/:id - タスクの状態を更新
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed, text } = req.body;

  const todos = loadTodos();
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).send('<li class="error-message">Task not found</li>');
  }

  // 更新内容を適用
  if (typeof completed !== 'undefined') {
    todos[todoIndex].completed = completed === 'true' || completed === true;
  }
  if (text) {
    todos[todoIndex].text = text.trim();
  }

  saveTodos(todos);
  res.send(renderTodoItem(todos[todoIndex]));
});

// DELETE /api/todos/:id - タスクを削除
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;

  let todos = loadTodos();
  const initialLength = todos.length;
  todos = todos.filter(t => t.id !== id);

  if (todos.length === initialLength) {
    return res.status(404).send('<li class="error-message">Task not found</li>');
  }

  saveTodos(todos);
  // 空のレスポンスを返すことで要素が削除される
  res.send('');
});

// メインページ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
