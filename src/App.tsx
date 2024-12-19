import { useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { text: "Laundry", done: true },
    { text: "Work", done: false },
    { text: "Research", done: false },
    { text: "Open Source", done: false }
  ]);
  const [newTodoText, setNewTodoText] = useState('');

  const toggleTodo = (index: number) => {
    const newTodos = [...todos];
    newTodos[index].done = !newTodos[index].done;
    setTodos(newTodos);
  };

  const addTodo = () => {
    if (newTodoText.trim()) {
      setTodos([...todos, { text: newTodoText, done: false }]);
      setNewTodoText('');
    }
  };

  return (
    <div className="todo-app">
      <div className="todo-list">
        {todos.map((todo, index) => (
          <div key={index} className="todo-item">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(index)}
            />
            <span className={todo.done ? 'done' : ''}>
              {todo.text}
            </span>
          </div>
        ))}
      </div>
      
      <div className="add-todo">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add new todo"
        />
        <button onClick={addTodo}>Add</button>
      </div>
    </div>
  );
}

export default App; 