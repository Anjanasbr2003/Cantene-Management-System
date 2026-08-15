import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { message, Form, Input } from 'antd';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Sparkles, 
  Gift,
  ArrowRight
} from 'lucide-react';
import { registerUser } from '../store/authSlice';
import { playSuccessChime } from '../utils/audio';

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [form] = Form.useForm();

  const handleRegisterSubmit = async (values) => {
    const resultAction = await dispatch(registerUser(values));
    if (registerUser.fulfilled.match(resultAction)) {
      playSuccessChime();
      message.success('🎉 Account created! Welcome with 50 Loyalty Points!');
      navigate('/menu');
    } else {
      message.error(resultAction.payload || 'Registration failed.');
    }
  };

  return (
    <div 
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.70), rgba(0, 0, 0, 0.82)), url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1600&auto=format&fit=crop&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: 'calc(100vh - 96px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px'
      }}
    >
      <div className="apple-container-wide" style={{ width: '100%', maxWidth: 520 }}>
        
        <div 
          style={{
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
            backgroundColor: 'var(--color-surface-pearl)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: 'var(--product-shadow)',
            border: '1px solid var(--color-hairline)',
            padding: 44
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 'var(--r-pill)', backgroundColor: 'rgba(52, 199, 89, 0.12)', color: '#248a3d', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
              <Gift size={14} />
              <span>Includes 50 Bonus Loyalty Points</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.374px', marginBottom: 6 }}>
              Register Diner Account
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
              Join the Canteen Management System for tableside ordering and rewards.
            </p>
          </div>

          <Form form={form} layout="vertical" onFinish={handleRegisterSubmit}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter your name' }]}>
              <Input prefix={<User size={16} color="var(--color-ink-muted-48)" />} className="search-input-apple" style={{ height: 44 }} placeholder="e.g. Alex Mercer" />
            </Form.Item>

            <Form.Item name="email" label="Email Address" rules={[{ required: true, message: 'Please enter your email' }]}>
              <Input prefix={<Mail size={16} color="var(--color-ink-muted-48)" />} className="search-input-apple" style={{ height: 44 }} placeholder="alex@canteen.io" />
            </Form.Item>

            <Form.Item name="phone" label="Phone Number">
              <Input prefix={<Phone size={16} color="var(--color-ink-muted-48)" />} className="search-input-apple" style={{ height: 44 }} placeholder="+1 (555) 019-2831" />
            </Form.Item>

            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter a password' }]}>
              <Input.Password prefix={<Lock size={16} color="var(--color-ink-muted-48)" />} className="search-input-apple" style={{ height: 44 }} placeholder="••••••••" />
            </Form.Item>

            <button
              type="submit"
              disabled={loading}
              className="button-primary"
              style={{ width: '100%', height: 44, fontSize: 15, marginTop: 12 }}
            >
              {loading ? 'Creating Account…' : 'Create Diner Account →'}
            </button>
          </Form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-link" style={{ fontWeight: 600 }}>
              Sign In →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
