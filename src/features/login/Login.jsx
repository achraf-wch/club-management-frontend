// filepath: src/features/login/Login.jsx
import React from 'react';
import { AuthLayout } from '../../Componenets';
import LoginForm from './LoginForm';

const Login = () => {
  return (
    <AuthLayout
      title="Bienvenue"
      subtitle="Connectez-vous à votre espace personnel"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;