import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  const editInputRef = useRef(null);

  useEffect(() => {
    fetch("https://todoappreact-django.onrender.com/api/list/")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }
        return res.json();
      })
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const addTask = () => {
    if (newTask.trim()) {
      fetch("https://your-backend.onrender.com/api/tasks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTask, completed: false }),
      })
      .then(res => res.json())
      .then((data) => setTasks([...tasks, data]))
      .catch((error) => console.error("Error adding task:", error));
      
      setNewTask("");
    }
  };

  const toggleComplete = (index) => {
    const task = tasks[index];
    fetch(`https://your-backend.onrender.com/api/tasks/${task.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, completed: !task.completed }),
    })
    .then(res => res.json())
    .then((updatedTask) => {
      setTasks(tasks.map((t, i) => (i === index ? updatedTask : t)));
    })
    .catch((error) => console.error("Error updating task:", error));
  };

  const deleteTask = (index) => {
    const task = tasks[index];
    fetch(`https://your-backend.onrender.com/api/tasks/${task.id}/`, {
      method: "DELETE",
    })
    .then(() => {
      setTasks(tasks.filter((_, i) => i !== index));
    })
    .catch((error) => console.error("Error deleting task:", error));
  };

  const startEditing = (index, text) => {
    setEditingTask(index);
    setEditText(text);
  };

  const saveEdit = (index) => {
    if (editText.trim()) {
      setTasks(
        tasks.map((task, i) =>
          i === index ? { ...task, text: editText } : task
        )
      );
    }
    setEditingTask(null);
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") {
      action();
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <div className="container">
      <h1>React TODO App</h1>
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="input-section">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, addTask)}
          placeholder="Add a new task..."
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div className="filter-section">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
      </div>

      <ul>
        {filteredTasks.map((task, index) => (
          <li key={index} className={task.completed ? "completed" : ""}>
            {editingTask === index ? (
              <>
                <input
                  ref={editInputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, () => saveEdit(index))}
                />
                <button onClick={() => saveEdit(index)}>Save</button>
              </>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(index)}
                />
                <span>{task.text}</span>
                <button onClick={() => startEditing(index, task.text)}>
                  Edit
                </button>
                <button onClick={() => deleteTask(index)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
