import React from "react";
import { BrandLogo } from "../components/UI";
import { useI18n } from "../hooks/useI18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

const AuthLayout: React.FC<{ children: React.ReactNode; showNewUser?: React.ReactNode }> = ({
  children,
  showNewUser,
}) => {
  const { t } = useI18n();

  return (
    <div className="bg-white">
      {/* 顶部 Logo 和语言切换 */}
      <div className="pt-[15px] pb-[26px] flex justify-center relative">
        <BrandLogo />
        {/* 语言切换器 - 右上角 */}
        <div className="absolute top-[15px] right-[20px]">
          <LanguageSwitcher variant="auth" />
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex flex-col items-center w-full px-4 animate-fade-in">
        {children}
        {showNewUser ? <div className="mt-[15px] w-full flex justify-center">{showNewUser}</div> : null}
      </div>

      {/* Footer 上方横线 */}
      <div className="mt-[30px]">
        <div className="h-[2px] bg-[#DDD] w-full" />
      </div>

      {/* Footer 链接 */}
      <div className="pt-[22px]">
        <div className="flex justify-center gap-10 text-[12px] text-[#007185] mb-3 font-medium">
          <a href="#" className="hover:underline">
            {t('termsCondition')}
          </a>
          <a href="#" className="hover:underline">
            {t('privacyNotice')}
          </a>
          <a href="#" className="hover:underline">
            {t('help')}
          </a>
        </div>

        <div className="text-center text-[12px] text-[#565959]">
          © 1996-2025, Amazon.com, Inc. or its affiliates
        </div>
      </div>

      {/* 真实页底部会留很多空白 */}
      <div className="h-[220px]" />
    </div>
  );
};

export default AuthLayout;
