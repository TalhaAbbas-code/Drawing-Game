import React, { useState } from "react";

interface Todo {
  id: number;
  task: string;
  isCompleted: boolean;
}

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTask, setEditedTask] = useState<string>("");

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTask(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (task.length === 0) {
      alert("Please enter a value!");
      return;
    }

    const todo: Todo = {
      id: Date.now(),
      task: task,
      isCompleted: false,
    };

    setTodos([todo, ...todos]);
    setTask("");
  };

  const handleChecked = (todo: Todo) => {
    setTodos((prevTodos) =>
      prevTodos.map((t) =>
        t.id === todo.id ? { ...t, isCompleted: !t.isCompleted } : t
      )
    );
  };

  const handleDelete = (id: number) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  const handleEditClick = (todo: Todo) => {
    setEditingId(todo.id);
    setEditedTask(todo.task);
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTask(event.target.value);
  };

  const handleEditSubmit = (id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, task: editedTask } : todo
      )
    );
    setEditingId(null);
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <form onSubmit={handleSubmit} className="w-[50%]">
          <input
            type="text"
            name="task"
            value={task}
            onChange={handleInput}
            className="border w-[80%] rounded-md m-10 p-2"
          />
          <button type="submit" className="bg-blue-500 border rounded-md p-2">
            Add Task
          </button>
        </form>
        <h1 className="text-3xl font-bold mb-5">Tasks List</h1>
        <ul className="w-[50%]">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`p-4 mt-3 ${todo.isCompleted ? 'bg-green-500' : 'bg-gray-300' }  flex justify-between gap-5 rounded-md cursor-pointer`}
            >
              {editingId === todo.id ? (
                <input
                  type="text"
                  value={editedTask}
                  onChange={handleEditChange}
                  onBlur={() => handleEditSubmit(todo.id)} // Save on blur
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSubmit(todo.id);
                  }}
                  className="border p-1 w-full"
                  autoFocus
                />
              ) : (
                <span onClick={() => handleEditClick(todo)}>{todo.task}</span>
              )}

              <div className="flex justify-between gap-5">
                <input
                  className="w-8"
                  type="checkbox"
                  checked={todo.isCompleted}
                  onChange={() => handleChecked(todo)}
                />
                <button onClick={() => handleDelete(todo.id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Todos;
 