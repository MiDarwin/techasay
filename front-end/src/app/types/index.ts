export interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
  }
  
  export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'assigned' | 'completed' | 'returned' | 'approved';
    task_type: 'general_task' | 'branch_visit';
    assigner_id: number;
    assignee_id: number;
    branch_id?: number;
    created_at: string;
    completed_at?: string;
  }