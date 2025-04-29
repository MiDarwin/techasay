import React from "react";
import { Grid, CircularProgress, Button } from "@mui/material";
import TaskCard from "./TaskCard";
import { Task, User } from "@/types";

interface TaskListProps {
  tasks: Task[];
  users: User[];
  loading: boolean;
  onRefresh: () => void;
}

export default function TaskList({
  tasks,
  users,
  loading,
  onRefresh,
}: TaskListProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Button variant="outlined" onClick={onRefresh} sx={{ mb: 2 }}>
        Refresh Tasks
      </Button>

      <Grid container spacing={3}>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <TaskCard task={task} users={users} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" textAlign="center" sx={{ py: 4 }}>
              No tasks found
            </Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
}
