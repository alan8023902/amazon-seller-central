import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      storeManagement: 'Store Management',
      productManagement: 'Product Management',
      userManagement: 'User Management',
      salesDataConfig: 'Sales Data Config',
      dashboardConfig: 'Dashboard Config',
      businessReportsConfig: 'Business Reports Config',
      communicationsConfig: 'Communications Config',
      vocDataConfig: 'VOC Data Config',
      accountHealthConfig: 'Account Health Config',
      legalEntityConfig: 'Legal Entity Config',
      sellingApplicationsConfig: 'Selling Applications Config',
      
      // Common actions
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      create: 'Create',
      update: 'Update',
      refresh: 'Refresh',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      
      // Status
      active: 'Active',
      inactive: 'Inactive',
      enabled: 'Enabled',
      disabled: 'Disabled',
      success: 'Success',
      error: 'Error',
      loading: 'Loading...',
      
      // Dashboard
      adminDashboard: 'Admin Dashboard',
      currentStore: 'Current Store',
      productCount: 'Product Count',
      salesOrderItems: 'Sales Order Items',
      pendingOrders: 'Pending Orders',
      quickActions: 'Quick Actions',
      systemStatus: 'System Status',
      lastUpdated: 'Last Updated',
      
      // Store Management
      storeList: 'Store List',
      storeName: 'Store Name',
      marketplace: 'Marketplace',
      currency: 'Currency',
      timezone: 'Timezone',
      businessType: 'Business Type',
      createdAt: 'Created At',
      
      // Product Management
      productList: 'Product List',
      productName: 'Product Name',
      productTitle: 'Product Title',
      sku: 'SKU',
      asin: 'ASIN',
      price: 'Price',
      inventory: 'Inventory',
      status: 'Status',
      revenue: 'Revenue',
      image: 'Image',
      uploadImage: 'Upload Image',
      
      // User Management
      userList: 'User List',
      userName: 'User Name',
      email: 'Email',
      role: 'Role',
      password: 'Password',
      verificationCode: 'Verification Code',
      refreshPassword: 'Refresh Password',
      refreshOTP: 'Refresh OTP',
      
      // Forms
      name: 'Name',
      description: 'Description',
      required: 'Required',
      optional: 'Optional',
      pleaseEnter: 'Please enter',
      pleaseSelect: 'Please select',
      
      // Messages
      operationSuccess: 'Operation successful!',
      operationFailed: 'Operation failed',
      createSuccess: 'Created successfully!',
      updateSuccess: 'Updated successfully!',
      deleteSuccess: 'Deleted successfully!',
      deleteConfirm: 'Are you sure you want to delete this item?',
      loadingData: 'Loading data...',
      noDataAvailable: 'No data available',
      
      // API
      apiConnectionError: 'API Connection Error',
      cannotConnectToBackend: 'Cannot connect to backend API server',
      backendRunningNormally: 'Backend server running normally',
      apiRequestFailed: 'API request failed',
      
      // Pagination
      total: 'Total',
      page: 'Page',
      itemsPerPage: 'Items per page',
      showingItems: 'Showing {{from}}-{{to}} of {{total}} items',
    }
  },
  zh: {
    translation: {
      // Navigation
      dashboard: '仪表板',
      storeManagement: '店铺管理',
      productManagement: '产品管理',
      userManagement: '用户管理',
      salesDataConfig: '销售数据配置',
      dashboardConfig: '仪表板配置',
      businessReportsConfig: '业务报告配置',
      communicationsConfig: '通信配置',
      vocDataConfig: 'VOC数据配置',
      accountHealthConfig: '账户健康配置',
      legalEntityConfig: '法律实体配置',
      sellingApplicationsConfig: '销售申请配置',
      
      // Common actions
      add: '添加',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      create: '创建',
      update: '更新',
      refresh: '刷新',
      search: '搜索',
      filter: '筛选',
      export: '导出',
      import: '导入',
      
      // Status
      active: '活跃',
      inactive: '非活跃',
      enabled: '启用',
      disabled: '禁用',
      success: '成功',
      error: '错误',
      loading: '加载中...',
      
      // Dashboard
      adminDashboard: '管理后台概览',
      currentStore: '当前店铺',
      productCount: '产品数量',
      salesOrderItems: '销售订单项',
      pendingOrders: '待处理订单',
      quickActions: '快速操作',
      systemStatus: '系统状态',
      lastUpdated: '最后更新',
      
      // Store Management
      storeList: '店铺列表',
      storeName: '店铺名称',
      marketplace: '市场',
      currency: '货币',
      timezone: '时区',
      businessType: '业务类型',
      createdAt: '创建时间',
      
      // Product Management
      productList: '产品列表',
      productName: '产品名称',
      productTitle: '产品标题',
      sku: 'SKU',
      asin: 'ASIN',
      price: '价格',
      inventory: '库存',
      status: '状态',
      revenue: '收入',
      image: '图片',
      uploadImage: '上传图片',
      
      // User Management
      userList: '用户列表',
      userName: '用户名',
      email: '邮箱',
      role: '角色',
      password: '密码',
      verificationCode: '验证码',
      refreshPassword: '刷新密码',
      refreshOTP: '刷新验证码',
      
      // Forms
      name: '名称',
      description: '描述',
      required: '必填',
      optional: '可选',
      pleaseEnter: '请输入',
      pleaseSelect: '请选择',
      
      // Messages
      operationSuccess: '操作成功！',
      operationFailed: '操作失败',
      createSuccess: '创建成功！',
      updateSuccess: '更新成功！',
      deleteSuccess: '删除成功！',
      deleteConfirm: '确定要删除这个项目吗？',
      loadingData: '加载数据中...',
      noDataAvailable: '暂无数据',
      
      // API
      apiConnectionError: 'API连接错误',
      cannotConnectToBackend: '无法连接到后端API服务器',
      backendRunningNormally: '后端服务器运行正常',
      apiRequestFailed: 'API请求失败',
      
      // Pagination
      total: '总计',
      page: '页',
      itemsPerPage: '每页条数',
      showingItems: '显示第 {{from}}-{{to}} 条，共 {{total}} 条记录',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh', // Default language (Chinese)
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // Enable debug mode in development
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;