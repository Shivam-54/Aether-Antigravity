'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface Country {
    name: string;
    code: string;
    flag: string;
}

interface KeyType {
    name: string;
    type: 'number' | 'text';
    placeholder: string;
    maxLength?: number;
    pattern?: string;
}

const countries: Country[] = [
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
    { name: 'France', code: '+33', flag: '🇫🇷' },
    { name: 'Japan', code: '+81', flag: '🇯🇵' },
    { name: 'China', code: '+86', flag: '🇨🇳' },
    { name: 'Brazil', code: '+55', flag: '🇧🇷' },
];

const keyTypes: KeyType[] = [
    { name: '4-Digit PIN', type: 'number', placeholder: '****', maxLength: 4, pattern: '[0-9]{4}' },
    { name: '6-Digit PIN', type: 'number', placeholder: '******', maxLength: 6, pattern: '[0-9]{6}' },
    { name: 'Alphabetical', type: 'text', placeholder: 'Enter alphabetical key', pattern: '[A-Za-z]+' },
    { name: 'Numeric', type: 'number', placeholder: 'Enter numeric key' },
];

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false); // false = Continue (primary), true = Request Access (secondary)
    const [selectedKeyType, setSelectedKeyType] = useState(keyTypes[0]);
    const [isKeyTypeDropdownOpen, setIsKeyTypeDropdownOpen] = useState(false);
    const [isForgotKeyOpen, setIsForgotKeyOpen] = useState(false);
    const [forgotKeyStep, setForgotKeyStep] = useState<'email' | 'verification' | 'newkey'>('email');
    const [forgotKeyEmail, setForgotKeyEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const keyTypeDropdownRef = useRef<HTMLDivElement>(null);

    // Form values
    const [formValues, setFormValues] = useState({
        fullName: '',
        email: '',
        authKey: '',
        age: '',
        contactNumber: '',
        continueEmail: '',
        continueAuthKey: '',
        newAuthKey: '',
        confirmAuthKey: '',
    });

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Validation functions
    const validateEmail = (email: string): string => {
        if (!email) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const validateName = (name: string): string => {
        if (!name) return 'Name is required';
        if (name.length < 2) return 'Name must be at least 2 characters';
        if (name.length > 50) return 'Name must be less than 50 characters';
        if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
        return '';
    };

    const validateAge = (age: string): string => {
        if (!age) return 'Age is required';
        const ageNum = parseInt(age);
        if (isNaN(ageNum)) return 'Age must be a number';
        if (ageNum < 18) return 'You must be at least 18 years old';
        if (ageNum > 120) return 'Please enter a valid age';
        return '';
    };

    const validatePhone = (phone: string): string => {
        if (!phone) return 'Contact number is required';
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) return 'Please enter a valid phone number (10-15 digits)';
        return '';
    };

    const validateAuthKey = (key: string, keyType: KeyType): string => {
        if (!key) return 'Authentication key is required';

        if (keyType.name === '4-Digit PIN') {
            if (!/^[0-9]{4}$/.test(key)) return 'Must be exactly 4 digits';
        } else if (keyType.name === '6-Digit PIN') {
            if (!/^[0-9]{6}$/.test(key)) return 'Must be exactly 6 digits';
        } else if (keyType.name === 'Alphabetical') {
            if (key.length < 6) return 'Must be at least 6 characters';
            if (key.length > 20) return 'Must be less than 20 characters';
            if (!/^[a-zA-Z]+$/.test(key)) return 'Can only contain letters';
        } else if (keyType.name === 'Numeric') {
            if (key.length < 6) return 'Must be at least 6 digits';
            if (key.length > 20) return 'Must be less than 20 digits';
            if (!/^[0-9]+$/.test(key)) return 'Can only contain numbers';
        }
        return '';
    };

    const validateVerificationCode = (code: string): string => {
        if (!code) return 'Verification code is required';
        if (!/^[0-9]{6}$/.test(code)) return 'Code must be exactly 6 digits';
        return '';
    };

    const handleFieldChange = (field: string, value: string) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleFieldBlur = (field: string, value: string, validator: (val: string) => string) => {
        const error = validator(value);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (keyTypeDropdownRef.current && !keyTypeDropdownRef.current.contains(event.target as Node)) {
                setIsKeyTypeDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl pointer-events-auto transition-all duration-500 ease-out"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.boxShadow = '0 0 40px 8px rgba(255, 255, 255, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)';
                            }}
                        >
                            <div className="p-8 md:p-10">
                                <div className="mb-8 text-center">
                                    <h2 className="text-3xl font-light tracking-widest text-white uppercase">Access</h2>
                                    <p className="mt-2 text-sm text-white/50 font-light tracking-wider">Access is selective.</p>
                                    <p className="mt-1 text-[10px] text-white/30 font-light tracking-wide italic">
                                        {!isNewUser ? 'Required for continued access.' : 'Requests are reviewed. Access is not guaranteed.'}
                                    </p>
                                </div>

                                {/* Toggle between Continue (Primary) and Request Access (Secondary) */}
                                <div className="flex gap-2 mb-6">
                                    {/* Continue - Primary Action */}
                                    <button
                                        type="button"
                                        onClick={() => setIsNewUser(false)}
                                        className={`flex-1 py-3 rounded-lg text-xs uppercase tracking-[0.3em] font-light transition-all ${!isNewUser
                                            ? 'bg-white/10 text-white border border-white/25 shadow-[0_0_20px_rgba(255,255,255,0.15)] duration-200'
                                            : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.04] hover:text-white/60 hover:border-white/10 duration-300'
                                            }`}
                                    >
                                        Continue
                                    </button>
                                    {/* Request Access - Secondary Action */}
                                    <button
                                        type="button"
                                        onClick={() => setIsNewUser(true)}
                                        className={`flex-1 py-3 rounded-lg text-xs uppercase tracking-[0.3em] font-light transition-all ${isNewUser
                                            ? 'bg-white/[0.06] text-white/80 border border-white/15 duration-200'
                                            : 'bg-white/[0.02] text-white/30 border border-white/[0.04] hover:bg-white/[0.03] hover:text-white/45 hover:border-white/[0.07] duration-500'
                                            }`}
                                    >
                                        Request Access
                                    </button>
                                </div>

                                {/* Request Access Form - For New Users */}
                                {isNewUser ? (
                                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formValues.fullName}
                                                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                                                onBlur={(e) => handleFieldBlur('fullName', e.target.value, validateName)}
                                                placeholder="Enter your name"
                                                className={`w-full bg-white/5 border ${errors.fullName ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none ${errors.fullName ? 'focus:border-red-500' : 'focus:border-white/30'} transition-colors tracking-wide text-sm font-light`}
                                            />
                                            {errors.fullName && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-[10px] text-red-400 ml-1 mt-1"
                                                >
                                                    {errors.fullName}
                                                </motion.div>
                                            )}
                                        </div>


                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={formValues.email}
                                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                                onBlur={(e) => handleFieldBlur('email', e.target.value, validateEmail)}
                                                placeholder="name@example.com"
                                                className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none ${errors.email ? 'focus:border-red-500' : 'focus:border-white/30'} transition-colors tracking-wide text-sm font-light`}
                                            />
                                            {errors.email && (
                                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-400 ml-1 mt-1">
                                                    {errors.email}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Authentication Key */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-1">Authentication Key</label>
                                            <div className="flex gap-2">
                                                {/* Key Type Dropdown */}
                                                <div className="relative" ref={keyTypeDropdownRef}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsKeyTypeDropdownOpen(!isKeyTypeDropdownOpen)}
                                                        className="h-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors min-w-[140px] text-white/70 text-xs font-light tracking-wide"
                                                    >
                                                        <span>{selectedKeyType.name}</span>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    <AnimatePresence>
                                                        {isKeyTypeDropdownOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="absolute top-full mt-2 left-0 w-56 rounded-xl bg-[#121212] border border-white/10 shadow-2xl z-[110] overflow-hidden"
                                                            >
                                                                {keyTypes.map((keyType) => (
                                                                    <button
                                                                        key={keyType.name}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedKeyType(keyType);
                                                                            setIsKeyTypeDropdownOpen(false);
                                                                        }}
                                                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                                                                    >
                                                                        <span className="text-sm text-white font-light">{keyType.name}</span>
                                                                        {selectedKeyType.name === keyType.name && (
                                                                            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <input
                                                    type="password"
                                                    value={formValues.authKey}
                                                    onChange={(e) => handleFieldChange('authKey', e.target.value)}
                                                    onBlur={(e) => handleFieldBlur('authKey', e.target.value, (val) => validateAuthKey(val, selectedKeyType))}
                                                    placeholder={selectedKeyType.placeholder}
                                                    maxLength={selectedKeyType.maxLength}
                                                    pattern={selectedKeyType.pattern}
                                                    className={`flex-1 bg-white/5 border ${errors.authKey ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none ${errors.authKey ? 'focus:border-red-500' : 'focus:border-white/30'} transition-colors tracking-wide text-sm font-light`}
                                                />
                                            </div>
                                            {errors.authKey && (
                                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-400 ml-1 mt-1">
                                                    {errors.authKey}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Age & Contact Channel */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-1">Age</label>
                                                <input
                                                    type="number"
                                                    value={formValues.age}
                                                    onChange={(e) => handleFieldChange('age', e.target.value)}
                                                    onBlur={(e) => handleFieldBlur('age', e.target.value, validateAge)}
                                                    placeholder="25"
                                                    className={`w-full bg-white/5 border ${errors.age ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none ${errors.age ? 'focus:border-red-500' : 'focus:border-white/30'} transition-colors tracking-wide text-sm font-light appearance-none`}
                                                />
                                                {errors.age && (
                                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-400 ml-1 mt-1 absolute">
                                                        {errors.age}
                                                    </motion.div>
                                                )}
                                            </div>
                                            <div className="col-span-2 space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-1">Contact Channel</label>
                                                <div className="flex gap-2">
                                                    {/* Country Code Dropdown */}
                                                    <div className="relative" ref={dropdownRef}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                            className="h-full bg-white/5 border border-white/10 rounded-xl px-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors min-w-[70px]"
                                                        >
                                                            <span className="text-lg leading-none">{selectedCountry.flag}</span>
                                                            <span className="text-[10px] text-white/60 font-light">{selectedCountry.code}</span>
                                                        </button>

                                                        <AnimatePresence>
                                                            {isDropdownOpen && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: 10 }}
                                                                    className="absolute bottom-full mb-2 left-0 w-64 max-h-60 overflow-y-auto rounded-xl bg-[#121212] border border-white/10 shadow-2xl z-[110] scrollbar-hide"
                                                                >
                                                                    {countries.map((country) => (
                                                                        <button
                                                                            key={country.name}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedCountry(country);
                                                                                setIsDropdownOpen(false);
                                                                            }}
                                                                            className="w-full px-4 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                                                                        >
                                                                            <span className="text-xl leading-none">{country.flag}</span>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-sm text-white font-light">{country.name}</span>
                                                                                <span className="text-[10px] text-white/40">{country.code}</span>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    <input
                                                        type="tel"
                                                        value={formValues.contactNumber}
                                                        onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
                                                        onBlur={(e) => handleFieldBlur('contactNumber', e.target.value, validatePhone)}
                                                        placeholder="98765 43210"
                                                        className={`flex-1 bg-white/5 border ${errors.contactNumber ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none ${errors.contactNumber ? 'focus:border-red-500' : 'focus:border-white/30'} transition-colors tracking-widest text-sm font-light`}
                                                    />
                                                </div>
                                                {errors.contactNumber && (
                                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-400 ml-1 mt-1">
                                                        {errors.contactNumber}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            className="w-full mt-4 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-xs uppercase tracking-[0.4em] font-light transition-all active:scale-[0.98] duration-300"
                                        >
                                            Request Access
                                        </button>
                                    </form>
                                ) : (
                                    /* Continue Form - For Existing Users */
                                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="name@example.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors tracking-wide text-sm font-light"
                                            />
                                        </div>

                                        {/* Authentication Key */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-1">Authentication Key</label>
                                            <div className="flex gap-2">
                                                {/* Key Type Dropdown */}
                                                <div className="relative" ref={keyTypeDropdownRef}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsKeyTypeDropdownOpen(!isKeyTypeDropdownOpen)}
                                                        className="h-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors min-w-[140px] text-white/70 text-xs font-light tracking-wide"
                                                    >
                                                        <span>{selectedKeyType.name}</span>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    <AnimatePresence>
                                                        {isKeyTypeDropdownOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="absolute top-full mt-2 left-0 w-56 rounded-xl bg-[#121212] border border-white/10 shadow-2xl z-[110] overflow-hidden"
                                                            >
                                                                {keyTypes.map((keyType) => (
                                                                    <button
                                                                        key={keyType.name}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedKeyType(keyType);
                                                                            setIsKeyTypeDropdownOpen(false);
                                                                        }}
                                                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                                                                    >
                                                                        <span className="text-sm text-white font-light">{keyType.name}</span>
                                                                        {selectedKeyType.name === keyType.name && (
                                                                            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <input
                                                    type={selectedKeyType.type === 'number' ? 'password' : 'password'}
                                                    placeholder={selectedKeyType.placeholder}
                                                    maxLength={selectedKeyType.maxLength}
                                                    pattern={selectedKeyType.pattern}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors tracking-wide text-sm font-light"
                                                />
                                            </div>
                                        </div>

                                        {/* Forgot Authentication Key Link */}
                                        <div className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsForgotKeyOpen(true);
                                                    setForgotKeyStep('email');
                                                    setForgotKeyEmail('');
                                                    setVerificationCode('');
                                                }}
                                                className="text-[10px] text-white/40 hover:text-white/70 transition-colors tracking-wider"
                                            >
                                                Forgot Authentication Key?
                                            </button>
                                        </div>

                                        <button
                                            className="w-full mt-4 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-xs uppercase tracking-[0.4em] font-light transition-all active:scale-[0.98] duration-300"
                                        >
                                            Continue
                                        </button>
                                    </form>
                                )}

                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Forgot Authentication Key Modal */}
            <AnimatePresence>
                {isForgotKeyOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsForgotKeyOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl pointer-events-auto"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                            }}
                        >
                            <div className="p-8 md:p-10">
                                <div className="mb-8 text-center">
                                    <h2 className="text-2xl font-light tracking-widest text-white uppercase">Recovery</h2>
                                    <p className="mt-2 text-sm text-white/50 font-light tracking-wider">
                                        {forgotKeyStep === 'email' && 'Enter your email address'}
                                        {forgotKeyStep === 'verification' && 'Verify your identity'}
                                        {forgotKeyStep === 'newkey' && 'Create new key'}
                                    </p>
                                </div>

                                {/* Step 1: Email Entry */}
                                {forgotKeyStep === 'email' && (
                                    <form className="space-y-5" onSubmit={(e) => {
                                        e.preventDefault();
                                        // Simulate sending verification code
                                        setForgotKeyStep('verification');
                                    }}>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={forgotKeyEmail}
                                                onChange={(e) => setForgotKeyEmail(e.target.value)}
                                                placeholder="name@example.com"
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors tracking-wide text-sm font-light"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-xs uppercase tracking-[0.4em] font-light transition-all active:scale-[0.98] duration-300"
                                        >
                                            Send Verification Code
                                        </button>
                                    </form>
                                )}

                                {/* Step 2: Verification Code */}
                                {forgotKeyStep === 'verification' && (
                                    <form className="space-y-5" onSubmit={(e) => {
                                        e.preventDefault();
                                        // Simulate code verification
                                        if (verificationCode.length === 6) {
                                            setForgotKeyStep('newkey');
                                        }
                                    }}>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-1">Verification Code</label>
                                            <input
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="Enter 6-digit code"
                                                maxLength={6}
                                                pattern="[0-9]{6}"
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors tracking-[0.5em] text-center text-lg font-light"
                                            />
                                            <p className="text-[10px] text-white/30 text-center mt-2 tracking-wide">
                                                Code sent to {forgotKeyEmail}
                                            </p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={verificationCode.length !== 6}
                                            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-xs uppercase tracking-[0.4em] font-light transition-all active:scale-[0.98] duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Verify Code
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForgotKeyStep('email')}
                                            className="w-full text-[10px] text-white/40 hover:text-white/70 transition-colors tracking-wider"
                                        >
                                            Use different email
                                        </button>
                                    </form>
                                )}

                                {/* Step 3: Create New Key */}
                                {forgotKeyStep === 'newkey' && (
                                    <form className="space-y-5" onSubmit={(e) => {
                                        e.preventDefault();
                                        // Simulate key creation success
                                        setIsForgotKeyOpen(false);
                                        setForgotKeyStep('email');
                                        setForgotKeyEmail('');
                                        setVerificationCode('');
                                    }}>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-1">New Authentication Key</label>
                                            <div className="flex gap-2">
                                                {/* Key Type Dropdown */}
                                                <div className="relative" ref={keyTypeDropdownRef}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsKeyTypeDropdownOpen(!isKeyTypeDropdownOpen)}
                                                        className="h-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors min-w-[140px] text-white/70 text-xs font-light tracking-wide"
                                                    >
                                                        <span>{selectedKeyType.name}</span>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    <AnimatePresence>
                                                        {isKeyTypeDropdownOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="absolute top-full mt-2 left-0 w-56 rounded-xl bg-[#121212] border border-white/10 shadow-2xl z-[120] overflow-hidden"
                                                            >
                                                                {keyTypes.map((keyType) => (
                                                                    <button
                                                                        key={keyType.name}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedKeyType(keyType);
                                                                            setIsKeyTypeDropdownOpen(false);
                                                                        }}
                                                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                                                                    >
                                                                        <span className="text-sm text-white font-light">{keyType.name}</span>
                                                                        {selectedKeyType.name === keyType.name && (
                                                                            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <input
                                                    type="password"
                                                    placeholder={selectedKeyType.placeholder}
                                                    maxLength={selectedKeyType.maxLength}
                                                    pattern={selectedKeyType.pattern}
                                                    required
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors tracking-wide text-sm font-light"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-1">Confirm New Key</label>
                                            <input
                                                type="password"
                                                placeholder={selectedKeyType.placeholder}
                                                maxLength={selectedKeyType.maxLength}
                                                pattern={selectedKeyType.pattern}
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors tracking-wide text-sm font-light"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-xs uppercase tracking-[0.4em] font-light transition-all active:scale-[0.98] duration-300"
                                        >
                                            Create New Key
                                        </button>
                                    </form>
                                )}

                                <button
                                    onClick={() => setIsForgotKeyOpen(false)}
                                    className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
