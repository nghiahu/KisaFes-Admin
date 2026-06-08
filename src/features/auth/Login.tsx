import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '../../hooks/storeHooks';
import { loginSuccess } from './authSlice';
import { axiosClient } from '../../services/axiosClient';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';

const loginSchema = z.object({
  username: z.string().min(1, i18n.t('auth.usernameEmpty')),
  password: z.string().min(6, i18n.t('auth.passwordMin')),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Shape of the data returned by axiosClient after ResponseWrapper unwrap
interface LoginResponseData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    username: string;
    fullname: string;
    avatarUrl?: string;
    roles: string[];
  };
}

export default function Login() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError('');
    try {
      // axiosClient already unwraps ResponseWrapper → returns LoginResponseData
      const response = await axiosClient.post<LoginResponseData>('/api/v1/auth/login', data) as unknown as LoginResponseData;
      
      // Admin role check
      const hasAdminAccess = response.user.roles.some(role => 
        role.toUpperCase() === 'ADMIN' || role.toUpperCase() === 'SUPER_ADMIN' || role.toUpperCase() === 'SUPER ADMIN'
      );

      if (!hasAdminAccess) {
        setError(t('auth.noAdminAccess'));
        setLoading(false);
        return;
      }

      dispatch(loginSuccess({
        user: response.user,
        token: response.accessToken,
      }));
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between py-12 sm:px-6 lg:px-8 font-sans">
      <div className="flex-grow flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            KisaFres Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400 font-medium">
            {t('auth.loginDesc')}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-panel py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-border-subtle">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-900/50 text-red-400 border border-red-800/50 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  {t('auth.emailOrUsername')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...register('username')}
                    type="text"
                    autoComplete="username"
                    placeholder={t('auth.usernamePlaceholder')}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-border-subtle rounded-lg bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  />
                </div>
                {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">{t('auth.password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="********"
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-border-subtle rounded-lg bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-300 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-border-subtle bg-background rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-300 cursor-pointer">
                    {t('auth.rememberMe')}
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-bold text-slate-400 hover:text-slate-300 transition-colors">
                    {t('auth.forgotPassword')}
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  id="btn-login"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? t('common.processing') : t('auth.login')}
                  {!loading && <LogIn className="ml-2 h-5 w-5" />}
                </button>
              </div>

              <div className="mt-6 text-center">
                <span className="text-sm font-medium text-slate-400 mb-4 block">{t('auth.noAccount')}</span>
                <button
                  type="button"
                  className="w-full flex justify-center py-3 px-4 border border-border-subtle rounded-lg shadow-sm text-sm font-bold text-text-secondary bg-transparent hover:bg-panel-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel focus:ring-slate-500 transition-colors"
                >
                  {t('auth.contactAdmin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <footer className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm font-bold text-slate-300">
          <div className="mb-4 md:mb-0">
            © 2024 KisaFres Admin Portal. All rights reserved.
          </div>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-white transition-colors">{t('auth.privacyPolicy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('auth.terms')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('auth.contactSupport')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
