import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus
} from 'lucide-react';
import { tasksApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import TaskFormModal from '../components/TaskFormModal';

export default function CalendarPage() {
  const { addToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [tasks, setTasks] = useState([]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = await tasksApi.getTasks({ limit: 100 });
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks for calendar:', err);
      addToast('Failed to load calendar events', 'error');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Navigation handlers
  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(d);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper date formatting
  const todayStr = new Date().toISOString().split('T')[0];

  // Map tasks by date YYYY-MM-DD
  const tasksByDate = {};
  tasks.forEach((t) => {
    if (!t.due_date) return;
    const dateKey = t.due_date.split('T')[0].split(' ')[0];
    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
    tasksByDate[dateKey].push(t);
  });

  // Generate Month Grid
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarCells = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      calendarCells.push({
        day: dayNum,
        isCurrentMonth: false,
        dateStr: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      calendarCells.push({
        day: i,
        isCurrentMonth: true,
        dateStr
      });
    }

    // Next month filler days to complete 35 or 42 cells
    const remaining = (7 - (calendarCells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      calendarCells.push({
        day: i,
        isCurrentMonth: false,
        dateStr: `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div
            key={d}
            className="p-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900"
          >
            {d}
          </div>
        ))}

        {calendarCells.map((cell, idx) => {
          const isToday = cell.dateStr === todayStr;
          const dayTasks = tasksByDate[cell.dateStr] || [];

          return (
            <div
              key={idx}
              className={`min-h-[110px] p-2 bg-white dark:bg-slate-900 transition-colors ${
                !cell.isCurrentMonth ? 'opacity-40 bg-slate-50/50 dark:bg-slate-900/50' : ''
              } ${isToday ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cell.day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-400">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </div>

              {/* Task Chips */}
              <div className="space-y-1 overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => {
                  const isCompleted = task.status === 'Completed';
                  let priorityColor = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
                  if (task.priority === 'High') {
                    priorityColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900';
                  } else if (task.priority === 'Medium') {
                    priorityColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900';
                  }

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        setIsFormOpen(true);
                      }}
                      className={`text-[11px] p-1 px-1.5 rounded truncate cursor-pointer transition-transform hover:scale-[1.02] border flex items-center gap-1 ${priorityColor} ${
                        isCompleted ? 'opacity-50 line-through' : ''
                      }`}
                      title={`${task.title} (${task.subject})`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current" />
                      <span className="truncate">{task.title}</span>
                    </div>
                  );
                })}

                {dayTasks.length > 3 && (
                  <p className="text-[10px] text-slate-400 font-medium pl-1">
                    +{dayTasks.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Generate Week View
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      weekDays.push({
        date: d,
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: dateStr === todayStr
      });
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((wd) => {
          const dayTasks = tasksByDate[wd.dateStr] || [];

          return (
            <div
              key={wd.dateStr}
              className={`card p-3 rounded-2xl bg-white dark:bg-slate-900 border ${
                wd.isToday
                  ? 'border-indigo-500 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {wd.dayName}
                </span>
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    wd.isToday ? 'bg-indigo-600 text-white' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {wd.dayNum}
                </span>
              </div>

              <div className="space-y-2 min-h-[160px]">
                {dayTasks.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic text-center pt-8">No tasks</p>
                ) : (
                  dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTask(t);
                        setIsFormOpen(true);
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-sm transition-all"
                    >
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block truncate">
                        {t.subject}
                      </span>
                      <p className={`text-xs font-medium text-slate-800 dark:text-slate-200 truncate ${
                        t.status === 'Completed' ? 'line-through text-slate-400' : ''
                      }`}>
                        {t.title}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Generate Daily Schedule View
  const renderDayView = () => {
    const curDateStr = currentDate.toISOString().split('T')[0];
    const dayTasks = tasksByDate[curDateStr] || [];

    return (
      <div className="card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Planner: {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-xs text-slate-500">{dayTasks.length} scheduled item(s)</p>
          </div>
          <button
            onClick={() => {
              setSelectedTask(null);
              setIsFormOpen(true);
            }}
            className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <Plus size={14} /> Schedule Task
          </button>
        </div>

        {dayTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            ☀️ No tasks scheduled for this day. You can take a break or add a new study goal.
          </div>
        ) : (
          <div className="space-y-3">
            {dayTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTask(t);
                  setIsFormOpen(true);
                }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                      {t.subject}
                    </span>
                    <h4 className={`text-sm font-semibold text-slate-800 dark:text-slate-100 ${
                      t.status === 'Completed' ? 'line-through text-slate-400' : ''
                    }`}>
                      {t.title}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    t.priority === 'High'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : t.priority === 'Medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {t.priority}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    {t.estimated_duration || 30} mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarIcon size={24} className="text-indigo-600" />
            Academic Calendar & Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize project deadlines, exam dates, and daily study blocks
          </p>
        </div>

        {/* View Switcher: Month / Week / Day */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold">
            {['month', 'week', 'day'].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  viewMode === m
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSelectedTask(null);
              setIsFormOpen(true);
            }}
            className="btn btn-primary px-3 py-2 text-xs flex items-center gap-1 shadow-md shadow-indigo-600/20"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Date Control Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={prevPeriod}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToToday}
            className="btn btn-secondary px-3 py-1 text-xs font-semibold"
          >
            Today
          </button>
          <button
            onClick={nextPeriod}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <h2 className="text-sm md:text-base font-bold text-slate-800 dark:text-white">
          {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
            ...(viewMode === 'day' && { day: 'numeric' })
          })}
        </h2>

        <div className="hidden sm:flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Priority
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Normal
          </span>
        </div>
      </div>

      {/* Calendar Views */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

      {/* Task Form Modal for viewing or rescheduling */}
      <TaskFormModal
        isOpen={isFormOpen}
        task={selectedTask}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={async (formData) => {
          try {
            if (selectedTask) {
              await tasksApi.updateTask(selectedTask.id, formData);
              addToast('Task rescheduled successfully!', 'success');
            } else {
              await tasksApi.createTask(formData);
              addToast('Task scheduled successfully!', 'success');
            }
            setIsFormOpen(false);
            setSelectedTask(null);
            fetchTasks();
          } catch (err) {
            addToast(err.message || 'Error updating task', 'error');
          }
        }}
      />
    </div>
  );
}
