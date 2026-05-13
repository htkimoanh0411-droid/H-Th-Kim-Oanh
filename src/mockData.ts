import { Project, User } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Nguyễn Văn A', role: 'Project Manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A' },
  { id: 'u2', name: 'Trần Thị B', role: 'Frontend Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B' },
  { id: 'u3', name: 'Lê Văn C', role: 'Backend Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C' },
  { id: 'u4', name: 'Phạm Thị D', role: 'Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=D' },
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Phát triển App E-Commerce',
    description: 'Xây dựng ứng dụng mua sắm trực tuyến đa nền tảng.',
    manager: 'u1',
    deadline: '2024-12-30',
    status: 'Active',
    groups: [
      {
        id: 'g1',
        title: 'Giai đoạn 1: Thiết kế & Prototyping',
        tasks: [
          {
            id: 't1',
            title: 'Thiết kế UI/UX High-fidelity',
            description: 'Hoàn thiện bản vẽ Figma cho các màn hình chính (Home, Cart, Profile).',
            deadline: '2024-06-15',
            assignedTo: 'u4',
            status: 'Done',
            resultDetail: 'Đã hoàn thành 15 màn hình, đã phê duyệt bởi PM.',
            imageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563cc4c?q=80&w=2070&auto=format&fit=crop',
            priority: 'High',
          },
          {
            id: 't2',
            title: 'User Flow Animation',
            description: 'Tạo prototype tương tác cho luồng thanh toán.',
            deadline: '2024-06-20',
            assignedTo: 'u4',
            status: 'Done',
            resultDetail: 'Link prototype đã gửi khách hàng.',
            imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1964&auto=format&fit=crop',
            priority: 'Medium',
          }
        ]
      },
      {
        id: 'g2',
        title: 'Giai đoạn 2: Phát triển Backend',
        tasks: [
          {
            id: 't3',
            title: 'Thiết kế Database Schema',
            description: 'Thiết kế các bảng cho Product, User và Order.',
            deadline: '2024-07-01',
            assignedTo: 'u3',
            status: 'In Progress',
            priority: 'High',
          },
          {
            id: 't4',
            title: 'Xây dựng API Authentication',
            description: 'Triển khai JWT auth và phân quyền người dùng.',
            deadline: '2024-07-10',
            assignedTo: 'u3',
            status: 'Todo',
            priority: 'High',
          }
        ]
      },
      {
        id: 'g3',
        title: 'Giai đoạn 3: Phát triển Frontend',
        tasks: [
          {
            id: 't5',
            title: 'Cài đặt Boilerplate & Tailwind',
            description: 'Khởi tạo project React với các thư viện cần thiết.',
            deadline: '2024-07-15',
            assignedTo: 'u2',
            status: 'Todo',
            priority: 'Medium',
          }
        ]
      }
    ],
  },
  {
    id: 'p2',
    name: 'Chiến dịch Marketing Mùa Hè',
    description: 'Tăng nhận diện thương hiệu thông qua mạng xã hội.',
    manager: 'u1',
    deadline: '2024-09-15',
    status: 'Active',
    groups: [
      {
        id: 'g4',
        title: 'Content Strategy',
        tasks: [
          {
            id: 't6',
            title: 'Lên ý tưởng content Facebook',
            description: 'Tạo 30 bài viết cho tháng 6.',
            deadline: '2024-06-10',
            assignedTo: 'u1',
            status: 'Review',
            priority: 'Medium',
          },
        ]
      }
    ],
  },
];
