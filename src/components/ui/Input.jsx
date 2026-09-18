import { forwardRef, useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  required = false,
  onChange,
  onBlur,
  ...props
}, ref) => {
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sync external error prop changes (e.g., from parent form submission)
  useEffect(() => {
    setLocalError(error || '');
  }, [error]);

  const handleBlur = (e) => {
    const input = e.target;
    
    // Check validation states on blur
    if (required && !input.value.trim()) {
      setLocalError('This field is required');
    } else if (input.value && type === 'email' && !/\S+@\S+\.\S+/.test(input.value)) {
      setLocalError('Please enter a valid email address');
    } else if (input.value && type === 'password' && input.value.length < 6) {
      setLocalError('Password must be at least 6 characters');
    } else {
      setLocalError('');
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e) => {
    // Clear error message immediately when user modifies input
    if (localError) {
      setLocalError('');
    }

    if (onChange) {
      onChange(e);
    }
  };

  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
        
        <input
          ref={ref}
          id={name}
          name={name}
          type={inputType}
          required={required}
          onBlur={handleBlur}
          onChange={handleChange}
          className={`
            w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-slate-900 dark:text-slate-100 text-sm 
            transition-all duration-200 outline-none
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            ${Icon ? 'pl-11' : ''}
            ${isPasswordType ? 'pr-11' : ''}
            ${localError 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' 
              : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
            }
          `}
          {...props}
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
            tabIndex="-1"
          >
            {showPassword ? (
              <EyeOff className="w-4.5 h-4.5" />
            ) : (
              <Eye className="w-4.5 h-4.5" />
            )}
          </button>
        )}
      </div>

      {localError && (
        <p className="text-xs text-red-400 font-medium mt-0.5 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400" />
          {localError}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
