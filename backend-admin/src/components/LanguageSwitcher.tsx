import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    // Persist language preference
    localStorage.setItem('admin-language', language);
  };

  const currentLanguage = i18n.language || 'zh';

  return (
    <Select
      value={currentLanguage}
      onChange={handleLanguageChange}
      style={{ width: 120 }}
      size="small"
      suffixIcon={<GlobalOutlined />}
    >
      <Option value="zh">中文</Option>
      <Option value="en">English</Option>
    </Select>
  );
};

export default LanguageSwitcher;