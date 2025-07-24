'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  id: number;
  title: string;
  description: string;
  author: string;
  created_at: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({ title: '', description: '', author: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch projects
  useEffect(() => {
    axios.get('http://localhost:3001/api/projects')
      .then(response => setProjects(response.data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  // Handle form input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or Update project
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`http://localhost:3001/api/projects/${editingId}`, form);
      setEditingId(null);
    } else {
      await axios.post('http://localhost:3001/api/projects', form);
    }
    setForm({ title: '', description: '', author: '' });
    const response = await axios.get('http://localhost:3001/api/projects');
    setProjects(response.data);
  };

  // Edit project
  const handleEdit = (project: Project) => {
    setForm({ title: project.title, description: project.description, author: project.author });
    setEditingId(project.id);
  };

  // Delete project
  const handleDelete = async (id: number) => {
    await axios.delete(`http://localhost:3001/api/projects/${id}`);
    setProjects(projects.filter(project => project.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600">University Project Showcase</h1>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {editingId ? 'แก้ไขโปรเจค' : 'เพิ่มโปรเจคใหม่'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              placeholder="ชื่อโปรเจค"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="คำอธิบายโปรเจค"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            />
          </div>
          <div>
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleInputChange}
              placeholder="ผู้เขียน"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
          >
            {editingId ? 'อัปเดตโปรเจค' : 'เพิ่มโปรเจค'}
          </button>
        </form>
      </div>

      {/* Project List */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">รายการโปรเจค</h2>
        <ul className="space-y-4">
          {projects.map(project => (
            <li key={project.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
              <p className="text-gray-600">{project.description}</p>
              <p className="text-gray-500"><strong>ผู้เขียน:</strong> {project.author}</p>
              <p className="text-gray-500"><strong>วันที่สร้าง:</strong> {new Date(project.created_at).toLocaleDateString()}</p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                >
                  ลบ
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}