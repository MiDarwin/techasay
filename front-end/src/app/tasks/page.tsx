"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  CheckCircle,
  Pending,
  AssignmentReturned,
  DoneAll,
  FilterList,
} from "@mui/icons-material";
import {
  getAllUsers,
  createTask,
  updateTaskStatus,
  getTasks,
  getUserPermissions,
} from "../utils/api";

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: "assigned" | "completed" | "returned" | "approved";
  task_type: "general_task" | "branch_visit";
  assigner_id: number;
  assignee_id: number;
  branch_id?: number;
  created_at: string;
  completed_at?: string;
}

interface ApiResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    task_type: "general_task" as const,
    assignee_id: 0,
    branch_id: undefined as number | undefined,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch users and tasks in parallel
        const [usersResponse, tasksResponse] = await Promise.all([
          getUserPermissions(),
          getTasks(),
        ]);

        setUsers(usersResponse);
        setTasks(tasksResponse.data);
      } catch (error) {
        showSnackbar("Error loading data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateTask = async () => {
    try {
      const createdTask = await createTask({
        ...newTask,
        assignee_id: Number(newTask.assignee_id),
        branch_id:
          newTask.task_type === "branch_visit"
            ? Number(newTask.branch_id)
            : undefined,
      });

      setTasks([...tasks, createdTask]);
      showSnackbar("Task created successfully", "success");
      setOpenCreateDialog(false);
      setNewTask({
        title: "",
        description: "",
        task_type: "general_task",
        assignee_id: 0,
        branch_id: undefined,
      });
    } catch (error) {
      showSnackbar("Failed to create task", "error");
    }
  };

  const handleStatusUpdate = async (
    taskId: number,
    newStatus: Task["status"]
  ) => {
    try {
      const updatedTask = await updateTaskStatus(taskId, { status: newStatus });
      setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
      showSnackbar(`Task marked as ${newStatus}`, "success");
    } catch (error) {
      showSnackbar("Failed to update task status", "error");
    }
  };

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((task) => task.status === filter);

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "assigned":
        return <Pending color="info" />;
      case "completed":
        return <CheckCircle color="warning" />;
      case "returned":
        return <AssignmentReturned color="error" />;
      case "approved":
        return <DoneAll color="success" />;
      default:
        return null;
    }
  };

  const getAssigneeName = (assigneeId: number) => {
    const user = users?.find((u) => u.id === assigneeId);
    return user ? `${user.name} ${user.surname}` : "Unknown";
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ display: "flex", justifyContent: "center", py: 4 }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1">
          Task Management
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Select
            value={filter}
            onChange={(e: SelectChangeEvent) => setFilter(e.target.value)}
            startAdornment={<FilterList sx={{ mr: 1 }} />}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All Tasks</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="returned">Returned</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
          </Select>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenCreateDialog(true)}
          >
            New Task
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography gutterBottom variant="h6" component="div">
                      {task.title}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(task.status)}
                      label={task.status}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {task.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" display="block">
                    Assignee: {getAssigneeName(task.assignee_id)}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Created: {new Date(task.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  {task.status === "assigned" && (
                    <Button
                      size="small"
                      onClick={() => handleStatusUpdate(task.id, "completed")}
                    >
                      Mark Complete
                    </Button>
                  )}
                  {task.status === "completed" && (
                    <>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleStatusUpdate(task.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleStatusUpdate(task.id, "returned")}
                      >
                        Return
                      </Button>
                    </>
                  )}
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" textAlign="center" sx={{ py: 4 }}>
              No tasks found. Create your first task!
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Create Task Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
      >
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent sx={{ minWidth: 500, pt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />
          <Select
            fullWidth
            margin="normal"
            value={newTask.task_type}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                task_type: e.target.value as "general_task" | "branch_visit",
              })
            }
            sx={{ mt: 2 }}
          >
            <MenuItem value="general_task">General Task</MenuItem>
            <MenuItem value="branch_visit">Branch Visit</MenuItem>
          </Select>
          <Select
            fullWidth
            margin="normal"
            required
            value={newTask.assignee_id}
            onChange={(e) =>
              setNewTask({ ...newTask, assignee_id: Number(e.target.value) })
            }
            label="Assignee"
            sx={{ mt: 2 }}
          >
            {users?.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} {user.surname} ({user.email})
              </MenuItem>
            ))}
          </Select>
          {newTask.task_type === "branch_visit" && (
            <TextField
              margin="normal"
              fullWidth
              type="number"
              label="Branch ID"
              value={newTask.branch_id || ""}
              onChange={(e) =>
                setNewTask({ ...newTask, branch_id: Number(e.target.value) })
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTask}
            disabled={
              !newTask.title ||
              !newTask.assignee_id ||
              (newTask.task_type === "branch_visit" && !newTask.branch_id)
            }
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      />
    </Container>
  );
}
