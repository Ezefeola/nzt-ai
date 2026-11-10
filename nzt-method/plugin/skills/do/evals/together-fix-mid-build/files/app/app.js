const STORAGE_KEY = "tasks";

function loadTasks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function render(tasks) {
  const list = document.getElementById("task-list");
  list.innerHTML = "";
  for (const task of tasks) {
    const item = document.createElement("li");
    item.textContent = task.dueDate ? `${task.text} — ${formatDate(task.dueDate)}` : task.text;
    list.appendChild(item);
  }
}

document.getElementById("add-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = document.getElementById("task-text").value;
  const dueDate = document.getElementById("task-date").value || null;
  const tasks = loadTasks();
  tasks.push({ text, dueDate });
  saveTasks(tasks);
  render(tasks);
  event.target.reset();
});

render(loadTasks());
