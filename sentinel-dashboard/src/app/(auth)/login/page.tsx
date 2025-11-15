'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/hooks/use-auth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const { login, verifyMFA, isLoading, mfaRequired } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (mfaRequired) {
                // Get the MFA token from localStorage or state
                const mfaToken = localStorage.getItem('mfaToken');
                if (!mfaToken) {
                    setError('MFA token not found. Please login again.');
                    return;
                }
                await verifyMFA({ mfaToken, code: mfaCode });
                router.push('/dashboard');
            } else {
                await login({ email: username, password });
                // If MFA is required after login, the component will re-render
                if (!mfaRequired) {
                    router.push('/dashboard');
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    }; return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md">
                {/* Security Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-600 rounded-full">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Sentinel Command</h1>
                    <p className="text-slate-400">IMOS Security Operations Center</p>
                    <div className="mt-4">
                        <Badge variant="outline" className="bg-red-950 text-red-400 border-red-800">
                            DEFCON 5 - Normal Operations
                        </Badge>
                    </div>
                </div>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">
                            {mfaRequired ? 'Multi-Factor Authentication' : 'Secure Login'}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {mfaRequired
                                ? 'Enter your MFA code to complete authentication'
                                : 'Enter your credentials to access the security dashboard'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!mfaRequired ? (
                                <>
                                    <div>
                                        <Label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
                                            Username
                                        </Label>
                                        <Input
                                            id="username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                            placeholder="Enter your username"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pr-10"
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <Label htmlFor="mfa" className="block text-sm font-medium text-slate-300 mb-1">
                                        MFA Code
                                    </Label>
                                    <Input
                                        id="mfa"
                                        type="text"
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value)}
                                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-center text-lg tracking-widest"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        Enter the 6-digit code from your authenticator app
                                    </p>
                                </div>
                            )}

                            {error && (
                                <Alert className="bg-red-950 border-red-800">
                                    <AlertDescription className="text-red-400">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Authenticating...' : mfaRequired ? 'Verify MFA' : 'Login'}
                            </Button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 p-3 bg-slate-700 rounded-lg">
                            <p className="text-xs text-slate-400 text-center">
                                <Shield className="h-3 w-3 inline mr-1" />
                                This system is monitored. Unauthorized access is prohibited.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}