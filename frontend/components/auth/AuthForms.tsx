import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ViewType } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Header } from '../layout/Header';

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
        className="relative backdrop-blur-sm bg-white/5 border-b border-white/10"
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
  onSubmit: (email: string) => void;
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
  return (
    <CardContent>
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSubmit(formData.get('email') as string);
      }} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          {submitLabel}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">{alternateText} </span>
        <button
          onClick={() => onNavigate(alternateView)}
          className="text-blue-600 hover:underline"
        >
          {alternateLabel}
        </button>
      </div>
    </CardContent>
  );
};

export const LoginForm: React.FC<{
  onLogin: (email: string) => void;
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
  onRegister: (email: string) => void;
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