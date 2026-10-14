import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { tasksApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

const SUBJECTS = [
  'All',
  'Mathematics',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Literature',
  'Economics',
  'Engineering',
  'General'
];

export default function Tasks() {
  const { addToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('due_date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim(),
        subject: selectedSubject !== 'All' ? selectedSubject : '',
        status: selectedStatus !== 'All' ? selectedStatus : '',
        priority: selectedPriority !== 'All' ? selectedPriority : '',
        sortBy,
        sortOrder,
        page,
        limit: 12
      };

      const data = await tasksApi.getTasks(params);
      setTasks(data.tasks || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      addToast('Failed to load tasks from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedSubject, selectedStatus, selectedPriority, sortBy, sortOrder, page]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchTasks();
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const handleCreateOrUpdate = async (formData) => {
    setActionLoading(true);
    try {
      if (editingTask) {
        await tasksApi.updateTask(editingTask.id, formData);
        addToast('Task updated successfully!', 'success');
      } else {
        await tasksApi.createTask(formData);
        addToast('Task created successfully!', 'success');
      }
      setIsFormOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await tasksApi.updateTask(task.id, { status: nextStatus });
      addToast(`Task marked as ${nextStatus}`, 'info');
      fetchTasks();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await tasksApi.deleteTask(deletingTask.id);
      addToast('Task deleted successfully', 'success');
      setDeletingTask(null);
      fetchTasks();
    } catch (err) {
      addToast('Failed to delete task', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header with Title and Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Study Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize, prioritize, and track all your academic assignments ({totalCount} total)
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          className="btn btn-primary px-4 py-2 text-sm flex items-center gap-2 self-start sm:self-auto shadow-md shadow-indigo-600/20"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, description, or notes..."
            className="input w-full pl-10 text-sm"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={17} />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters and Sorters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Subject Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setPage(1);
              }}
              className="input w-full text-xs py-1.5 cursor-pointer"
            >
              {SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="input w-full text-xs py-1.5 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setPage(1);
              }}
              className="input w-full text-xs py-1.5 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <div className="flex gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input flex-1 text-xs py-1.5 cursor-pointer"
              >
                <option value="due_date">Deadline</option>
                <option value="priority">Priority</option>
                <option value="created_at">Date Created</option>
                <option value="title">Title</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn btn-secondary px-2 text-xs"
                title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <BookOpen size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No tasks matched your criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or adding a new task to your planner.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedSubject('All');
              setSelectedStatus('All');
              setSelectedPriority('All');
            }}
            className="btn btn-secondary mt-4 text-xs px-4 py-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={handleToggleStatus}
              onEdit={(t) => {
                setEditingTask(t);
                setIsFormOpen(true);
              }}
              onDelete={(t) => setDeletingTask(t)}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          <span>
            Page {page} of {totalPages} ({totalCount} items)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Task Creation / Edit Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        task={editingTask}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdate}
        loading={actionLoading}
      />

      {/* Task Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        title="Delete Study Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This cannot be undone.`}
        confirmText="Delete Task"
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
}
