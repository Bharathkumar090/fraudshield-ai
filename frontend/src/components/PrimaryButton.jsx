const variants = {
  primary:
    "bg-blue-700 text-white shadow-sm shadow-blue-700/20 hover:bg-blue-800 focus-visible:outline-blue-700",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700 focus-visible:outline-blue-700",
};

export default function PrimaryButton({
  children,
  variant = "primary",
  as: Component = "button",
  type = "button",
  ...props
}) {
  const buttonProps = Component === "button" ? { type } : {};

  return (
    <Component
      {...buttonProps}
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]}`}
    >
      {children}
    </Component>
  );
}
