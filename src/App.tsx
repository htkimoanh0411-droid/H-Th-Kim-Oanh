/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  Settings, 
  Plus, 
  Calendar,
  ChevronRight,
  Clock,
  MoreVertical,
  Search,
  Filter,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  Target,
  Image as ImageIcon,
  Upload,
  ExternalLink,
  Layout,
  Pencil
} from 'lucide-react';
import { Project, Task, User, TaskGroup } from './types';
import { mockProjects, mockUsers } from './mockData';

export default function App() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  React.useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, userRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/users')
        ]);
        
        if (projRes.ok && userRes.ok) {
          const projs = await projRes.json();
          const usrs = await userRes.json();
          setProjects(projs);
          setUsers(usrs);

          // Get current user from localStorage fallback
          const savedId = localStorage.getItem('protask_current_user_id');
          if (savedId) {
            const found = usrs.find((u: User) => u.id === savedId);
            if (found) setCurrentUser(found);
          } else {
            setCurrentUser(usrs[0]);
          }
        }
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Save data to server when state changes
  React.useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users)
      }).catch(console.error);
    }, 500);
    return () => clearTimeout(timer);
  }, [users, isLoading]);

  React.useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projects)
      }).catch(console.error);
    }, 500);
    return () => clearTimeout(timer);
  }, [projects, isLoading]);

  React.useEffect(() => {
    localStorage.setItem('protask_current_user_id', currentUser.id);
  }, [currentUser]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'personnel'>('dashboard');
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState<{ projectId: string, groupId: string } | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState<string | null>(null); // projectId
  const [editingGroup, setEditingGroup] = useState<{ projectId: string, groupId: string, title: string } | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Create Group State
  const [newGroupName, setNewGroupName] = useState('');

  // Create Project Form State
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    deadline: '',
    manager: currentUser.id
  });

  // Create Task Form State
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    deadline: '',
    priority: 'Medium',
    assignedTo: '',
    status: 'Todo'
  });

  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberResults, setShowMemberResults] = useState(false);

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.deadline || !showCreateTask) {
      alert('Vui lòng điền đầy đủ thông tin công việc và chọn người phụ trách');
      return;
    }

    const task: Task = {
      id: `t${Date.now()}`,
      title: newTask.title!,
      description: newTask.description || '',
      deadline: newTask.deadline!,
      assignedTo: newTask.assignedTo!,
      priority: newTask.priority as 'Low' | 'Medium' | 'High',
      status: 'Todo',
      resultDetail: '',
      imageUrl: ''
    };

    const updatedProjects = projects.map(p => {
      if (p.id === showCreateTask.projectId) {
        return {
          ...p,
          groups: p.groups.map(g => {
            if (g.id === showCreateTask.groupId) {
              return { ...g, tasks: [...g.tasks, task] };
            }
            return g;
          })
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setShowCreateTask(null);
    setNewTask({
      title: '',
      description: '',
      deadline: '',
      priority: 'Medium',
      assignedTo: '',
      status: 'Todo'
    });
    setMemberSearch('');
  };

  const filteredUsers = memberSearch 
    ? users.filter(u => 
        u.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
        (u.employeeId && u.employeeId.includes(memberSearch))
      )
    : [];

  // Create User Form State
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    role: '',
    employeeId: '',
    rank: '',
    region: 'SHE',
    unit: '',
    department: '',
    staffGroup: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now()
  });

  // State for updating task results in modal
  const [editResult, setEditResult] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editStatus, setEditStatus] = useState<Task['status']>('Todo');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.deadline) {
      alert('Vui lòng nhập tên dự án và deadline');
      return;
    }
    const project: Project = {
      id: `p${Date.now()}`,
      name: newProject.name,
      description: newProject.description,
      deadline: newProject.deadline,
      manager: newProject.manager,
      status: 'Active',
      groups: []
    };
    setProjects([project, ...projects]);
    setShowCreateProject(false);
    setNewProject({ name: '', description: '', deadline: '', manager: currentUser.id });
  };

  const handleUpdateProject = () => {
    if (!editingProject || !editingProject.name || !editingProject.deadline) {
      alert('Vui lòng nhập tên dự án và deadline');
      return;
    }

    const updatedProjects = projects.map(p => {
      if (p.id === editingProject.id) {
        return editingProject;
      }
      return p;
    });

    setProjects(updatedProjects);
    setEditingProject(null);
  };

  const handleCreateGroup = () => {
    if (!newGroupName || !showCreateGroup) {
      alert('Vui lòng nhập tên giai đoạn');
      return;
    }

    const updatedProjects = projects.map(p => {
      if (p.id === showCreateGroup) {
        return {
          ...p,
          groups: [
            ...p.groups,
            {
              id: `g${Date.now()}`,
              title: newGroupName,
              tasks: []
            }
          ]
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setShowCreateGroup(null);
    setNewGroupName('');
  };

  const handleUpdateGroup = () => {
    if (!editingGroup || !editingGroup.title) {
      alert('Vui lòng nhập tên giai đoạn');
      return;
    }

    const updatedProjects = projects.map(p => {
      if (p.id === editingGroup.projectId) {
        return {
          ...p,
          groups: p.groups.map(g => {
            if (g.id === editingGroup.groupId) {
              return { ...g, title: editingGroup.title };
            }
            return g;
          })
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setEditingGroup(null);
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.role || !newUser.employeeId) {
      alert('Vui lòng nhập đầy đủ Mã nhân viên, Họ tên và Chức danh');
      return;
    }
    const user: User = {
      id: `u${Date.now()}`,
      name: newUser.name!,
      role: newUser.role!,
      avatar: newUser.avatar!,
      employeeId: newUser.employeeId,
      rank: newUser.rank,
      region: newUser.region,
      unit: newUser.unit,
      department: newUser.department,
      staffGroup: newUser.staffGroup
    };
    setUsers([...users, user]);
    setShowCreateUser(false);
    setNewUser({
      name: '',
      role: '',
      employeeId: '',
      rank: '',
      region: 'SHE',
      unit: '',
      department: '',
      staffGroup: '',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now()
    });
    alert('Thêm nhân sự mới thành công!');
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa dự án này? Toàn bộ dữ liệu công việc sẽ bị mất.')) {
      setProjects(projects.filter(p => p.id !== id));
      if (selectedProjectId === id) setSelectedProjectId(null);
    }
  };

  const handleDeleteUser = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (users.length <= 1) {
      alert('Không thể xóa nhân sự cuối cùng của hệ thống!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa nhân sự này khỏi hệ thống?')) {
      const remainingUsers = users.filter(u => u.id !== id);
      setUsers(remainingUsers);
      if (currentUser.id === id) {
        setCurrentUser(remainingUsers[0]);
      }
    }
  };

  const handleDeleteGroup = (projectId: string, groupId: string) => {
    if (confirm('Xóa giai đoạn này sẽ xóa toàn bộ công việc đi kèm. Bạn có chắc không?')) {
      const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            groups: p.groups.filter(g => g.id !== groupId)
          };
        }
        return p;
      });
      setProjects(updatedProjects);
    }
  };

  const handleUpdateResult = () => {
    if (!viewingTask || !selectedProjectId) return;

    const updatedProjects = projects.map(p => {
      if (p.id === selectedProjectId) {
        return {
          ...p,
          groups: p.groups.map(g => ({
            ...g,
            tasks: g.tasks.map(t => {
              if (t.id === viewingTask.id) {
                const newTask: Task = { 
                  ...t, 
                  assignedTo: viewingTask.assignedTo,
                  resultDetail: editResult, 
                  imageUrl: editImage,
                  status: editStatus
                };
                setViewingTask(newTask);
                return newTask;
              }
              return t;
            })
          }))
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    alert('Đã cập nhật trạng thái và kết quả công việc!');
  };

  const isManager = selectedProject?.manager === currentUser.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">Đang tải dữ liệu hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Create Task Modal */}
      {showCreateTask && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setShowCreateTask(null); setShowMemberResults(false); setMemberSearch(''); }}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 overflow-y-auto">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <CheckSquare className="text-indigo-600" />
                Tạo công việc mới
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tên công việc</label>
                  <input 
                    type="text" 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="VD: Thiết kế giao diện Dashboard..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mô tả chi tiết</label>
                  <textarea 
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Nội dung cần thực hiện..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hạn hoàn thành</label>
                    <input 
                      type="date" 
                      value={newTask.deadline}
                      onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Độ ưu tiên</label>
                    <select 
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Low">Thấp</option>
                      <option value="Medium">Trung bình</option>
                      <option value="High">Cao</option>
                    </select>
                  </div>
                </div>

                {/* Searchable Member Selection */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 tracking-wider">Người phụ trách</label>
                  
                  {newTask.assignedTo ? (
                    <div className="flex items-center gap-4 bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
                      <img 
                        src={users.find(u => u.id === newTask.assignedTo)?.avatar} 
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
                        alt="Assignee" 
                      />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-black text-slate-800 truncate">{users.find(u => u.id === newTask.assignedTo)?.name}</p>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase">{users.find(u => u.id === newTask.assignedTo)?.role} • {users.find(u => u.id === newTask.assignedTo)?.employeeId}</p>
                      </div>
                      <button 
                        onClick={() => { setNewTask({...newTask, assignedTo: ''}); setMemberSearch(''); }}
                        className="p-1 hover:bg-indigo-100 rounded-lg text-indigo-400 transition-colors"
                      >
                        <Plus size={18} className="rotate-45" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        value={memberSearch}
                        onChange={(e) => { 
                          setMemberSearch(e.target.value); 
                          setShowMemberResults(true); 
                        }}
                        placeholder="Tìm theo tên hoặc mã nhân viên..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      
                      <AnimatePresence>
                        {showMemberResults && filteredUsers.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar"
                          >
                            {filteredUsers.map(user => (
                              <div 
                                key={user.id}
                                onClick={() => {
                                  setNewTask({...newTask, assignedTo: user.id});
                                  setShowMemberResults(false);
                                  setMemberSearch('');
                                }}
                                className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                              >
                                <img src={user.avatar} className="w-8 h-8 rounded-full shadow-sm" alt={user.name} />
                                <div className="flex-1 overflow-hidden">
                                  <p className="text-xs font-black text-slate-800 truncate">{user.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{user.employeeId} • {user.role}</p>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => { setShowCreateTask(null); setShowMemberResults(false); setMemberSearch(''); }}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateTask}
                className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Tạo công việc
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Create Group Modal */}
      {showCreateGroup && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateGroup(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Layout className="text-indigo-600" />
                Thêm giai đoạn mới
              </h2>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tên giai đoạn</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="VD: Giai đoạn 1: Khởi tạo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateGroup(null)}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateGroup}
                className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Thêm giai đoạn
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Group Modal */}
      {editingGroup && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setEditingGroup(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Layout className="text-indigo-600" />
                Chỉnh sửa giai đoạn
              </h2>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tên giai đoạn</label>
                <input 
                  type="text" 
                  value={editingGroup.title}
                  onChange={e => setEditingGroup({...editingGroup, title: e.target.value})}
                  placeholder="VD: Giai đoạn 1: Khởi tạo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setEditingGroup(null)}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleUpdateGroup}
                className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Create User Modal */}
      {showCreateUser && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateUser(false)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Users className="text-indigo-600" />
                Thêm nhân sự mới
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mã nhân viên</label>
                    <input 
                      type="text" 
                      value={newUser.employeeId}
                      onChange={e => setNewUser({...newUser, employeeId: e.target.value})}
                      placeholder="005703"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Họ và tên</label>
                    <input 
                      type="text" 
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      placeholder="Hồ Thị Kim Oanh"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Chức danh</label>
                    <input 
                      type="text" 
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                      placeholder="Chuyên viên chính"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cấp bậc</label>
                    <input 
                      type="text" 
                      value={newUser.rank}
                      onChange={e => setNewUser({...newUser, rank: e.target.value})}
                      placeholder="3C"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Vùng/Khối/Ban</label>
                  <input 
                    type="text" 
                    value={newUser.region}
                    onChange={e => setNewUser({...newUser, region: e.target.value})}
                    placeholder="SHE"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Đơn vị</label>
                  <input 
                    type="text" 
                    value={newUser.unit}
                    onChange={e => setNewUser({...newUser, unit: e.target.value})}
                    placeholder="Công ty Cổ phần Dịch vụ Cáp treo Bà Nà"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Phòng bộ phận</label>
                  <input 
                    type="text" 
                    value={newUser.department}
                    onChange={e => setNewUser({...newUser, department: e.target.value})}
                    placeholder="Phòng kế toán"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nhóm CBNV</label>
                  <input 
                    type="text" 
                    value={newUser.staffGroup}
                    onChange={e => setNewUser({...newUser, staffGroup: e.target.value})}
                    placeholder="Khối sản xuất"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateUser(false)}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateUser}
                className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Thêm nhân sự
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Create Project Modal */}
      {showCreateProject && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateProject(false)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Briefcase className="text-indigo-600" />
                Tạo dự án mới
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tên dự án</label>
                  <input 
                    type="text" 
                    value={newProject.name}
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                    placeholder="VD: Phát triển Website Công ty..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mô tả ngắn</label>
                  <textarea 
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Mục tiêu và phạm vi dự án..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hạn hoàn thành</label>
                    <input 
                      type="date" 
                      value={newProject.deadline}
                      onChange={e => setNewProject({...newProject, deadline: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Người quản lý</label>
                    <select 
                      value={newProject.manager}
                      onChange={e => setNewProject({...newProject, manager: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateProject(false)}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateProject}
                className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Khởi tạo dự án
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Project Modal */}
      {editingProject && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setEditingProject(null)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Briefcase className="text-indigo-600" />
                Chỉnh sửa dự án
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tên dự án</label>
                  <input 
                    type="text" 
                    value={editingProject.name}
                    onChange={e => setEditingProject({...editingProject, name: e.target.value})}
                    placeholder="VD: Phát triển Website Công ty..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mô tả ngắn</label>
                  <textarea 
                    value={editingProject.description}
                    onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                    placeholder="Mục tiêu và phạm vi dự án..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hạn hoàn thành</label>
                    <input 
                      type="date" 
                      value={editingProject.deadline}
                      onChange={e => setEditingProject({...editingProject, deadline: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Người quản lý</label>
                    <select 
                      value={editingProject.manager}
                      onChange={e => setEditingProject({...editingProject, manager: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setEditingProject(null)}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleUpdateProject}
                className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Cập nhật dự án
              </button>
            </div>
          </div>
        </div>
      )}
        {viewingTask && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setViewingTask(null); setEditResult(''); setEditImage(''); }}
          >
            <div 
              className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2 inline-block">
                      {viewingTask.status}
                    </span>
                    <h2 className="text-2xl font-black text-slate-800 leading-tight">{viewingTask.title}</h2>
                  </div>
                  <button onClick={() => { setViewingTask(null); setEditResult(''); setEditImage(''); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <Plus size={24} className="rotate-45 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <DetailItem icon={<Calendar size={18} />} label="Hạn hoàn thành" value={viewingTask.deadline} />
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-13">Người phụ trách</label>
                      {isManager ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-xl">
                            <UserIcon size={18} className="text-slate-400" />
                          </div>
                          <select 
                            value={viewingTask.assignedTo}
                            onChange={(e) => {
                              const updatedTask = { ...viewingTask, assignedTo: e.target.value };
                              setViewingTask(updatedTask);
                            }}
                            className="text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer border-b border-transparent hover:border-indigo-300"
                          >
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.employeeId})</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <DetailItem 
                          icon={<UserIcon size={18} />} 
                          label="Người phụ trách" 
                          value={users.find(u => u.id === viewingTask.assignedTo)?.name || 'N/A'} 
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <DetailItem 
                      icon={<Clock size={18} />} 
                      label="Mức độ ưu tiên" 
                      value={viewingTask.priority} 
                      color={viewingTask.priority === 'High' ? 'text-rose-500' : viewingTask.priority === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}
                    />
                    <DetailItem icon={<Briefcase size={18} />} label="Dự án" value={selectedProject?.name || 'N/A'} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả công việc</h3>
                    <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {viewingTask.description}
                    </p>
                  </div>

                  {/* UPDATE FORM for current user assigned or manager */}
                  {(viewingTask.assignedTo === currentUser.id || isManager) && (
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Upload size={16} className="text-indigo-600" />
                        Cập nhật tiến độ & kết quả
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Trạng thái công việc</label>
                          <select 
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="Todo">Chưa thực hiện</option>
                            <option value="In Progress">Đang thực hiện</option>
                            <option value="Review">Đang kiểm tra</option>
                            <option value="Done">Đã hoàn thành</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Báo cáo chi tiết</label>
                          <textarea 
                            value={editResult}
                            onChange={(e) => setEditResult(e.target.value)}
                            placeholder="Nhập chi tiết công việc đã thực hiện..."
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">URL Hình ảnh (Nếu có)</label>
                          <input 
                            type="text"
                            value={editImage}
                            onChange={(e) => setEditImage(e.target.value)}
                            placeholder="Dán link ảnh tại đây..."
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* READ ONLY RESULTS (If not the one assigned or if just showing the current result) */}
                  {!(viewingTask.assignedTo === currentUser.id || isManager) && (
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Kết quả & Hình ảnh</h3>
                      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 min-h-[100px] mb-4">
                        {viewingTask.resultDetail ? (
                          <p className="text-indigo-900 text-sm italic">"{viewingTask.resultDetail}"</p>
                        ) : (
                          <p className="text-slate-400 text-sm italic">Chưa có kết quả báo cáo...</p>
                        )}
                      </div>
                      {viewingTask.imageUrl && (
                        <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200">
                          <img src={viewingTask.imageUrl} alt="Result" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {(viewingTask.assignedTo === currentUser.id || isManager) && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    onClick={() => { setViewingTask(null); setEditResult(''); setEditImage(''); }}
                    className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Đóng
                  </button>
                  <button 
                    onClick={handleUpdateResult}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Lưu kết quả
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-600">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <CheckSquare size={20} strokeWidth={2.5} />
            </div>
            <span>ProTask</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Tổng quan" 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setSelectedProjectId(null); }} 
          />
          <SidebarItem 
            icon={<Briefcase size={20} />} 
            label="Dự án" 
            active={activeTab === 'projects' || !!selectedProjectId} 
            onClick={() => setActiveTab('projects')} 
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="Nhân sự" 
            active={activeTab === 'personnel'}
            onClick={() => { setActiveTab('personnel'); setSelectedProjectId(null); }} 
          />
          <SidebarItem icon={<Settings size={20} />} label="Cài đặt" />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100">
          <div className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-2">Người dùng hiện tại</div>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 mb-2">
            <img src={currentUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-indigo-200" />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-indigo-600 font-bold uppercase">{currentUser.role}</p>
            </div>
          </div>
          
          <select 
            value={currentUser.id}
            onChange={(e) => {
              const u = users.find(user => user.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
            className="w-full bg-white border border-slate-200 text-[10px] font-bold p-2 rounded-lg outline-none cursor-pointer hover:border-indigo-300"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>Đổi vai: {u.name}</option>
            ))}
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-800">
              {selectedProject ? selectedProject.name : activeTab === 'dashboard' ? 'Tổng quan' : activeTab === 'personnel' ? 'Thông tin người dùng' : 'Tất cả Dự án'}
            </h1>
            {selectedProject && (
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded">
                {selectedProject.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm công việc..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              />
            </div>
            
            {(activeTab === 'personnel' || activeTab === 'dashboard' || activeTab === 'projects' || (selectedProject && isManager)) && (
              <div className="flex gap-3">
                {selectedProject && isManager && (
                  <>
                    <button 
                      onClick={() => setEditingProject(selectedProject)}
                      className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Pencil size={16} />
                      Sửa dự án
                    </button>
                    <button 
                      onClick={() => setShowCreateGroup(selectedProject.id)}
                      className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Layout size={18} />
                      Thêm giai đoạn
                    </button>
                  </>
                )}
                <button 
                  onClick={() => {
                    if (activeTab === 'personnel') {
                      setShowCreateUser(true);
                    } else if (selectedProject) {
                      if (selectedProject.groups.length === 0) {
                        alert('Vui lòng tạo ít nhất một giai đoạn trước khi thêm công việc!');
                        return;
                      }
                      setShowCreateTask({ projectId: selectedProject.id, groupId: selectedProject.groups[0].id });
                    } else if (activeTab === 'dashboard' || activeTab === 'projects') {
                      setShowCreateProject(true);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  {activeTab === 'personnel' ? 'Tạo nhân sự' : selectedProject ? 'Thêm công việc' : 'Tạo dự án'}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'personnel' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Selected User Detail View */}
                  <div className="lg:col-span-2">
                    <div className="bg-[#FFF5F5] rounded-[40px] p-12 relative overflow-hidden shadow-sm border border-[#FFE4E4]">
                      {/* Decorative dot */}
                      <div className="absolute top-8 right-8 w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-rose-200 rounded-full" />
                      </div>

                      <div className="mb-12 flex items-start gap-8">
                        <img src={currentUser.avatar} className="w-24 h-24 rounded-3xl shadow-xl border-4 border-white" alt="Avatar" />
                        <div>
                          <h1 className="text-5xl font-extralight text-slate-800 mb-2 leading-tight">
                            Hồ sơ<br />nhân sự
                          </h1>
                          <p className="text-slate-500 font-medium">Chi tiết thông tin của {currentUser.name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#5C2D2D] uppercase tracking-widest block px-1">Mã nhân viên</label>
                          <div className="bg-white rounded-full px-6 py-4 text-slate-700 font-medium shadow-sm border border-[#F5E1E1]">
                            {currentUser.employeeId || '—'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#5C2D2D] uppercase tracking-widest block px-1">Họ và tên</label>
                          <div className="bg-white rounded-full px-6 py-4 text-slate-700 font-medium shadow-sm border border-[#F5E1E1]">
                            {currentUser.name}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#5C2D2D] uppercase tracking-widest block px-1">Chức danh</label>
                          <div className="bg-white rounded-full px-6 py-4 text-slate-700 font-medium shadow-sm border border-[#F5E1E1]">
                            {currentUser.role}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#5C2D2D] uppercase tracking-widest block px-1">Cấp bậc nhân sự</label>
                          <div className="bg-white rounded-full px-6 py-4 text-slate-700 font-medium shadow-sm border border-[#F5E1E1]">
                            {currentUser.rank || '—'}
                          </div>
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-black text-[#5C2D2D] uppercase tracking-widest block px-1">Vùng/Khối/Ban</label>
                          <div className="bg-white rounded-full px-6 py-4 text-slate-700 font-medium shadow-sm border border-[#F5E1E1] w-full">
                            {currentUser.region || '—'}
                          </div>
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-black text-[#5C2D2D] uppercase tracking-widest block px-1">Đơn vị</label>
                          <div className="bg-white rounded-full px-6 py-4 text-slate-700 font-medium shadow-sm border border-[#F5E1E1] w-full">
                            {currentUser.unit || '—'}
                          </div>
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-black text-[#5C2D2D] uppercase tracking-widest block px-1">Phòng bộ phận</label>
                          <div className="bg-white rounded-full px-6 py-4 text-slate-700 font-medium shadow-sm border border-[#F5E1E1] w-full">
                            {currentUser.department || '—'}
                          </div>
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-black text-[#5C2D2D] uppercase tracking-widest block px-1">Nhóm CBNV</label>
                          <div className="bg-white rounded-full px-6 py-4 text-slate-700 font-medium shadow-sm border border-[#F5E1E1] w-full">
                            {currentUser.staffGroup || '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Users Sidebar List */}
                  <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Danh mục nhân sự</h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{users.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {users.map(user => (
                        <div 
                          key={user.id}
                          onClick={() => setCurrentUser(user)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group/user ${currentUser.id === user.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                        >
                          <div className="relative">
                            <img src={user.avatar} className="w-12 h-12 rounded-xl border-2 border-white shadow-sm" alt={user.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
                              <button 
                                onClick={(e) => handleDeleteUser(e, user.id)}
                                className="opacity-0 group-hover/user:opacity-100 p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                title="Xóa nhân sự"
                              >
                                <Plus size={14} className="rotate-45" />
                              </button>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{user.role}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{user.employeeId}</span>
                              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{user.rank}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : !selectedProject ? (
              <div className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-6">
                  <StatCard label="Tổng dự án" value={projects.length.toString()} color="slate" />
                  <StatCard 
                    label="Việc đang làm" 
                    value={projects.flatMap(p => p.groups.flatMap(g => g.tasks)).filter(t => t.status === 'In Progress' || t.status === 'Review').length.toString()} 
                    color="indigo" 
                  />
                  <StatCard 
                    label="Hoàn thành" 
                    value={projects.flatMap(p => p.groups.flatMap(g => g.tasks)).filter(t => t.status === 'Done').length.toString()} 
                    color="emerald" 
                  />
                  <StatCard 
                    label="Quá hạn" 
                    value={projects.flatMap(p => p.groups.flatMap(g => g.tasks)).filter(t => {
                      const today = new Date('2024-06-15');
                      return new Date(t.deadline) < today && t.status !== 'Done';
                    }).length.toString()} 
                    color="rose" 
                  />
                </div>

                {/* Projects Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                       Dự án đang theo dõi
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        users={users}
                        onClick={() => setSelectedProjectId(project.id)}
                        onDelete={(e) => handleDeleteProject(e, project.id)}
                        onEdit={(e) => setEditingProject(project)}
                        isManager={project.manager === currentUser.id}
                      />
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <div className="space-y-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                      <button onClick={() => setSelectedProjectId(null)} className="hover:text-indigo-600 transition-colors">Dự án</button>
                      <ChevronRight size={14} />
                      <span className="font-semibold text-slate-900">{selectedProject.name}</span>
                    </div>
                    <p className="text-slate-500 text-sm">{selectedProject.description}</p>
                  </div>
                  <div className="flex -space-x-3">
                    {Array.from(new Set(selectedProject.groups.flatMap(g => g.tasks).map(t => t.assignedTo))).map(userId => {
                      const user = users.find(u => u.id === userId);
                      if (!user) return null;
                      return (
                        <img 
                          key={user.id} 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" 
                          title={user.name}
                        />
                      );
                    })}
                    {selectedProject.groups.flatMap(g => g.tasks).length === 0 && (
                      <div className="text-[10px] text-slate-300 font-bold italic">Dự án chưa có nhân sự tham gia</div>
                    )}
                  </div>
                </div>

                <div className="space-y-12">
                  {selectedProject.groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                      <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-300 mb-6 shadow-sm">
                        <Layout size={36} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 mb-2">Dự án chưa được phân giai đoạn</h3>
                      <p className="text-slate-400 text-sm mb-8 text-center max-w-sm">Hãy chia dự án của bạn thành các nhóm công việc lớn (ví dụ: Giai đoạn 1, Giai đoạn 2) để bắt đầu giao việc.</p>
                      {isManager && (
                        <button 
                          onClick={() => setShowCreateGroup(selectedProject.id)}
                          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Plus size={22} />
                          Khởi tạo giai đoạn 1
                        </button>
                      )}
                    </div>
                  ) : (
                    selectedProject.groups.map(group => (
                      <section key={group.id} className="space-y-6">
                        <div className="flex items-center justify-between bg-white/50 p-4 rounded-3xl border border-slate-100/50">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                              <Target size={24} />
                            </div>
                            <div>
                              <h3 className="font-black text-xl text-slate-800 leading-none mb-1">{group.title}</h3>
                              <div className="flex items-center gap-3">
                                <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500 rounded-full" 
                                    style={{ width: `${group.tasks.length === 0 ? 0 : Math.round((group.tasks.filter(t => t.status === 'Done').length / group.tasks.length) * 100)}%` }}
                                  />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {group.tasks.length === 0 ? 'Chưa có việc' : `${Math.round((group.tasks.filter(t => t.status === 'Done').length / group.tasks.length) * 100)}% Hoàn thành`}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isManager && (
                              <button 
                                onClick={() => setEditingGroup({ projectId: selectedProject.id, groupId: group.id, title: group.title })}
                                className="p-2.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                                title="Chỉnh sửa giai đoạn"
                              >
                                <Pencil size={18} />
                              </button>
                            )}
                            {isManager && (
                              <button 
                                onClick={() => handleDeleteGroup(selectedProject.id, group.id)}
                                className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Xóa giai đoạn"
                              >
                                <Plus size={20} className="rotate-45" />
                              </button>
                            )}
                            {isManager && (
                              <button 
                                onClick={() => setShowCreateTask({ projectId: selectedProject.id, groupId: group.id })}
                                className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-white border border-slate-100 hover:border-indigo-200 px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
                              >
                                <Plus size={16} strokeWidth={3} />
                                Thêm công việc
                              </button>
                            )}
                          </div>
                        </div>

                      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                              <th className="px-6 py-4">Tên công việc</th>
                              <th className="px-6 py-4">Phụ trách</th>
                              <th className="px-6 py-4">Hạn (Deadline)</th>
                              <th className="px-6 py-4">Trạng thái</th>
                              <th className="px-6 py-4">Hình ảnh</th>
                              <th className="px-6 py-4">Kết quả</th>
                              <th className="px-6 py-4"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {group.tasks.map(task => (
                              <tr 
                                key={task.id} 
                                onClick={() => {
                                  setViewingTask(task);
                                  setEditResult(task.resultDetail || '');
                                  setEditImage(task.imageUrl || '');
                                  setEditStatus(task.status);
                                }}
                                className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                              >
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    <span className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">{task.title}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src={mockUsers.find(u => u.id === task.assignedTo)?.avatar} 
                                      alt="Assignee" 
                                      className="w-7 h-7 rounded-full"
                                    />
                                    <span className="text-xs font-medium text-slate-600">
                                      {mockUsers.find(u => u.id === task.assignedTo)?.name.split(' ').pop()}
                                      {task.assignedTo === currentUser.id && <span className="ml-1 text-[8px] bg-indigo-600 text-white px-1 ml-1 rounded font-black uppercase">BẠN</span>}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <Calendar size={14} className="text-slate-300" />
                                    {task.deadline}
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <StatusBadge status={task.status} />
                                </td>
                                <td className="px-6 py-5">
                                  {task.imageUrl ? (
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                                      <img src={task.imageUrl} alt="Thumb" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                                      <ImageIcon size={16} />
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-5 max-w-[200px]">
                                  {task.resultDetail ? (
                                    <p className="text-xs text-slate-400 italic line-clamp-1">"{task.resultDetail}"</p>
                                  ) : (
                                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">—</span>
                                  )}
                                </td>
                                <td className="px-6 py-5 text-right">
                                  <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                    <MoreVertical size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  ))
                )}
              </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    'Todo': 'bg-slate-100 text-slate-600 border-slate-200',
    'In Progress': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'Review': 'bg-amber-50 text-amber-600 border-amber-100',
    'Done': 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  );
}

function DetailItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
        <p className={`text-sm font-bold ${color || 'text-slate-800'}`}>{value}</p>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-indigo-50 text-indigo-600 font-semibold' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
    </button>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: 'slate' | 'indigo' | 'emerald' | 'rose' }) {
  const colorMap = {
    slate: 'bg-white text-slate-900',
    indigo: 'bg-indigo-600 text-white',
    emerald: 'bg-emerald-500 text-white',
    rose: 'bg-rose-500 text-white'
  };

  return (
    <div className={`p-6 rounded-2xl shadow-sm border border-slate-100 ${color === 'slate' ? 'bg-white' : colorMap[color]}`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${color === 'slate' ? 'text-slate-400' : 'opacity-80'}`}>{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}

function ProjectCard({ project, onClick, onDelete, onEdit, isManager, users }: { project: Project, onClick: () => void, onDelete: (e: React.MouseEvent) => void, onEdit: (e: React.MouseEvent) => void, isManager: boolean, users: User[], key?: string }) {
  const allTasks = project.groups.flatMap(g => g.tasks);
  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'In Progress' || t.status === 'Review').length;
  
  // Overdue logic: deadline passed and not done
  const today = new Date('2024-06-15');
  const overdueTasks = allTasks.filter(t => {
    const deadline = new Date(t.deadline);
    return deadline < today && t.status !== 'Done';
  }).length;

  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group flex flex-col h-full relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Briefcase size={24} />
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${project.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
            {project.status}
          </div>
          {isManager && (
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(e); }}
                className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                title="Sửa dự án"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={onDelete}
                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                title="Xóa dự án"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <h3 className="font-bold text-lg mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{project.name}</h3>
      <p className="text-slate-500 text-xs mb-6 line-clamp-2 leading-relaxed h-10">{project.description}</p>
      
      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Đang làm</p>
          <p className="text-sm font-black text-indigo-600">{inProgressTasks}</p>
        </div>
        <div className="bg-emerald-50/30 p-2 rounded-xl border border-emerald-50 text-center">
          <p className="text-[9px] font-black text-emerald-400 uppercase leading-none mb-1">Xong</p>
          <p className="text-sm font-black text-emerald-600">{doneTasks}</p>
        </div>
        <div className={`${overdueTasks > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'} p-2 rounded-xl border text-center transition-colors`}>
          <p className="text-[9px] font-black uppercase leading-none mb-1">Trễ hạn</p>
          <p className="text-sm font-black">{overdueTasks}</p>
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-400">Tiến độ</span>
            <span className="text-indigo-600">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              style={{ width: `${progress}%` }}
              className="h-full bg-indigo-600 rounded-full transition-all duration-700"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex -space-x-2">
            {allTasks.slice(0, 3).map((t, idx) => (
              <img 
                key={idx} 
                src={users.find(u => u.id === t.assignedTo)?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`} 
                alt="User" 
                className="w-7 h-7 rounded-full border-2 border-white shadow-sm" 
              />
            ))}
            {allTasks.length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                +{allTasks.length - 3}
              </div>
            )}
            {allTasks.length === 0 && (
              <div className="text-[10px] text-slate-300 font-bold italic">Chưa có nhân sự</div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
            <Calendar size={12} />
            <span>{project.deadline}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
