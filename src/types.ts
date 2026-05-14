export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Done';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  employeeId?: string;
  rank?: string;
  region?: string;
  unit?: string;
  department?: string;
  staffGroup?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  assignedTo: string; // User ID
  status: TaskStatus;
  resultDetail?: string;
  imageUrl?: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface TaskGroup {
  id: string;
  title: string;
  description?: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  manager: string; // User ID
  deadline: string;
  groups: TaskGroup[];
  status: 'Active' | 'On Hold' | 'Completed';
}
