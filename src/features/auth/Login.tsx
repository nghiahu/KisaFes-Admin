import { Label } from '@/components/ui/Label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '../../hooks/storeHooks';
import { loginSuccess } from './authSlice';
import { axiosClient } from '../../services/axiosClient';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';
import type { LoginResponseData } from '../../types';

const loginSchema = z.object({
  username: z.string().min(1, i18n.t('auth.usernameEmpty')),
  password: z.string().min(6, i18n.t('auth.passwordMin')),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Shape of the data returned by axiosClient after ResponseWrapper unwrap

export default function Login() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    }
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
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            KisaFres Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground font-medium">
            {t('auth.loginDesc')}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-border">
            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                {error && (
                  <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-bold text-foreground mb-2">
                        {t('auth.emailOrUsername')}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icons.user className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <Input
                            {...field}
                            type="text"
                            autoComplete="username"
                            placeholder={t('auth.usernamePlaceholder')}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-bold text-foreground mb-2">
                        {t('auth.password')}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icons.lock className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="********"
                            className="pl-10 pr-10"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="h-auto w-auto p-1 text-muted-foreground hover:text-foreground focus:outline-none"
                            >
                              {showPassword ? (
                                <Icons.eyeOff className="h-5 w-5" />
                              ) : (
                                <Icons.eye className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-border bg-background rounded cursor-pointer"
                  />
                  <Label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-foreground cursor-pointer">
                    {t('auth.rememberMe')}
                  </Label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-bold text-primary hover:text-primary/80 transition-colors">
                    {t('auth.forgotPassword')}
                  </a>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  id="btn-login"
                  className="w-full h-12 text-base font-bold"
                >
                  {loading ? t('common.processing') : t('auth.login')}
                  {!loading && <Icons.logIn className="ml-2 h-5 w-5" />}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <span className="text-sm font-medium text-muted-foreground mb-4 block">{t('auth.noAccount')}</span>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-sm font-bold"
                >
                  {t('auth.contactAdmin')}
                </Button>
              </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      
      <footer className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm font-bold text-muted-foreground">
          <div className="mb-4 md:mb-0">
            © 2024 KisaFres Admin Portal. All rights reserved.
          </div>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-foreground transition-colors">{t('auth.privacyPolicy')}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t('auth.terms')}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t('auth.contactSupport')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
