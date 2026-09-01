import { useState } from 'react';
import { Modal, Input, Button } from '@taca/ui-components';
import PropTypes from 'prop-types';

const SignInOverlay = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (email === 'test@taca.com' && password === 'password') {
        onLoginSuccess({ email, name: 'Test User' });
        onClose();
      } else {
        setError('Invalid credentials.');
      }
    } catch {
      setError('An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Welcome to Taca"
      width="max-w-[500px]"
    >
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h3 className="text-[24px] font-bold text-taca-text-main mb-2">Sign in to your account</h3>
          <p className="text-[14px] text-taca-text-muted">Enter your details to access your orders and favorites.</p>
        </div>
        
        {error && (
          <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] font-medium border border-taca-sale/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input 
            label="Email address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="flex justify-between items-center mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-taca-primary rounded-none border-taca-border focus:ring-taca-primary" />
              <span className="text-[12px] font-bold text-taca-text-main">Remember me</span>
            </label>
            <button type="button" className="text-[12px] font-bold text-taca-primary hover:text-taca-primary-hover focus:outline-none">
              Forgot password?
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center text-[14px] text-taca-text-muted mt-2">
          Don't have an account?{' '}
          <button type="button" className="font-bold text-taca-primary hover:text-taca-primary-hover focus:outline-none">
            Create an account
          </button>
        </div>
      </div>
    </Modal>
  );
};

SignInOverlay.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
};

export default SignInOverlay;
