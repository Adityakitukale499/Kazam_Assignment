import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

interface Task {
  note: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]); 
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get<Task[]>('http://localhost:8000/fetchAllTasks'); 
      setTasks(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask) {
      alert('Search box is empty.');
      return;
    }
    try {
      await axios.post('http://localhost:8000/add', { task: newTask });
      setNewTask('');
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <i className="fa-regular fa-calendar-minus"></i> Note App
      </div>
      <div className="search-box-container">
        <input type="text" className="search-box" placeholder="New Note.." value={newTask} onChange={(e) => setNewTask(e.target.value)} />
        <button className="add-btn" onClick={handleAddTask}>
          <i className="fa-solid fa-circle-plus"></i> Add
        </button>
      </div>
      <div>
        <div className="note-header">Notes</div>
        <div className="note-container">
          {tasks.map((task, index) => (
            <div key={index} className="note">{task.note || '-'}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
