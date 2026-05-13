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
  ExternalLink
} from 'lucide-react';
import { Project, Task, User, TaskGroup } from './types';
import { mockProjects, mockUsers } from './mockData';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects'>('dashboard');
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  
  // States for updating task results in modal
  const [editResult, setEditResult] = useState('');
  const [editImage, setEditImage] = useState('');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

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
                  resultDetail: editResult, 
                  imageUrl: editImage,
                  status: editResult ? 'Review' : t.status 
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
    setEditResult('');
    setEditImage('');
    alert('Đã cập nhật kết quả công việc!');
  };

  const isManager = selectedProject?.manager === currentUser.id;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Task Modal */}
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
                    <DetailItem 
                      icon={<UserIcon size={18} />} 
                      label="Người phụ trách" 
                      value={mockUsers.find(u => u.id === viewingTask.assignedTo)?.name || 'N/A'} 
                    />
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
                        Cập nhật kết quả
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Báo cáo chi tiết</label>
                          <textarea 
                            value={editResult || viewingTask.resultDetail || ''}
                            onChange={(e) => setEditResult(e.target.value)}
                            placeholder="Nhập chi tiết công việc đã thực hiện..."
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">URL Hình ảnh (Nếu có)</label>
                          <input 
                            type="text"
                            value={editImage || viewingTask.imageUrl || ''}
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
          <SidebarItem icon={<Users size={20} />} label="Nhân sự" />
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
              const u = mockUsers.find(user => user.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
            className="w-full bg-white border border-slate-200 text-[10px] font-bold p-2 rounded-lg outline-none cursor-pointer hover:border-indigo-300"
          >
            {mockUsers.map(u => (
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
              {selectedProject ? selectedProject.name : activeTab === 'dashboard' ? 'Tổng quan' : 'Tất cả Dự án'}
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
            
            {(activeTab === 'dashboard' || (selectedProject && isManager)) && (
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100">
                <Plus size={18} strokeWidth={2.5} />
                {selectedProject ? 'Thêm công việc' : 'Tạo dự án'}
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
            {!selectedProject ? (
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
                        onClick={() => setSelectedProjectId(project.id)}
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
                    {mockUsers.map(user => (
                      <img 
                        key={user.id} 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" 
                        title={user.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-12">
                  {selectedProject.groups.map(group => (
                    <section key={group.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 ring-4 ring-indigo-50/50">
                            <Target size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-800">{group.title}</h3>
                            <p className="text-xs text-slate-400 font-medium">Tiến độ: {Math.round((group.tasks.filter(t => t.status === 'Done').length / group.tasks.length) * 100)}% ({group.tasks.filter(t => t.status === 'Done').length}/{group.tasks.length} Việc)</p>
                          </div>
                        </div>
                        {isManager && (
                          <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                            <Plus size={16} />
                            Thêm công việc
                          </button>
                        )}
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
                  ))}
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

function ProjectCard({ project, onClick }: { project: Project, onClick: () => void, key?: string }) {
  const manager = mockUsers.find(u => u.id === project.manager);
  
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
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Briefcase size={24} />
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${project.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
          {project.status}
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
            {mockUsers.slice(0, 3).map((u, idx) => (
              <img key={idx} src={u.avatar} alt="User" className="w-7 h-7 rounded-full border-2 border-white shadow-sm" />
            ))}
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
