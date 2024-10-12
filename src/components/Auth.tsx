import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AuthProps {
  onLogin: (token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    // Here you would typically make an API call to your backend
    // For this example, we'll just simulate a successful login/signup
    const token = 'fake-jwt-token';
    localStorage.setItem('token', token);
    onLogin(token);
  };

  return (
    <Card className="w-[350px] mx-auto mt-10">
      <CardHeader>
        <CardTitle>{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email', { required: true })} />
            {errors.email && <span className="text-red-500">This field is required</span>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password', { required: true })} />
            {errors.password && <span className="text-red-500">This field is required</span>}
          </div>
          <Button type="submit" className="w-full">{isLogin ? 'Login' : 'Sign Up'}</Button>
        </form>
        <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="mt-4 w-full">
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Auth;