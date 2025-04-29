import React from "react";
import {
  Card,
  CardContent,
  Chip,
  Typography,
  Divider,
  Box,
  Button,
} from "@mui/material";
import { Task, User } from "@/types";

interface TaskCardProps {
  task: Task;
  users: User[];
}

export default function TaskCard({ task, users }: TaskCardProps) {
  const getAssignee = () => users.find((user) => user.id === task.assignee_id);
  const assignee = getAssignee();

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">{task.title}</Typography>
          <Chip label={task.status} />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
          {task.description}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Typography variant="caption">
          Assignee:{" "}
          {assignee ? `${assignee.name} ${assignee.surname}` : "Unknown"}
        </Typography>

        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined">
            View Details
          </Button>
          <Button size="small" variant="contained">
            Complete
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
