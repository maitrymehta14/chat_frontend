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
        bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5
        ${hoverable ? 'hover:border-slate-700/80 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
