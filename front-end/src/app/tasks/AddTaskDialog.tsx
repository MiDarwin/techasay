import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { User } from "@/types";

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: (task: any) => void;
  users: User[];
}

export default function AddTaskDialog({
  open,
  onClose,
  onTaskCreated,
  users,
}: AddTaskDialogProps) {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    assignee_id: "",
    task_type: "general_task",
  });

  const handleSubmit = () => {
    // Here you would call your API to create the task
    const newTask = {
      ...taskData,
      id: Math.random(), // Temporary ID for demo
      status: "assigned",
      created_at: new Date().toISOString(),
    };
    onTaskCreated(newTask);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          fullWidth
          label="Title"
          value={taskData.title}
          onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
        />
        <TextField
          margin="normal"
          fullWidth
          multiline
          rows={4}
          label="Description"
          value={taskData.description}
          onChange={(e) =>
            setTaskData({ ...taskData, description: e.target.value })
          }
        />
        <Select
          fullWidth
          margin="dense"
          value={taskData.task_type}
          onChange={(e) =>
            setTaskData({ ...taskData, task_type: e.target.value })
          }
        >
          <MenuItem value="general_task">General Task</MenuItem>
          <MenuItem value="branch_visit">Branch Visit</MenuItem>
        </Select>
        <Select
          fullWidth
          margin="normal"
          value={taskData.assignee_id}
          onChange={(e) =>
            setTaskData({ ...taskData, assignee_id: e.target.value })
          }
          label="Assignee"
        >
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.name} {user.surname}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!taskData.title || !taskData.assignee_id}
        >
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}
