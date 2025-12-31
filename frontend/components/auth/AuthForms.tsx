import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ViewType } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Header } from '../layout/Header';
import { sanitizeInput } from '../../utils/cn';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onNavigate: (view: ViewType) => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  description,
  children,
  onNavigate
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1634557250864-148750dd4d1a"
          alt="Airport"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 dark:from-black/80 dark:via-black/70 dark:to-black/80" />
      </div>
      
      <Header
        isLoggedIn={false}
        onNavigate={onNavigate}
        className="relative backdrop-blur-sm bg-white/80 border-b border-white/20 shadow-sm"
      />

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          {children}
        </Card>
      </main>
    </div>
  );
};

interface AuthFormProps {
  onSubmit: (email: string, password: string) => void;
  onNavigate: (view: ViewType) => void;
  submitLabel: string;
  alternateView: ViewType;
  alternateText: string;
  alternateLabel: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  onNavigate,
  submitLabel,
  alternateView,
  alternateText,
  alternateLabel,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isRegister = submitLabel.toLowerCase().includes('create') || submitLabel.toLowerCase().includes('register');
  const [showInfo, setShowInfo] = useState(isRegister);

  const isEmailValid = (e: string) => {
    // simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const passwordRules = {
    minLength: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = () => {
    // require min length, lower, upper, number, and special character
    return (
      passwordRules.minLength && passwordRules.hasLower && passwordRules.hasUpper && passwordRules.hasNumber && passwordRules.hasSpecial
    );
  };

  const canSubmit = () => {
    // For login we only require a non-empty password and valid email; for register require stricter password
    if (submitLabel.toLowerCase().includes('create') || submitLabel.toLowerCase().includes('register')) {
      return isEmailValid(email) && isPasswordValid();
    }
    return isEmailValid(email) && password.length > 0;
  };

  return (
    <CardContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit()) return;
          const sanitizedEmail = email.trim();
          const sanitizedPassword = password.trim();
          onSubmit(sanitizedEmail, sanitizedPassword);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(v) => setEmail((v.target as HTMLInputElement).value)}
          />
          {!isEmailValid(email) && email.length > 0 && (
            <p className="text-sm text-red-500">Please enter a valid email address</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {isRegister && (
              <button type="button" className="text-sm text-blue-600" onClick={() => setShowInfo(!showInfo)}>
                {showInfo ? 'Hide requirements' : 'Password requirements'}
              </button>
            )}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(v) => setPassword((v.target as HTMLInputElement).value)}
          />

          {isRegister && showInfo && (
            <div className="mt-2 text-sm bg-gray-50 p-3 rounded">
              <p className="font-medium mb-1">Your password must include:</p>
              <ul className="list-none space-y-1">
                <li className={passwordRules.minLength ? 'text-green-600' : 'text-gray-600'}>
                  {passwordRules.minLength ? '✓' : '○'} At least 8 characters
                </li>
                <li className={passwordRules.hasLower ? 'text-green-600' : 'text-gray-600'}>
                  {passwordRules.hasLower ? '✓' : '○'} A lowercase letter
                </li>
                <li className={passwordRules.hasUpper ? 'text-green-600' : 'text-gray-600'}>
                  {passwordRules.hasUpper ? '✓' : '○'} An uppercase letter
                </li>
                <li className={passwordRules.hasNumber ? 'text-green-600' : 'text-gray-600'}>
                  {passwordRules.hasNumber ? '✓' : '○'} A number
                </li>
                <li className={passwordRules.hasSpecial ? 'text-green-600' : 'text-gray-600'}>
                  {passwordRules.hasSpecial ? '✓' : '○'} A special character
                </li>
              </ul>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={!canSubmit()}>
          {submitLabel}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">{alternateText} </span>
        <button onClick={() => onNavigate(alternateView)} className="text-blue-600 hover:underline">
          {alternateLabel}
        </button>
      </div>
    </CardContent>
  );
};

export const LoginForm: React.FC<{
  onLogin: (email: string, password: string) => void;
  onNavigate: (view: ViewType) => void;
}> = ({ onLogin, onNavigate }) => {
  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to your GroundScanner account"
      onNavigate={onNavigate}
    >
      <AuthForm
        onSubmit={onLogin}
        onNavigate={onNavigate}
        submitLabel="Log in"
        alternateView="register"
        alternateText="Don't have an account?"
        alternateLabel="Register"
      />
    </AuthLayout>
  );
};

export const RegisterForm: React.FC<{
  onRegister: (email: string, password: string) => void;
  onNavigate: (view: ViewType) => void;
}> = ({ onRegister, onNavigate }) => {
  return (
    <AuthLayout
      title="Create an account"
      description="Join GroundScanner today"
      onNavigate={onNavigate}
    >
      <AuthForm
        onSubmit={onRegister}
        onNavigate={onNavigate}
        submitLabel="Create account"
        alternateView="login"
        alternateText="Already have an account?"
        alternateLabel="Log in"
      />
    </AuthLayout>
  );
};