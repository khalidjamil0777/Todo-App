let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

// Show today's date
document.getElementById("today-date").textContent =
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Add task on button click or Enter key
document.getElementById("add-btn").addEventListener("click", addTask);
document.getElementById("task-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") addTask();
});

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function fmt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return (
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) +
    " · " +
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
}

function addTask() {
  const inp = document.getElementById("task-input");
  const text = inp.value.trim();
  if (!text) return;
  tasks.unshift({
    id: Date.now(),
    text,
    done: false,
    addedAt: new Date().toISOString(),
    doneAt: null,
  });
  inp.value = "";
  save();
  render();
}

function toggleDone(id) {
  const t = tasks.find((t) => t.id === id);
  t.done = !t.done;
  t.doneAt = t.done ? new Date().toISOString() : null;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

function startEdit(id) {
  const t = tasks.find((t) => t.id === id);
  const card = document.querySelector(`[data-id="${id}"] .task-text`);
  card.innerHTML = `<input id="edit-${id}" value="${t.text}"/>`;
  const inp = document.getElementById(`edit-${id}`);
  inp.focus();
  inp.addEventListener("blur", () => saveEdit(id));
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveEdit(id);
  });
}

function saveEdit(id) {
  const inp = document.getElementById(`edit-${id}`);
  if (!inp) return;
  const val = inp.value.trim();
  if (val) {
    tasks.find((t) => t.id === id).text = val;
    save();
  }
  render();
}

function makeCard(t) {
  const div = document.createElement("div");
  div.className = "task-card" + (t.done ? " done" : "");
  div.dataset.id = t.id;

  // Checkbox
  const check = document.createElement("div");
  check.className = "task-check" + (t.done ? " checked" : "");
  check.addEventListener("click", () => toggleDone(t.id));

  // Text
  const text = document.createElement("div");
  text.className = "task-text" + (t.done ? " done-text" : "");
  text.textContent = t.text;

  // Timestamp
  const meta = document.createElement("div");
  meta.className = "task-meta";
  meta.textContent = t.done ? fmt(t.doneAt) : fmt(t.addedAt);

  // Action buttons
  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "btn-icon edit";
  editBtn.textContent = "✎";
  editBtn.title = "Edit";
  editBtn.addEventListener("click", () => startEdit(t.id));

  const delBtn = document.createElement("button");
  delBtn.className = "btn-icon del";
  delBtn.textContent = "✕";
  delBtn.title = "Delete";
  delBtn.addEventListener("click", () => deleteTask(t.id));

  actions.append(editBtn, delBtn);
  div.append(check, text, meta, actions);
  return div;
}

function render() {
  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  document.getElementById("pending-count").textContent = pending.length;
  document.getElementById("done-count").textContent = done.length;

  const pl = document.getElementById("pending-list");
  const dl = document.getElementById("done-list");
  pl.innerHTML = "";
  dl.innerHTML = "";

  if (!pending.length)
    pl.innerHTML = '<p class="empty">No pending tasks 🎉</p>';
  else pending.forEach((t) => pl.appendChild(makeCard(t)));

  if (!done.length)
    dl.innerHTML = '<p class="empty">No completed tasks yet.</p>';
  else done.forEach((t) => dl.appendChild(makeCard(t)));
}

render();
