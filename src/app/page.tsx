"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  Moon,
  Sun,
  ClipboardList,
  ListFilter,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";

/* ============================================
   Types & Constants
   ============================================ */

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = "all" | "active" | "completed";

const STORAGE_KEY = "todo-app-tasks";
const THEME_KEY = "todo-app-theme";

/* ============================================
   Utility Functions
   ============================================ */

/** Generate a unique ID */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

/** Load todos from localStorage */
const loadTodos = (): Todo[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/** Save todos to localStorage */
const saveTodos = (todos: Todo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

/* ============================================
   Toast Notification Component
   ============================================ */

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-emerald-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-amber-500";

  return (
    <div className="toast-notification fixed top-6 left-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg">
      <div className={`w-2 h-2 rounded-full ${type === "success" ? "bg-white" : "bg-white"}`} />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
};

/* ============================================
   Confirmation Dialog Component
   ============================================ */

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative bg-white dark:bg-[#1e1e2e] rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-bounce-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all duration-200 cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   Main Todo App Component
   ============================================ */

export default function Home() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = resolvedTheme !== undefined;
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  /* ---- Auto-focus edit input ---- */
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  /* ---- Save to localStorage whenever todos change ---- */
  useEffect(() => {
    if (mounted) {
      saveTodos(todos);
    }
  }, [todos, mounted]);

  /* ============================================
     Toast & Confirm Helpers
     ============================================ */

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({ message, type });
    },
    []
  );

  const showConfirm = useCallback(
    (title: string, message: string, confirmText: string, onConfirm: () => void) => {
      setConfirmDialog({ isOpen: true, title, message, confirmText, onConfirm });
    },
    []
  );

  /* ============================================
     Core CRUD Operations
     ============================================ */

  /** Add a new todo */
  const addTodo = useCallback(() => {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      showToast("Please enter a task name", "error");
      inputRef.current?.focus();
      return;
    }

    // Check for duplicates
    const isDuplicate = todos.some(
      (todo) => todo.text.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      showToast("This task already exists!", "info");
      return;
    }

    const newTodo: Todo = {
      id: generateId(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInputValue("");
    showToast("Task added successfully!", "success");
    inputRef.current?.focus();
  }, [inputValue, todos, showToast]);

  /** Toggle completion status */
  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  /** Actually delete a task */
  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    showToast("Task deleted", "success");
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, [showToast]);

  /** Request to delete a single task */
  const requestDeleteTodo = useCallback(
    (id: string, text: string) => {
      showConfirm(
        "Delete Task",
        `Are you sure you want to delete "${text}"? This action cannot be undone.`,
        "Delete",
        () => deleteTodo(id)
      );
    },
    [showConfirm, deleteTodo]
  );

  /** Start editing a task */
  const startEdit = useCallback((todo: Todo) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  }, []);

  /** Save edited task */
  const saveEdit = useCallback(
    (id: string) => {
      const trimmed = editValue.trim();
      if (!trimmed) {
        showToast("Task name cannot be empty", "error");
        return;
      }

      const isDuplicate = todos.some(
        (todo) =>
          todo.id !== id && todo.text.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        showToast("This task already exists!", "info");
        return;
      }

      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, text: trimmed } : todo))
      );
      setEditingId(null);
      setEditValue("");
      showToast("Task updated!", "success");
    },
    [editValue, todos, showToast]
  );

  /** Cancel editing */
  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  /** Clear all completed tasks */
  const clearCompleted = useCallback(() => {
    const completedCount = todos.filter((t) => t.completed).length;
    if (completedCount === 0) {
      showToast("No completed tasks to clear", "info");
      return;
    }

    showConfirm(
      "Clear Completed",
      `Are you sure you want to remove ${completedCount} completed task${completedCount > 1 ? "s" : ""}?`,
      "Clear All",
      () => {
        setTodos((prev) => prev.filter((todo) => !todo.completed));
        showToast(`${completedCount} task${completedCount > 1 ? "s" : ""} cleared!`, "success");
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    );
  }, [todos, showConfirm, showToast]);

  /* ============================================
     Keyboard Handlers
     ============================================ */

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        addTodo();
      }
    },
    [addTodo]
  );

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
      if (e.key === "Enter") {
        saveEdit(id);
      } else if (e.key === "Escape") {
        cancelEdit();
      }
    },
    [saveEdit, cancelEdit]
  );

  /* ============================================
     Computed Values
     ============================================ */

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  /* ============================================
     Toggle Theme
     ============================================ */

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  /* ============================================
     Render
     ============================================ */

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div className="todo-bg flex items-center justify-center min-h-screen">
        <div className="animate-pulse-glow w-12 h-12 rounded-full bg-white/20" />
      </div>
    );
  }

  return (
    <div className="todo-bg relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="blob-1" />
      <div className="blob-2" />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg animate-fade-in-scale">
          {/* ===== App Card ===== */}
          <div className="todo-glass-card rounded-3xl overflow-hidden">
            {/* ----- Header ----- */}
            <header className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <ClipboardList size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                      TaskFlow
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Organize your day
                    </p>
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className="theme-toggle w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 cursor-pointer"
                  aria-label="Toggle dark mode"
                >
                  {theme === "dark" ? (
                    <Sun size={18} className="text-amber-400" />
                  ) : (
                    <Moon size={18} className="text-gray-600" />
                  )}
                </button>
              </div>
            </header>

            {/* ----- Add Task Input ----- */}
            <div className="px-6 sm:px-8 mb-4">
              <div className="todo-input-wrapper flex items-center gap-3 bg-gray-50 dark:bg-white/5 rounded-2xl px-4 py-3 border border-gray-100 dark:border-white/10">
                <Sparkles
                  size={18}
                  className="text-violet-500 flex-shrink-0"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Add a new task..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                  maxLength={200}
                />
                <button
                  onClick={addTodo}
                  className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  aria-label="Add task"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ----- Progress Bar ----- */}
            {totalCount > 0 && (
              <div className="px-6 sm:px-8 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Progress
                  </span>
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="progress-bar h-full rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* ----- Filter Tabs ----- */}
            {totalCount > 0 && (
              <div className="px-6 sm:px-8 mb-4">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-xl p-1">
                  <button
                    onClick={() => setFilter("all")}
                    className={`filter-btn flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      filter === "all"
                        ? "active text-white shadow-md"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <span>All ({totalCount})</span>
                  </button>
                  <button
                    onClick={() => setFilter("active")}
                    className={`filter-btn flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      filter === "active"
                        ? "active text-white shadow-md"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <span>Active ({activeCount})</span>
                  </button>
                  <button
                    onClick={() => setFilter("completed")}
                    className={`filter-btn flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      filter === "completed"
                        ? "active text-white shadow-md"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <span>Done ({completedCount})</span>
                  </button>
                </div>
              </div>
            )}

            {/* ----- Task List ----- */}
            <div className="px-6 sm:px-8 pb-2">
              {filteredTodos.length === 0 ? (
                /* Empty State */
                <div className="py-12 flex flex-col items-center animate-fade-in">
                  <div className="empty-state-icon mb-4">
                    {totalCount === 0 ? (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                        <ClipboardList
                          size={36}
                          className="text-violet-400 dark:text-violet-500"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                        <ListFilter
                          size={36}
                          className="text-amber-400 dark:text-amber-500"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {totalCount === 0 ? "No tasks yet" : "No matching tasks"}
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-[200px]">
                    {totalCount === 0
                      ? "Add your first task to get started!"
                      : `No ${filter} tasks found. Try a different filter.`}
                  </p>
                </div>
              ) : (
                /* Task Items */
                <div className="todo-list max-h-[400px] overflow-y-auto space-y-2 pb-2 -mx-0.5 px-0.5">
                  {filteredTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="todo-item animate-slide-in rounded-2xl px-4 py-3 flex items-center gap-3 group"
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`todo-checkbox ${
                          todo.completed ? "checked" : ""
                        }`}
                        aria-label={
                          todo.completed ? "Mark as incomplete" : "Mark as complete"
                        }
                      >
                        {todo.completed && (
                          <Check size={12} className="text-white" />
                        )}
                      </button>

                      {/* Text / Edit Input */}
                      <div className="flex-1 min-w-0">
                        {editingId === todo.id ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                            className="edit-input text-sm font-medium"
                            maxLength={200}
                          />
                        ) : (
                          <span
                            className={`todo-text block text-sm font-medium truncate ${
                              todo.completed ? "completed" : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {todo.text}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {editingId === todo.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(todo.id)}
                              className="action-btn w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
                              aria-label="Save edit"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="action-btn w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                              aria-label="Cancel edit"
                            >
                              <X size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(todo)}
                              className="action-btn w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
                              aria-label="Edit task"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => requestDeleteTodo(todo.id, todo.text)}
                              className="action-btn w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors cursor-pointer"
                              aria-label="Delete task"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ----- Footer ----- */}
            {totalCount > 0 && (
              <footer className="px-6 sm:px-8 py-4 border-t border-gray-100 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    <span className="text-violet-600 dark:text-violet-400 font-bold">
                      {activeCount}
                    </span>{" "}
                    task{activeCount !== 1 ? "s" : ""} remaining
                  </p>
                  {completedCount > 0 && (
                    <button
                      onClick={clearCompleted}
                      className="text-xs text-red-400 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-semibold hover:underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Clear completed ({completedCount})
                    </button>
                  )}
                </div>
              </footer>
            )}
          </div>

          {/* ----- Bottom Credits ----- */}
          <p className="text-center text-xs text-white/50 dark:text-white/30 mt-6 font-medium">
            Built with care &bull; TaskFlow &copy; {new Date().getFullYear()}
          </p>
        </div>
      </main>
    </div>
  );
}
