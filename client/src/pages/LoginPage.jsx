import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { message, Form, Input } from 'antd';
import { 
  Sparkles, 
  Lock, 
  Mail,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { loginUser } from '../store/authSlice';
import { playSuccessChime } from '../utils/audio';

const springTransition = { type: 'spring', bounce: 0, duration: 0.4 };

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form] = Form.useForm();


  const handleLoginSubmit = async (values) => {
    const resultAction = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(resultAction)) {
      playSuccessChime();
      message.success('Successfully authenticated!');
      const role = resultAction.payload.user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'staff') navigate('/staff');
      else navigate('/menu');
    } else {
      message.error(resultAction.payload || 'Login failed.');
    }
  };

  return (
    <div 
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)), url('https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop&q=80')`,
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
      <div className="apple-container-wide" style={{ width: '100%', maxWidth: 1080 }}>
        
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
            backgroundColor: 'var(--color-surface-pearl)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: 'var(--product-shadow)',
            border: '1px solid var(--color-hairline)'
          }}
        >
          {/* Left Canvas: Photography Hero */}
          <div
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.75)), url('/canteen_dark_hero.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              padding: 48,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#ffffff',
              minHeight: 480
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 'var(--r-pill)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', fontSize: 12, fontWeight: 600, marginBottom: 20 }}>
                <Sparkles size={14} />
                <span>Single Sign-On Access</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 16 }}>
                Canteen Management System
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.82)', maxWidth: 360 }}>
                Touchless tableside QR dining, live kitchen display, and executive telemetry.
              </p>
            </div>

            {/* Feature highlights */}
            <div>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.6)', marginBottom: 12 }}>
                Platform Features
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Touchless QR tableside ordering',
                  'Live kitchen display & order queue',
                  'Real-time inventory management',
                  'Executive analytics dashboard'
                ].map((feat) => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.82)' }}>
                    <ShieldCheck size={13} color="var(--color-primary-on-dark)" style={{ flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Canvas: Form */}
          <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
                Sign In with Canteen Pass
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
                Enter your registered credentials to access your account.
              </p>
            </div>

            <Form form={form} layout="vertical" onFinish={handleLoginSubmit}>
              <Form.Item name="email" label="Email Address" rules={[{ required: true, message: 'Please enter your email' }]}>
                <Input prefix={<Mail size={16} color="var(--color-ink-muted-48)" />} className="search-input-apple" style={{ height: 44 }} placeholder="your@email.com" autoComplete="email" />
              </Form.Item>

              <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter your password' }]}>
                <Input.Password prefix={<Lock size={16} color="var(--color-ink-muted-48)" />} className="search-input-apple" style={{ height: 44 }} placeholder="••••••••" autoComplete="current-password" />
              </Form.Item>

              <button
                type="submit"
                disabled={loading}
                className="button-primary"
                style={{ width: '100%', height: 44, fontSize: 15, marginTop: 12 }}
              >
                {loading ? 'Authenticating…' : 'Sign In to Account →'}
              </button>
            </Form>

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="text-link" style={{ fontWeight: 600 }}>
                Register as a Diner →
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;
