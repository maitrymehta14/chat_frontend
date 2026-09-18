import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/users';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when typing
    if (errors[name] || errors.submit) {
      setErrors((prev) => ({ ...prev, [name]: '', submit: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const result = await login(formData.email, formData.password);
    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrors((prev) => ({ ...prev, submit: result.error || 'Authentication failed' }));
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">
            Welcome back
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Access your real-time telemetry dashboard.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errors.submit && (
            <div className="text-xs text-red-400 text-center font-medium bg-red-500/10 py-2.5 px-4 rounded-xl border border-red-500/20">
              {errors.submit}
            </div>
          )}

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              required
            />
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-0 focus:ring-2 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-400 hover:text-slate-300">Remember me</span>
              </label>
              <a
                href="#forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* Direct link to register */}
        <div className="text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium cursor-pointer"
          >
            Sign up
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
