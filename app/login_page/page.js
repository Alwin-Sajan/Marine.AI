"use client";

import { Sparkles, Waves, Lock, User, Eye, EyeOff, Fish } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Demo API call simulation
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Demo credentials check
            if (formData.username === 'demo' && formData.password === 'password') {
                // Success
                console.log('Login successful!');
                // Store auth token (demo)
                localStorage.setItem('authToken', 'demo-token-12345');
                // Redirect to home
                router.push('/');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error on input change
    };

    return (
        <div className='min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900'>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Floating fish icons */}
            <div className="absolute inset-0 pointer-events-none">
                <Fish className="absolute top-20 left-1/4 w-8 h-8 text-cyan-400/20 animate-bounce" style={{ animationDuration: '3s' }} />
                <Fish className="absolute bottom-32 right-1/3 w-6 h-6 text-blue-400/20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <Waves className="absolute top-1/3 right-1/4 w-10 h-10 text-cyan-400/20 animate-pulse" />
            </div>

            {/* Header */}
            <header className='absolute top-8 left-8 z-10'>
                <a className="flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors" href="/">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg">Marine.AI</span>
                </a>
            </header>

            {/* Main Content */}
            <div className='flex items-center justify-center min-h-screen p-4'>
                <div className='w-full max-w-md'>
                    {/* Login Card */}
                    <div className='relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl'>
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-3xl blur-xl"></div>

                        <div className='relative z-10'>
                            {/* Logo/Icon */}
                            <div className='flex justify-center mb-6'>
                                <div className='relative'>
                                    <div className='absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-lg opacity-50'></div>
                                    <div className='relative bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-full'>
                                        <Waves className='w-10 h-10 text-white' />
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className='text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2'>
                                Welcome Back
                            </h1>
                            <p className='text-center text-gray-400 mb-8 text-sm'>
                                Sign in to access Marine Species Intelligence
                            </p>

                            {/* Demo Credentials Info */}
                            {/* <div className='bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 mb-6'>
                                <p className='text-cyan-300 text-xs font-medium mb-1'>🔑 Demo Credentials</p>
                                <p className='text-gray-300 text-xs'>Username: <span className='font-mono text-cyan-400'>demo</span></p>
                                <p className='text-gray-300 text-xs'>Password: <span className='font-mono text-cyan-400'>password</span></p>
                            </div> */}

                            {/* Error Message */}
                            {error && (
                                <div className='bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 animate-in fade-in'>
                                    <p className='text-red-400 text-sm text-center'>{error}</p>
                                </div>
                            )}

                            {/* Form */}
                            <div className='space-y-5'>
                                {/* Username Field */}
                                <div className='space-y-2'>
                                    <label className='text-gray-300 text-sm font-medium flex items-center gap-2'>
                                        <User className='w-4 h-4 text-cyan-400' />
                                        Username
                                    </label>
                                    <div className='relative'>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder='Enter your username'
                                            className='w-full p-3 pl-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all'
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className='space-y-2'>
                                    <label className='text-gray-300 text-sm font-medium flex items-center gap-2'>
                                        <Lock className='w-4 h-4 text-cyan-400' />
                                        Password
                                    </label>
                                    <div className='relative'>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder='Enter your password'
                                            className='w-full p-3 pl-4 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all'
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors'
                                        >
                                            {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember & Forgot */}
                                <div className='flex items-center justify-between text-sm'>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input type="checkbox" className='w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/20' />
                                        <span className='text-gray-300'>Remember me</span>
                                    </label>
                                    <a href="#" className='text-cyan-400 hover:text-cyan-300 transition-colors'>
                                        Forgot password?
                                    </a>
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className='w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2'
                                >
                                    {isLoading ? (
                                        <>
                                            <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className='w-5 h-5' />
                                            Sign In
                                        </>
                                    )}
                                </button>
                            </div>

                            <span className='hidden'>

                                {/* Divider */}
                                <div className='relative my-6'>
                                    <div className='absolute inset-0 flex items-center'>
                                        <div className='w-full border-t border-white/10'></div>
                                    </div>
                                    <div className='relative flex justify-center text-sm'>
                                        <span className='px-4 bg-transparent text-gray-500'>or continue with</span>
                                    </div>
                                </div>

                                {/* Social Login */}
                                <div className='grid grid-cols-2 gap-3'>
                                    <button className='flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-gray-300'>
                                        <svg className='w-5 h-5' viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Google
                                    </button>
                                    <button className='flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-gray-300'>
                                        <svg className='w-5 h-5' fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                        </svg>
                                        GitHub
                                    </button>
                                </div>

                            </span>


                            {/* Sign Up Link */}
                            <p className='text-center text-gray-400 text-sm mt-6'>
                                Don't have an account?{' '}
                                <a href="#" className='text-cyan-400 hover:text-cyan-300 font-medium transition-colors'>
                                    Sign up
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className='text-center text-gray-500 text-xs mt-6'>
                        © 2026 Marine.AI 
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Page;