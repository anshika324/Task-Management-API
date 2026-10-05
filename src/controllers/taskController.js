const Task = require('../models/Task');

const notFound = (res) =>
  res.status(404).json({ success: false, message: 'Task not found' });

// POST /api/tasks
exports.createTask = async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    user: req.user._id, 
  });

  res.status(201).json({ success: true, task });
};


exports.getTasks = async (req, res) => {
  const { search, status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Always scoped to the logged-in user
  const filter = { user: req.user._id };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  if (search) {
    
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    count: tasks.length,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    tasks,
  });
};

// GET /api/tasks/:id
exports.getTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) return notFound(res);

  res.json({ success: true, task });
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {

  const allowed = ['title', 'description', 'status', 'priority', 'dueDate'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    updates,
    { new: true, runValidators: true }
  );
  if (!task) return notFound(res);

  res.json({ success: true, task });
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) return notFound(res);

  res.json({ success: true, message: 'Task deleted' });
};