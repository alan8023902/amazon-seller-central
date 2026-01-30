import React from "react";

type CN = Array<string | undefined | null | false>;
const cn = (...args: CN) => args.filter(Boolean).join(" ");

/**
 * Auth 页用：修复 1:1 还原 Logo
 * 指导：amazon 部分加粗，seller central 部分常规，箭头 from a 指向 z
 */
export const BrandLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={cn("flex flex-col items-center select-none", className)}>
      <div className="flex items-baseline relative">
        <span
          className="text-[18px] font-bold text-black leading-none tracking-tighter"
          style={{ fontFamily: "Amazon Ember, Arial, sans-serif" }}
        >
          amazon
        </span>
        <span
          className="text-[18px] font-normal text-black leading-none tracking-tight ml-1"
          style={{ fontFamily: "Amazon Ember, Arial, sans-serif" }}
        >
          seller central
        </span>

        {/* 橙色微笑箭头：起点第一个 a，终点 z 的转角 */}
        <svg
          className="absolute left-[4px] top-[10px]"
          width="60"
          height="20"
          viewBox="0 0 82 18"
          fill="none"
        >
          <path
            d="M2 3.5C12 11.5 38 11.5 52 3.5"
            stroke="#FF9900"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M41 3L52 3.5L45 10.5"
            stroke="#FF9900"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

/**
 * App(控制台) Header 用：MainLayout.tsx 会 import { ConsoleLogo }
 * ✅ 这里“只增强”，不影响 Auth 的 BrandLogo / Card / Button / InputField
 *
 * 调整点：
 * - 字体稍大：14 -> 15（你反馈你的小）
 * - seller central 字重：semibold -> medium（更贴近真实）
 * - smile 的位置与长度更接近真实 header（第三张图）
 */
export const ConsoleLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={cn("flex items-center select-none", className)}
      aria-label="amazon seller central"
      style={{
        fontFamily: "Amazon Ember, Segoe UI, Arial, Helvetica, sans-serif",
        WebkitFontSmoothing: "antialiased",
        textRendering: "geometricPrecision",
      }}
    >
      <div className="relative">
        <div className="flex items-baseline gap-[6px]">
          <span className="text-[15px] font-bold text-white leading-none tracking-tight">
            amazon
          </span>
          <span className="text-[15px] font-medium text-white leading-none tracking-tight">
            seller central
          </span>
        </div>

        {/* orange smile (更贴近 console header 版本) */}
      {/* orange smile — header version (arrow points to "z") */}
        <svg
          className="absolute left-[1px] top-[11px]"
          width="36"
          height="10"
          viewBox="0 0 72 10"
          fill="none"
        >
          {/* 主弧线：更弯曲版本 */}
          <path
            d="M2 3.2C16 7.8 46 7.8 66 3.2"
            stroke="#FF9900"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* 箭头：指向 z */}
          <path
            d="M58 2.8L66 3.2L60.5 8.2"
            stroke="#FF9900"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>


      </div>
    </div>
  );
};

export const Card = ({
  children,
  className = "",
  title,
  headerAction,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  headerAction?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "amz-card bg-white border border-[#D5D9D9] rounded-[8px] shadow-none w-full min-w-0",
        className
      )}
    >
      {title && (
        <div className="px-4 py-2 border-b border-[#D5D9D9] flex justify-between items-center bg-[#F7F8FA]">
          <span className="font-bold text-[13px] text-[#0F1111]">{title}</span>
          {headerAction}
        </div>
      )}
      <div className={cn("p-[20px_20px_16px_20px]")}>
        {children}
      </div>
    </div>
  );
};

type ButtonVariant = "yellow" | "white";

export const Button = ({
  children,
  className = "",
  variant = "yellow",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) => {
  const base =
    "w-full h-[31px] text-[13px] font-medium rounded-full " +
    "flex items-center justify-center select-none " +
    "focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,113,133,0.20)]";

  const styles: Record<ButtonVariant, string> = {
    yellow: "amz-btn-yellow",
    white: "amz-btn-white",
  };

  return (
    <button
      type={type}
      className={cn(base, styles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helper?: string;
  helperIcon?: React.ReactNode;
  inputClassName?: string;
};

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    { label, error, helper, helperIcon, className = "", inputClassName = "", ...props },
    ref
  ) => {
    return (
      <div className={cn("mb-[12px]", className)}>
        {label ? (
          <label className="block text-[13px] font-bold mb-[4px] text-[#0F1111] leading-[16px]">
            {label}
          </label>
        ) : null}

        <input
          ref={ref}
          className={cn(
            "amz-input-base amz-input-focus",
            error ? "border-[#D00] shadow-[0_0_0_3px_rgba(221,0,0,0.10)]" : "",
            inputClassName
          )}
          {...props}
        />

        {helper ? (
          <div className="mt-[6px] flex items-start gap-[8px] text-[12px] text-[#0F1111] leading-[16px]">
            {helperIcon ? <div className="mt-[1px]">{helperIcon}</div> : null}
            <div>{helper}</div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-[6px] text-[12px] text-[#D00] leading-[16px]">
            {error}
          </div>
        ) : null}
      </div>
    );
  }
);

InputField.displayName = "InputField";
