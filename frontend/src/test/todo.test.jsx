import { expect, afterEach, describe, it, vi, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as matchers from "@testing-library/jest-dom/matchers";
import { renderHook, act } from "@testing-library/react";

import App from "../App";
import TaskForm from "../components/ui/TaskForm";
import TaskField from "../components/ui/EditableTaskField";
import Buttons from "../components/ui/Buttons";
import { useTask } from "../hooks/useTask";

expect.extend(matchers);

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe.skip("Todo App Tests", () => {
  describe("useTask Hook", () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.setItem.mockClear();
    });

    it("should initialize with empty tasks", () => {
      const { result } = renderHook(() => useTask());
      expect(result.current.tasks).toEqual([]);
    });

    it("should load tasks from localStorage on mount", () => {
      const mockTasks = [
        { id: 1, text: "Test task", completed: false },
        { id: 2, text: "Another task", completed: true },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));

      const { result } = renderHook(() => useTask());
      expect(result.current.tasks).toEqual(mockTasks);
    });

    it("should add a new task", () => {
      const { result } = renderHook(() => useTask());

      act(() => {
        result.current.addTask("New task");
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toMatchObject({
        text: "New task",
        completed: false,
      });
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should delete a task", () => {
      const { result } = renderHook(() => useTask());

      act(() => {
        result.current.addTask("Task to delete");
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.deleteTask(taskId);
      });

      expect(result.current.tasks).toHaveLength(0);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should toggle task completion", () => {
      const { result } = renderHook(() => useTask());

      act(() => {
        result.current.addTask("Toggle task");
      });

      const taskId = result.current.tasks[0].id;
      expect(result.current.tasks[0].completed).toBe(false);

      act(() => {
        result.current.toggleTask(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should clear all tasks", () => {
      const { result } = renderHook(() => useTask());

      act(() => {
        result.current.addTask("Task 1");
        result.current.addTask("Task 2");
      });

      expect(result.current.tasks).toHaveLength(2);

      act(() => {
        result.current.toggleClean();
      });

      expect(result.current.tasks).toHaveLength(0);
      expect(localStorageMock.setItem).toHaveBeenCalledWith("taskfield", "[]");
    });

    it("should filter out completed tasks", () => {
      const { result } = renderHook(() => useTask());

      act(() => {
        result.current.addTask("Task 1");
        result.current.addTask("Task 2");
      });

      const task1Id = result.current.tasks[0].id;

      act(() => {
        result.current.toggleTask(task1Id); // Complete first task
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0].completed).toBe(true);
      expect(result.current.tasks[1].completed).toBe(false);

      act(() => {
        result.current.toggleFilter();
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].text).toBe("Task 2");
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe("TaskForm Component", () => {
    it("should render input and button", () => {
      const mockAddTask = vi.fn();
      render(<TaskForm onAddTask={mockAddTask} />);

      expect(screen.getByPlaceholderText("Enter new todo")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add Task" })
      ).toBeInTheDocument();
    });

    it("should add task when form is submitted", async () => {
      const user = userEvent.setup();
      const mockAddTask = vi.fn();
      render(<TaskForm onAddTask={mockAddTask} />);

      const input = screen.getByPlaceholderText("Enter new todo");
      const button = screen.getByRole("button", { name: "Add Task" });

      await user.type(input, "New todo item");
      await user.click(button);

      expect(mockAddTask).toHaveBeenCalledWith("New todo item");
      expect(input).toHaveValue("");
    });

    it("should not add empty task", async () => {
      const user = userEvent.setup();
      const mockAddTask = vi.fn();
      render(<TaskForm onAddTask={mockAddTask} />);

      const button = screen.getByRole("button", { name: "Add Task" });
      await user.click(button);

      expect(mockAddTask).not.toHaveBeenCalled();
    });

    it("should not add task with only whitespace", async () => {
      const user = userEvent.setup();
      const mockAddTask = vi.fn();
      render(<TaskForm onAddTask={mockAddTask} />);

      const input = screen.getByPlaceholderText("Enter new todo");
      const button = screen.getByRole("button", { name: "Add Task" });

      await user.type(input, "   ");
      await user.click(button);

      expect(mockAddTask).not.toHaveBeenCalled();
    });

    it("should handle Enter key submission", async () => {
      const user = userEvent.setup();
      const mockAddTask = vi.fn();
      render(<TaskForm onAddTask={mockAddTask} />);

      const input = screen.getByPlaceholderText("Enter new todo");
      await user.type(input, "New todo{enter}");

      expect(mockAddTask).toHaveBeenCalledWith("New todo");
    });
  });

  describe("TaskField Component", () => {
    const mockTask = {
      id: 1,
      text: "Test task",
      completed: false,
    };

    it("should render task text", () => {
      const mockToggleComplete = vi.fn();
      const mockDelete = vi.fn();

      render(
        <TaskField
          task={mockTask}
          onToggleComplete={mockToggleComplete}
          onDelete={mockDelete}
        />
      );

      expect(screen.getByText("Test task")).toBeInTheDocument();
    });

    it("should show incomplete icon for uncompleted task", () => {
      const mockToggleComplete = vi.fn();
      const mockDelete = vi.fn();

      render(
        <TaskField
          task={mockTask}
          onToggleComplete={mockToggleComplete}
          onDelete={mockDelete}
        />
      );

      const incompleteIcon = screen.getByTitle("Complete task");
      expect(incompleteIcon).toBeInTheDocument();
    });

    it("should show complete icon for completed task", () => {
      const mockToggleComplete = vi.fn();
      const mockDelete = vi.fn();
      const completedTask = { ...mockTask, completed: true };

      render(
        <TaskField
          task={completedTask}
          onToggleComplete={mockToggleComplete}
          onDelete={mockDelete}
        />
      );

      const completeIcon = screen.getByTitle("Complete task");
      expect(completeIcon).toBeInTheDocument();
    });

    it("should call toggle function when status is clicked", async () => {
      const user = userEvent.setup();
      const mockToggleComplete = vi.fn();
      const mockDelete = vi.fn();

      render(
        <TaskField
          task={mockTask}
          onToggleComplete={mockToggleComplete}
          onDelete={mockDelete}
        />
      );

      const statusButton = screen.getByTitle("Complete task");
      await user.click(statusButton);

      expect(mockToggleComplete).toHaveBeenCalledWith(1);
    });

    it("should call delete function when delete button is clicked", async () => {
      const user = userEvent.setup();
      const mockToggleComplete = vi.fn();
      const mockDelete = vi.fn();

      render(
        <TaskField
          task={mockTask}
          onToggleComplete={mockToggleComplete}
          onDelete={mockDelete}
        />
      );

      const deleteButton = screen.getByTitle("Delete task");
      await user.click(deleteButton);

      expect(mockDelete).toHaveBeenCalledWith(1);
    });
  });

  describe("Buttons Component", () => {
    it("should render both buttons", () => {
      const mockCleaning = vi.fn();
      const mockFilter = vi.fn();

      render(<Buttons cleaning={mockCleaning} filterb={mockFilter} />);

      expect(screen.getByTitle("Clear the field")).toBeInTheDocument();
      expect(screen.getByTitle("Delete completed")).toBeInTheDocument();
    });

    it("should call cleaning function when clear button is clicked", async () => {
      const user = userEvent.setup();
      const mockCleaning = vi.fn();
      const mockFilter = vi.fn();

      render(<Buttons cleaning={mockCleaning} filterb={mockFilter} />);

      const clearButton = screen.getByTitle("Clear the field");
      await user.click(clearButton);

      expect(mockCleaning).toHaveBeenCalled();
    });

    it("should call filter function when filter button is clicked", async () => {
      const user = userEvent.setup();
      const mockCleaning = vi.fn();
      const mockFilter = vi.fn();

      render(<Buttons cleaning={mockCleaning} filterb={mockFilter} />);

      const filterButton = screen.getByTitle("Delete completed");
      await user.click(filterButton);

      expect(mockFilter).toHaveBeenCalled();
    });
  });

  describe("App Component", () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(null);
    });

    it("should render the app title", () => {
      render(<App />);
      expect(screen.getByText("Todo app")).toBeInTheDocument();
    });

    it("should render TaskForm", () => {
      render(<App />);
      expect(screen.getByPlaceholderText("Enter new todo")).toBeInTheDocument();
    });

    it("should not show buttons when no tasks exist", () => {
      render(<App />);
      expect(screen.queryByTitle("Clear the field")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Delete completed")).not.toBeInTheDocument();
    });

    it("should show buttons when tasks exist", () => {
      const mockTasks = [{ id: 1, text: "Test task", completed: false }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));

      render(<App />);

      expect(screen.getByTitle("Clear the field")).toBeInTheDocument();
      expect(screen.getByTitle("Delete completed")).toBeInTheDocument();
    });

    it("should render tasks from localStorage", () => {
      const mockTasks = [
        { id: 1, text: "Task 1", completed: false },
        { id: 2, text: "Task 2", completed: true },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));

      render(<App />);

      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
    });

    it("should add new task through form", async () => {
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByPlaceholderText("Enter new todo");
      const button = screen.getByRole("button", { name: "Add Task" });

      await user.type(input, "New task");
      await user.click(button);

      expect(screen.getByText("New task")).toBeInTheDocument();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should toggle task completion", async () => {
      const user = userEvent.setup();
      const mockTasks = [{ id: 1, text: "Test task", completed: false }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));

      render(<App />);

      const statusButton = screen.getByTitle("Complete task");
      await user.click(statusButton);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should delete task", async () => {
      const user = userEvent.setup();
      const mockTasks = [{ id: 1, text: "Test task", completed: false }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));

      render(<App />);

      const deleteButton = screen.getByTitle("Delete task");
      await user.click(deleteButton);

      expect(screen.queryByText("Test task")).not.toBeInTheDocument();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should clear all tasks", async () => {
      const user = userEvent.setup();
      const mockTasks = [
        { id: 1, text: "Task 1", completed: false },
        { id: 2, text: "Task 2", completed: true },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));

      render(<App />);

      const clearButton = screen.getByTitle("Clear the field");
      await user.click(clearButton);

      expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
      expect(localStorageMock.setItem).toHaveBeenCalledWith("taskfield", "[]");
    });

    it("should filter completed tasks", async () => {
      const user = userEvent.setup();
      const mockTasks = [
        { id: 1, text: "Task 1", completed: false },
        { id: 2, text: "Task 2", completed: true },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));

      render(<App />);

      const filterButton = screen.getByTitle("Delete completed");
      await user.click(filterButton);

      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});
