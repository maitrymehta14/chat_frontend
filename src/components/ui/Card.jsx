const Card = ({
  children,
  className = '',
  hoverable = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-none
        ${hoverable ? 'hover:border-slate-300 dark:hover:border-slate-700/80 hover:shadow-md dark:hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
