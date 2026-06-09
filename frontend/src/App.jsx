import { useState, useEffect } from 'react'

import './App.css'

const API_URL = "http://localhost:5000/api/issues";

function App() {
  const [issues, setIssues] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee: "",
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const totalPages = Math.ceil(total/limit);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 3000);

    return () => {
      clearTimeout(timer);
    }
  }, [search])

  async function loadIssues(){
    try{
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if(statusFilter) params.append("status", statusFilter);
      if(priorityFilter) params.append("priority", priorityFilter);
      if(debouncedSearch) params.append("search", debouncedSearch);

      params.append("sortBy", sortBy);
      params.append("order", order);
      params.append("page", page);
      params.append("limit", limit);

      const response = await fetch(`${API_URL}?${params.toString()}`);

      if(!response.ok){
        throw new Error("Failed to fetch issues");
      }

      const result = await response.json();

      setIssues(result.data);
      setTotal(result.total);
    }catch(err){
      setError("Failed to fetch issues");
    }finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIssues();
  }, [statusFilter, priorityFilter, debouncedSearch, sortBy, order, page]);

  function handleInputChange(e){
    const {name, value} = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleCreateIssue(e){
    e.preventDefault();

    if(!formData.title.trim()){
      alert("Title cannot be empty");
      return;
    }

    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    setFormData({
      title: "",
      description: "",
      priority: "medium",
      assignee: "",
    });

    setPage(1);
    loadIssues();
  }

  async function handleStatusUpdate(id, newStatus){
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus}),
    });

    loadIssues();
  }

  async function handlePriorityUpdate(id, newPriority){
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priority: newPriority}),
    });

    loadIssues();
  }

  async function handleAssigneeUpdate(id, newAssignee){
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assignee: newAssignee,
      }),
    });

    loadIssues();
  }

  async function handleDeleteIssue(id){
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    loadIssues();
  }

  function handleFilterChange(setter, value){
    setter(value);
    setPage(1);
  }

  return (
    <div className='app'>
      <h1>Issue Tracker</h1>

      <form onSubmit={handleCreateIssue} className='form'>
        <input 
        name="title"
        placeholder='Title'
        value={formData.title}
        onChange={handleInputChange}
        />

        <input 
        name="description"
        placeholder='Description'
        value={formData.description}
        onChange={handleInputChange}
        />

        <select
        name="priority"
        value={formData.priority}
        onChange={handleInputChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
        name="assignee"
        placeholder="Assignee"
        value={formData.assignee}
        onChange={handleInputChange}/>

        <button type="submit">Create Issue</button>
      </form>

      <br></br>

      <div className='filters'>
        <select
        value={statusFilter}
        onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
        value={priorityFilter}
        onChange={(e) => 
          handleFilterChange(setPriorityFilter, e.target.value)
        }>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
        placeholder='Search title or description'
        value={search}
        onChange={(e) => handleFilterChange(setSearch, e.target.value)}
        />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Sort by Created At</option>
          <option value="priority">Sort by Priority</option>
        </select>

        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className='error'>{error}</p>}

      {!loading && !error && (
        <>
        <div className='issue-list'>
          {issues.map((issue) => (
            <div key={issue.id} className='issue-card'>
              <h3>{issue.title}</h3>
              <p>{issue.description}</p>
              {/* <p>Priority: {issue.priority}</p> */}
              {/* <p>Assignee: {issue.assignee}</p> */}
              <p>Created At: {new Date(issue.createdAt).toLocaleString()}</p>

              <div>
                Assignee: 
                <input
                type='text'
                defaultValue={issue.assignee}
                onBlur={(e) =>
                  handleAssigneeUpdate(issue.id, e.target.value)
                }/>
              </div>

              <label>Priority: </label>
              <select
              value={issue.priority}
              onChange={(e) =>
                handlePriorityUpdate(issue.id, e.target.value)
              }>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <br></br>

              <label>Status: </label>
              <select
              value={issue.status}
              onChange={(e) =>
                handleStatusUpdate(issue.id, e.target.value)
              }>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <button onClick={() => handleDeleteIssue(issue.id)}>Delete</button>
              
            </div>
          ))}
        </div>

        <div className='pagination'>
          <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}>Prev</button>

          <span>Page {page} of {totalPages || 1}</span>

          <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}>Next</button>
        </div>
        </>
      )}
    </div>
  );
}

export default App
