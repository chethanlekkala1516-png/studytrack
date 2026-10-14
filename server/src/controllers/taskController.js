const { db } = require('../config/db');

// GET /api/tasks
// Supports: search, subject, status, priority, date, sortBy, sortOrder, page, limit
function getTasks(req, res) {
  try {
    const userId = req.user.id;
    const {
      search,
      subject,
      status,
      priority,
      date,
      sortBy = 'due_date',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (search && search.trim()) {
      query += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(notes) LIKE ?)';
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (subject && subject !== 'All') {
      query += ' AND LOWER(subject) = ?';
      params.push(subject.trim().toLowerCase());
    }

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority && priority !== 'All') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (date) {
      // Matches tasks due on a specific YYYY-MM-DD
      query += ' AND due_date LIKE ?';
      params.push(`${date}%`);
    }

    // Allowed sort columns
    const allowedSortCols = {
      due_date: 'due_date',
      priority: `CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END`,
      created_at: 'created_at',
      title: 'title',
      status: 'status'
    };

    const orderCol = allowedSortCols[sortBy] || 'due_date';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Count total matching
    const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
    const countRow = db.prepare(countQuery).get(...params);
    const total = countRow ? countRow.total : 0;

    // Apply sorting and pagination
    query += ` ORDER BY ${orderCol} ${direction}`;

    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (parsedPage - 1) * parsedLimit;

    query += ' LIMIT ? OFFSET ?';
    params.push(parsedLimit, offset);

    const tasks = db.prepare(query).all(...params);

    // Compute upcoming / overdue helpers for each task
    const now = new Date();
    const tasksWithFlags = tasks.map(t => {
      let isOverdue = false;
      let isDueSoon = false;

      if (t.due_date && t.status !== 'Completed') {
        const dueDate = new Date(t.due_date);
        const diffMs = dueDate.getTime() - now.getTime();
        if (diffMs < 0) {
          isOverdue = true;
        } else if (diffMs <= 24 * 60 * 60 * 1000) { // within next 24 hours
          isDueSoon = true;
        }
      }

      return {
        ...t,
        is_overdue: isOverdue,
        is_due_soon: isDueSoon
      };
    });

    return res.json({
      tasks: tasksWithFlags,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    });
  } catch (err) {
    console.error('getTasks error:', err);
    return res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
}

// GET /api/tasks/:id
function getTaskById(req, res) {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id, 10);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, userId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ task });
  } catch (err) {
    console.error('getTaskById error:', err);
    return res.status(500).json({ error: 'Failed to fetch task details' });
  }
}

// POST /api/tasks
function createTask(req, res) {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      subject,
      priority = 'Medium',
      status = 'Pending',
      start_date,
      due_date,
      estimated_duration = 30,
      notes
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    if (!due_date || !due_date.trim()) {
      return res.status(400).json({ error: 'Due date is required' });
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
    }

    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status must be Pending, In Progress, or Completed' });
    }

    const completedAt = status === 'Completed' ? new Date().toISOString() : null;

    const insertStmt = db.prepare(`
      INSERT INTO tasks (
        user_id, title, description, subject, priority, status,
        start_date, due_date, estimated_duration, notes, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      userId,
      title.trim(),
      description ? description.trim() : null,
      subject.trim(),
      priority,
      status,
      start_date ? start_date.trim() : null,
      due_date.trim(),
      parseInt(estimated_duration, 10) || 30,
      notes ? notes.trim() : null,
      completedAt
    );

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(result.lastInsertRowid));

    // Also auto-create a reminder if due within 24 hours
    const dueDateObj = new Date(due_date.trim());
    if (dueDateObj.getTime() - Date.now() <= 24 * 60 * 60 * 1000 && status !== 'Completed') {
      db.prepare(`
        INSERT INTO reminders (user_id, task_id, title, message, type, is_read, trigger_time)
        VALUES (?, ?, ?, ?, 'due_soon', 0, ?)
      `).run(
        userId,
        newTask.id,
        `Upcoming: ${newTask.title}`,
        `Task "${newTask.title}" for ${newTask.subject} is due soon!`,
        new Date().toISOString()
      );
    }

    return res.status(201).json({
      message: 'Task created successfully',
      task: newTask
    });
  } catch (err) {
    console.error('createTask error:', err);
    return res.status(500).json({ error: 'Failed to create task' });
  }
}

// PATCH /api/tasks/:id
function updateTask(req, res) {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id, 10);

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    const {
      title,
      description,
      subject,
      priority,
      status,
      start_date,
      due_date,
      estimated_duration,
      notes
    } = req.body;

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    if (!updatedTitle) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    const updatedSubject = subject !== undefined ? subject.trim() : existing.subject;
    if (!updatedSubject) {
      return res.status(400).json({ error: 'Subject cannot be empty' });
    }

    const updatedDueDate = due_date !== undefined ? due_date.trim() : existing.due_date;
    if (!updatedDueDate) {
      return res.status(400).json({ error: 'Due date cannot be empty' });
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    const updatedPriority = priority !== undefined ? priority : existing.priority;
    if (!validPriorities.includes(updatedPriority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    const updatedStatus = status !== undefined ? status : existing.status;
    if (!validStatuses.includes(updatedStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let completedAt = existing.completed_at;
    if (status !== undefined) {
      if (status === 'Completed' && existing.status !== 'Completed') {
        completedAt = new Date().toISOString();
      } else if (status !== 'Completed') {
        completedAt = null;
      }
    }

    const updateStmt = db.prepare(`
      UPDATE tasks SET
        title = ?,
        description = ?,
        subject = ?,
        priority = ?,
        status = ?,
        start_date = ?,
        due_date = ?,
        estimated_duration = ?,
        notes = ?,
        completed_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    updateStmt.run(
      updatedTitle,
      description !== undefined ? (description ? description.trim() : null) : existing.description,
      updatedSubject,
      updatedPriority,
      updatedStatus,
      start_date !== undefined ? (start_date ? start_date.trim() : null) : existing.start_date,
      updatedDueDate,
      estimated_duration !== undefined ? (parseInt(estimated_duration, 10) || 30) : existing.estimated_duration,
      notes !== undefined ? (notes ? notes.trim() : null) : existing.notes,
      completedAt,
      taskId,
      userId
    );

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

    return res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (err) {
    console.error('updateTask error:', err);
    return res.status(500).json({ error: 'Failed to update task' });
  }
}

// DELETE /api/tasks/:id
function deleteTask(req, res) {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id, 10);

    const existing = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(taskId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(taskId, userId);

    return res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('deleteTask error:', err);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
