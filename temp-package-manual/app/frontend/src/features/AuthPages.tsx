import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useStore } from "../store";
import { Button, InputField, Card } from "../components/UI";
import AuthLayout from "../layouts/AuthLayout";
import { useI18n } from "../hooks/useI18n";
import { API_CONFIG, apiPost } from "../config/api";
import { useBrowserLanguage, getBrowserLanguageTexts } from "../hooks/useBrowserLanguage";

export const LoginEmail = () => {
  const navigate = useNavigate();
  const setSession = useStore((state) => state.setSession);
  const browserLang = useBrowserLanguage();
  const browserTexts = getBrowserLanguageTexts(browserLang);

  // 使用浏览器语言的验证规则
  const emailSchema = z.object({
    email: z.string().min(1, browserTexts.emailRequired),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = (data: any) => {
    setSession({ email: data.email, step: "password" });
    navigate("/auth/login-password");
  };

  const newUserSection = (
    <div className="w-[350px]">
      <div className="amz-divider-text">{browserTexts.newCustomer}</div>
      <Button variant="white" onClick={() => navigate("/auth/register")}>
        {browserTexts.createAccount}
      </Button>
    </div>
  );

  return (
    <AuthLayout showNewUser={newUserSection}>
      <Card>
        <h1 className="text-[20px] font-normal mb-[14px] leading-[36px] text-[#0F1111]">
          {browserTexts.signIn}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label={browserTexts.emailAddress}
            placeholder={browserTexts.emailAddress}
            {...register("email")}
            error={errors.email?.message as string}
            autoComplete="username"
            className="amz-auth-field"
          />
          <Button type="submit" className="mt-[10px]">
            {browserTexts.continue}
          </Button>
        </form>

        <div className="text-[12px] mt-[14px] text-[#0F1111] leading-[18px]">
          {browserLang === 'zh' ? '继续即表示您同意亚马逊的' : 'By continuing, you agree to Amazon\'s'}
          <a href="#" className="amz-link">
            {browserLang === 'zh' ? '使用条件' : 'Conditions of Use'}
          </a>
          {browserLang === 'zh' ? '和' : ' and '}
          <a href="#" className="amz-link">
            {browserLang === 'zh' ? '隐私声明' : 'Privacy Notice'}
          </a>
          。
        </div>

        <div className="mt-[30px]">
          <Button variant="white" onClick={() => navigate(-1)}>
            {browserLang === 'zh' ? '取消' : 'Cancel'}
          </Button>
        </div>

        <div className="mt-[12px] flex items-center gap-[10px] cursor-pointer group w-fit">
          <span className="text-[13px] amz-link group-hover:underline">
            {browserLang === 'zh' ? '需要帮助？' : 'Need help?'}
          </span>
          <ChevronDown size={16} className="text-[#565959]" />
        </div>
      </Card>
    </AuthLayout>
  );
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const browserLang = useBrowserLanguage();
  const browserTexts = getBrowserLanguageTexts(browserLang);

  return (
    <AuthLayout>
      <Card>
        <h1 className="text-[28px] font-normal mb-[14px] leading-[36px] text-[#0F1111]">
          {browserTexts.createAccount}
        </h1>

        <div className="space-y-4">
          <InputField
            label={browserLang === 'zh' ? '您的姓名' : 'Your name'}
            placeholder={browserLang === 'zh' ? '姓名' : 'First and last name'}
            autoComplete="name"
            className="amz-auth-field"
          />
          <InputField
            label={browserTexts.emailAddress}
            placeholder={browserTexts.emailAddress}
            autoComplete="email"
            className="amz-auth-field"
          />
          <InputField
            label={browserTexts.password}
            type="password"
            placeholder={browserLang === 'zh' ? '至少6个字符' : 'At least 6 characters'}
            autoComplete="new-password"
            helper={browserLang === 'zh' ? '密码区分大小写，必须至少包含6个字符。' : 'Passwords are case-sensitive and must be at least 6 characters.'}
            helperIcon={
              <div className="w-[16px] h-[16px] bg-[#007185] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                i
              </div>
            }
            className="amz-auth-field"
          />
          <InputField
            label={browserTexts.confirmPassword}
            type="password"
            placeholder={browserTexts.confirmPassword}
            autoComplete="new-password"
            className="amz-auth-field"
          />
          <Button className="mt-[50px]">
            {browserTexts.createAccountButton}
          </Button>
        </div>

        <div className="text-[12px] mt-[12px] text-[#0F1111] leading-[28px]">
          {browserLang === 'zh' ? '创建账户即表示您同意亚马逊的' : 'By creating an account, you agree to Amazon\'s'}
          <a href="#" className="amz-link">
            {browserLang === 'zh' ? '使用条件' : 'Conditions of Use'}
          </a>
          {browserLang === 'zh' ? '和' : ' and '}
          <a href="#" className="amz-link">
            {browserLang === 'zh' ? '隐私声明' : 'Privacy Notice'}
          </a>
          。
        </div>

        <div className="h-[2px] bg-[#E7E9EC] w-full my-[14px]" />

        <div className="text-[13px] text-[#0F1111]">
          {browserTexts.alreadyHaveAccount} {" "}
          <a onClick={() => navigate("/auth/login-email")} className="amz-link font-bold cursor-pointer">
            {browserTexts.signInHere} <ChevronRight size={14} className="inline ml-[-2px]" />
          </a>
        </div>
      </Card>
    </AuthLayout>
  );
};

export const LoginPassword = () => {
  const navigate = useNavigate();
  const session = useStore((state) => state.session);
  const setSession = useStore((state) => state.setSession);
  const browserLang = useBrowserLanguage();
  const browserTexts = getBrowserLanguageTexts(browserLang);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordSchema = z.object({
    password: z.string().min(1, browserTexts.passwordRequired),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { username: session.email, password: data.password });
      
      // 调用后端API进行认证
      const result = await apiPost(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        username: session.email, // 使用邮箱作为用户名
        password: data.password,
      });

      console.log('Login API result:', result);

      // 检查API响应格式
      if (result && result.success) {
        // 登录成功，进入OTP验证步骤
        setSession({ 
          step: "otp", 
          email: session.email,
          marketplace: session.marketplace,
          language: session.language,
          isLoggedIn: false,
          store: null
        });
        navigate("/auth/login-otp");
      } else {
        setError(result?.message || browserTexts.invalidCredentials || '用户名或密码错误');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(browserTexts.loginFailed || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card>
        <h1 className="text-[24px] font-medium mb-[12px] text-[#0F1111]">
          {browserTexts.signIn}
        </h1>

        <div className="text-[13px] mb-[10px] flex items-center">
          <span className="text-[#0F1111] font-bold">{session.email}</span>
          <button onClick={() => navigate("/auth/login-email")} className="amz-link text-[12px] ml-[8px]">
            {browserLang === 'zh' ? '更改' : 'Change'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-[10px]">
            <div className="flex justify-between mb-[4px]">
              <label className="text-[13px] font-bold text-[#0F1111]">{browserTexts.password}</label>
              <a href="#" className="amz-link text-[12px]">
                {browserTexts.forgotPassword}
              </a>
            </div>
            <InputField
              type="password"
              {...register("password")}
              error={errors.password?.message as string}
              autoComplete="current-password"
              placeholder={browserTexts.password}
              className="amz-auth-field"
            />
          </div>

          <Button
            type="submit"
            className="mt-[6px]"
            disabled={loading}
          >
            {loading ? '...' : browserTexts.signInButton}
          </Button>
        </form>

        <div className="mt-[12px]">
          <label className="flex items-center gap-[8px] text-[13px] cursor-pointer">
            <input type="checkbox" className="w-[14px] h-[14px] border-[#A6A6A6] rounded-[2px]" />
            <span>{browserTexts.keepSignedIn}</span>
          </label>
        </div>

        <div className="h-[1px] bg-[#E7E9EC] w-full my-[14px]" />

        <Button variant="white" onClick={() => navigate("/auth/register")}>
          {browserTexts.createAccount}
        </Button>
      </Card>
    </AuthLayout>
  );
};

export const LoginOTP = () => {
  const navigate = useNavigate();
  const session = useStore((state) => state.session);
  const setSession = useStore((state) => state.setSession);
  const browserLang = useBrowserLanguage();
  const browserTexts = getBrowserLanguageTexts(browserLang);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpSchema = z.object({
    otp: z.string().min(1, browserTexts.verificationCodeRequired),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting OTP verification with:', { username: session.email, otp: data.otp });
      
      // 调用后端API进行OTP验证
      const result = await apiPost(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {
        username: session.email,
        otp: data.otp,
      });

      console.log('OTP verification result:', result);

      // 检查API响应格式
      if (result && result.success) {
        // OTP验证成功，登录
        setSession({ 
          isLoggedIn: true, 
          email: session.email,
          step: "done",
          marketplace: session.marketplace,
          language: session.language,
          selectedStoreId: result.data?.user?.store_id,
          store: null // Will be loaded separately
        });
        navigate("/app/dashboard");
      } else {
        setError(result?.message || (browserLang === 'zh' ? '验证码错误，请重试' : 'Invalid verification code, please try again'));
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(browserLang === 'zh' ? '验证失败，请重试' : 'Verification failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card>
        <h1 className="text-[24px] font-medium mb-[12px] text-[#0F1111]">
          {browserTexts.signIn}
        </h1>

        <div className="text-[13px] mb-[10px] text-[#0F1111] leading-[18px]">
          {browserLang === 'zh'
            ? '为了您的安全，我们需要验证您的身份。我们已向您发送了一个验证码。'
            : 'For your security, we need to verify your identity. We\'ve sent you a verification code.'
          }
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label={browserTexts.verificationCode}
            placeholder={browserTexts.verificationCode}
            {...register("otp")}
            error={errors.otp?.message as string}
            className="amz-auth-field"
          />

          <div className="flex items-center gap-[8px] mb-[12px]">
            <input type="checkbox" id="no-otp" className="w-[14px] h-[14px]" />
            <label htmlFor="no-otp" className="text-[13px]">
              {browserLang === 'zh'
                ? '不要在此设备上再次询问验证码'
                : 'Don\'t ask for codes on this device'
              }
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? '...' : browserTexts.signInButton}
          </Button>
        </form>

        <div className="mt-[14px] border-t border-[#E7E9EC] pt-[10px]">
          <a href="#" className="amz-link text-[13px]">
            {browserLang === 'zh'
              ? '没有收到验证码？'
              : 'Didn\'t receive the code?'
            }
          </a>
        </div>
      </Card>
    </AuthLayout>
  );
};