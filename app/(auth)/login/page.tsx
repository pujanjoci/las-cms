import LoginForm from './login-form';

export const metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal overflow-hidden border border-border">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-display text-primary">CMS Portal</h1>
            <p className="text-text-secondary mt-3">Sign in to your account</p>
          </div>
          <LoginForm />
        </div>
        <div className="bg-surface-raised px-8 py-4 text-center text-xs text-text-muted border-t border-border">
          <p>&copy; {new Date().getFullYear()} CMS Development Bank Ltd. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
