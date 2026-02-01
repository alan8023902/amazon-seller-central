import { useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'zh';

export const useBrowserLanguage = (): SupportedLanguage => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const detectLanguage = (): SupportedLanguage => {
      // 获取浏览器语言设置
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      
      // 检查是否为中文
      if (browserLang.startsWith('zh')) {
        return 'zh';
      }
      
      // 默认返回英文
      return 'en';
    };

    const detectedLang = detectLanguage();
    setLanguage(detectedLang);

    // 监听语言变化（如果浏览器支持）
    const handleLanguageChange = () => {
      const newLang = detectLanguage();
      setLanguage(newLang);
    };

    // 某些浏览器支持语言变化事件
    window.addEventListener('languagechange', handleLanguageChange);

    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  return language;
};

// 获取浏览器语言的翻译文本
export const getBrowserLanguageTexts = (lang: SupportedLanguage) => {
  const texts = {
    en: {
      signIn: 'Sign in',
      email: 'Email',
      emailAddress: 'Email or mobile phone number',
      emailRequired: 'Email or mobile phone number is required',
      continue: 'Continue',
      password: 'Password',
      passwordRequired: 'Password is required',
      signInButton: 'Sign in',
      keepSignedIn: 'Keep me signed in',
      forgotPassword: 'Forgot your password?',
      newCustomer: 'New to Amazon?',
      createAccount: 'Create your Amazon account',
      verificationCode: 'Enter the verification code',
      verificationCodeRequired: 'Verification code is required',
      resendCode: 'Resend the code',
      register: 'Create Account',
      confirmPassword: 'Confirm Password',
      confirmPasswordRequired: 'Please confirm your password',
      passwordMismatch: 'Passwords do not match',
      alreadyHaveAccount: 'Already have an account?',
      signInHere: 'Sign in here',
      createAccountButton: 'Create Account',
      // 新增登录相关文本
      invalidCredentials: 'Invalid email/phone or password',
      loginSuccess: 'Login successful',
      loginFailed: 'Login failed',
      username: 'Username',
      usernameRequired: 'Username is required',
    },
    zh: {
      signIn: '登录',
      email: '邮箱',
      emailAddress: '邮箱或手机号码',
      emailRequired: '请输入邮箱或手机号码',
      continue: '继续',
      password: '密码',
      passwordRequired: '请输入密码',
      signInButton: '登录',
      keepSignedIn: '保持登录状态',
      forgotPassword: '忘记密码？',
      newCustomer: '初次使用亚马逊？',
      createAccount: '创建您的亚马逊账户',
      verificationCode: '输入验证码',
      verificationCodeRequired: '请输入验证码',
      resendCode: '重新发送验证码',
      register: '创建账户',
      confirmPassword: '确认密码',
      confirmPasswordRequired: '请确认密码',
      passwordMismatch: '密码不匹配',
      alreadyHaveAccount: '已有账户？',
      signInHere: '在此登录',
      createAccountButton: '创建账户',
      // 新增登录相关文本
      invalidCredentials: '邮箱/手机号或密码错误',
      loginSuccess: '登录成功',
      loginFailed: '登录失败',
      username: '用户名',
      usernameRequired: '请输入用户名',
    }
  };

  return texts[lang];
};