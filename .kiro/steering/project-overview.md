# Amazon Seller Central Clone - 项目概览

## 项目简介

高保真度的Amazon Seller Central克隆应用，用于教育和作品展示目的。完整复制了多步骤认证流程、市场切换、本地化仪表板和数据导入/导出功能。

## 核心特性

- **多步骤认证**: 像素级还原登录、密码、两步验证流程
- **多市场支持**: 美国、日本、英国、德国、欧洲市场，支持货币切换和本地化数据
- **国际化**: 完整的中英文i18n支持
- **数据管理**: JSON/CSV数据导入导出功能
- **响应式设计**: 专业商家仪表板的信息密集型布局
- **状态持久化**: 用户会话和仪表板数据的本地存储

## 技术架构

### 前端 (端口: 3000)
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Lucide React** + **Recharts**
- **Zustand** (状态管理) + **TanStack Query** (服务端状态)
- **React Hook Form** + **Zod** (表单验证)

### 后端 (端口: 3001)
- **Node.js** + **Express.js** + **TypeScript**
- **JSON文件存储** + **fs-extra** + **Multer**
- **Zod验证** + **CORS** + **自定义错误处理**

### 管理后台 (端口: 3002)
- **React 18** + **TypeScript** + **Ant Design**
- **TanStack Query** + **React Hook Form**

## 项目结构

```
├── frontend/           # 主前端应用 (3000)
├── backend/           # API服务器 (3001)
├── backend-admin/     # 管理后台 (3002)
├── config/           # 端口配置
└── scripts/          # 启动脚本
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动所有服务
npm run start:all

# 或分别启动
npm run dev:frontend   # 前端 http://localhost:3000
npm run dev:backend    # 后端 http://localhost:3001
npm run dev:admin      # 管理后台 http://localhost:3002
```

## 主要功能模块

### 1. 认证系统
- 邮箱输入 → 密码验证 → OTP两步验证
- 表单验证、多语言支持、会话持久化

### 2. 仪表板
- 欢迎横幅、全局快照(6列数据)
- 商品表现表格、左侧操作卡片
- 实时数据、多站点货币切换

### 3. 库存管理
- 商品列表(搜索、筛选、分页)
- 状态管理、批量操作、媒体预览

### 4. 业务报告
- 销售仪表板、销售快照
- 图表/表格视图切换、Recharts可视化

### 5. 多店铺管理
- 店铺切换、数据隔离
- 差异化数据(美国1.5x、日本1.2x、英国1.0x、德国0.7x)

## 开发规范

### 命名约定
- 组件: `PascalCase.tsx`
- Hook: `use + PascalCase.ts`
- 路由: `kebab-case`

### 代码组织
```typescript
// 导入顺序: 外部库 → 内部模块 → 相对导入
import React from 'react';
import { useStore } from '../store';
import './Component.css';
```

### 样式规范
- 优先使用Tailwind CSS
- Amazon主题色彩: `amazon-text`, `amazon-link`, `amazon-teal`
- 响应式设计: 移动优先

### 状态管理
- 全局状态: Zustand + 持久化
- 组件状态: React Hooks
- 服务端状态: TanStack Query

## API设计

### RESTful端点
- 统一命名、HTTP状态码
- JSON响应格式、Zod验证
- 文件上传支持

### 数据格式
- 店铺特定数据隔离
- 大数值展示(10K+浏览量)
- 实时数据同步

## 部署配置

### 端口分配
- Frontend: 3000
- Backend: 3001  
- Admin: 3002

### 环境变量
```bash
NODE_ENV=development
FRONTEND_PORT=3000
BACKEND_PORT=3001
ADMIN_PORT=3002
```

## 注意事项

- 这是演示项目，不与Amazon关联
- 不应用于实际电商运营
- 展示现代React开发实践和复杂UI复制技能