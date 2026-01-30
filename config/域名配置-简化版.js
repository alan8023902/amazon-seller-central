/**
 * 域名配置-简化版
 * Amazon Seller Central Clone - Simplified Domain Configuration
 * 
 * 这个文件提供了简化的域名配置，支持本地开发和生产环境的快速切换
 * This file provides simplified domain configuration for quick switching between development and production environments
 */

const fs = require('fs');
const path = require('path');

// 域名配置选项 / Domain Configuration Options
const domainConfigs = {
  // 本地开发环境 / Local Development Environment
  localhost: {
    name: '本地开发环境 / Local Development',
    domains: {
      frontend: 'http://localhost:3000',
      backend: 'http://localhost:3001', 
      admin: 'http://localhost:3002'
    },
    description: '适用于本地开发和测试 / For local development and testing'
  },

  // HTTP域名模式 / HTTP Domain Mode
  http: {
    name: 'HTTP域名模式 / HTTP Domain Mode',
    domains: {
      frontend: 'http://sellercentral.amazon.com',
      backend: 'http://localhost:3001',
      admin: 'http://localhost:3002'
    },
    description: 'HTTP域名访问，后端服务保持localhost / HTTP domain access with localhost backend services'
  },

  // HTTPS域名模式 / HTTPS Domain Mode  
  https: {
    name: 'HTTPS域名模式 / HTTPS Domain Mode',
    domains: {
      frontend: 'https://sellercentral.amazon.com',
      backend: 'http://localhost:3001',
      admin: 'http://localhost:3002'
    },
    description: 'HTTPS域名访问，后端服务保持localhost / HTTPS domain access with localhost backend services'
  },

  // 完整域名模式 / Full Domain Mode
  full: {
    name: '完整域名模式 / Full Domain Mode',
    domains: {
      frontend: 'https://sellercentral.amazon.com',
      backend: 'http://api.sellercentral.amazon.com:3001',
      admin: 'http://admin.sellercentral.amazon.com:3002'
    },
    description: '所有服务都使用域名访问 / All services use domain access'
  },

  // 局域网访问 / LAN Access
  lan: {
    name: '局域网访问 / LAN Access',
    domains: {
      frontend: 'http://192.168.1.100:3000',
      backend: 'http://192.168.1.100:3001',
      admin: 'http://192.168.1.100:3002'
    },
    description: '局域网内其他设备访问 / Access from other devices on LAN'
  }
};

// 当前配置 / Current Configuration
let currentConfig = domainConfigs.localhost;

// 配置验证函数 / Configuration Validation Function
function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('配置对象无效 / Invalid configuration object');
  }

  if (!config.domains || typeof config.domains !== 'object') {
    throw new Error('域名配置缺失 / Missing domains configuration');
  }

  const requiredDomains = ['frontend', 'backend', 'admin'];
  for (const domain of requiredDomains) {
    if (!config.domains[domain]) {
      throw new Error(`缺少${domain}域名配置 / Missing ${domain} domain configuration`);
    }

    // 简单的URL格式验证 / Simple URL format validation
    const url = config.domains[domain];
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error(`${domain}域名格式无效 / Invalid ${domain} domain format`);
    }
  }

  return true;
}

// 应用配置函数 / Apply Configuration Function
function applyConfig(configName) {
  if (!domainConfigs[configName]) {
    throw new Error(`未知配置: ${configName} / Unknown configuration: ${configName}`);
  }

  const config = domainConfigs[configName];
  
  try {
    validateConfig(config);
    currentConfig = config;
    
    console.log('='.repeat(60));
    console.log(`✅ 域名配置已更新 / Domain configuration updated`);
    console.log(`📋 配置名称 / Configuration: ${config.name}`);
    console.log(`📝 描述 / Description: ${config.description}`);
    console.log('');
    console.log('🌐 域名设置 / Domain Settings:');
    console.log(`   前端 / Frontend: ${config.domains.frontend}`);
    console.log(`   后端 / Backend:  ${config.domains.backend}`);
    console.log(`   管理 / Admin:    ${config.domains.admin}`);
    console.log('='.repeat(60));
    
    return config;
  } catch (error) {
    console.error('❌ 配置验证失败 / Configuration validation failed:', error.message);
    throw error;
  }
}

// 获取当前配置 / Get Current Configuration
function getCurrentConfig() {
  return currentConfig;
}

// 列出所有可用配置 / List All Available Configurations
function listConfigs() {
  console.log('📋 可用的域名配置 / Available Domain Configurations:');
  console.log('');
  
  Object.keys(domainConfigs).forEach((key, index) => {
    const config = domainConfigs[key];
    console.log(`${index + 1}. ${key}`);
    console.log(`   名称 / Name: ${config.name}`);
    console.log(`   描述 / Description: ${config.description}`);
    console.log(`   前端 / Frontend: ${config.domains.frontend}`);
    console.log('');
  });
}

// 交互式配置选择 / Interactive Configuration Selection
function interactiveSetup() {
  console.log('🚀 Amazon Seller Central - 域名配置向导');
  console.log('🚀 Amazon Seller Central - Domain Configuration Wizard');
  console.log('');
  
  listConfigs();
  
  // 这里可以添加用户输入处理逻辑
  // User input handling logic can be added here
  console.log('💡 提示 / Tip: 大多数用户应该选择 "localhost" 配置');
  console.log('💡 Tip: Most users should choose "localhost" configuration');
  console.log('');
  
  // 默认应用localhost配置 / Apply localhost configuration by default
  return applyConfig('localhost');
}

// 环境检测 / Environment Detection
function detectEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasCustomDomain = process.env.CUSTOM_DOMAIN === 'true';
  
  if (hasCustomDomain) {
    return 'custom';
  } else if (isProduction) {
    return 'localhost'; // 即使在生产环境也使用localhost，除非明确指定
  } else {
    return 'localhost';
  }
}

// 自动配置 / Auto Configuration
function autoConfig() {
  const envConfig = detectEnvironment();
  console.log(`🔍 检测到环境配置 / Detected environment configuration: ${envConfig}`);
  return applyConfig(envConfig);
}

// 导出配置对象和函数 / Export configuration object and functions
module.exports = {
  domainConfigs,
  currentConfig: getCurrentConfig,
  validateConfig,
  applyConfig,
  listConfigs,
  interactiveSetup,
  autoConfig,
  
  // 便捷访问当前域名 / Convenient access to current domains
  get domains() {
    return getCurrentConfig().domains;
  },
  
  // 检查是否为开发环境 / Check if development environment
  get isDevelopment() {
    const current = getCurrentConfig();
    return current.domains.frontend.includes('localhost');
  }
};

// 如果直接运行此文件，启动交互式配置 / If running this file directly, start interactive setup
if (require.main === module) {
  try {
    interactiveSetup();
  } catch (error) {
    console.error('❌ 配置失败 / Configuration failed:', error.message);
    process.exit(1);
  }
}