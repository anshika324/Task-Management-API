const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const STATUSES = ['Pending', 'In Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const idRule = param('id').isMongoId().withMessage('Invalid task ID');

const createRules = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title must be at most 100 characters'),
  body('description').optional().isString().withMessage('Description must be text')
    .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters'),
  body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date (e.g. 2026-12-31)'),
];

// Same rules, but title is optional on update
const updateRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 100 }).withMessage('Title must be at most 100 characters'),
  ...createRules.slice(1),
];
const listRules = [
  query('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  query('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'dueDate', 'priority', 'status', 'title'])
    .withMessage('sortBy must be one of: createdAt, dueDate, priority, status, title'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  query('search').optional().isString().isLength({ max: 100 }).withMessage('Search must be at most 100 characters'),
];

// Every task route requires a valid JWT
router.use(protect);

router.route('/')
  .post(createRules, validate, createTask)
  .get(listRules, validate, getTasks);

router.route('/:id')
  .get(idRule, validate, getTask)
  .put(idRule, updateRules, validate, updateTask)
  .delete(idRule, validate, deleteTask);

module.exports = router;