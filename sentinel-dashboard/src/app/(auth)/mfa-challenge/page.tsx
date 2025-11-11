'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/hooks/use-auth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Shield, Smartphone } from 'lucide-react';

export default function MFAChallengePage() {
    const [mfaCode, setMfaCode] = useState('');
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    const { verifyMFA, isLoading, logout } = useAuth();
    const router = useRouter();

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            logout();
            router.push('/login');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, logout, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const mfaToken = localStorage.getItem('mfaToken');
            if (!mfaToken) {
                setError('MFA session expired. Please login again.');
                setTimeout(() => router.push('/login'), 2000);
                return;
            }

            await verifyMFA({ mfaToken, code: mfaCode });
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'MFA verification failed');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md">
                {/* Security Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-600 rounded-full">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Sentinel Command</h1>
                    <p className="text-slate-400">Multi-Factor Authentication</p>
                    <div className="mt-4">
                        <Badge variant="outline" className="bg-red-950 text-red-400 border-red-800">
                            DEFCON 5 - Normal Operations
                        </Badge>
                    </div>
                </div>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Smartphone className="h-5 w-5" />
                            Verify Your Identity
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter the 6-digit code from your authenticator app
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="mfa" className="block text-sm font-medium text-slate-300 mb-1">
                                    MFA Code
                                </label>
                                <Input
                                    id="mfa"
                                    type="text"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-center text-lg tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1 text-center">
                                    Code expires in: <span className="text-red-400 font-mono">{formatTime(timeLeft)}</span>
                                </p>
                            </div>

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
                                disabled={isLoading || mfaCode.length !== 6}
                            >
                                {isLoading ? 'Verifying...' : 'Verify Code'}
                            </Button>
                        </form>

                        <div className="mt-6 space-y-3">
                            <Button
                                variant="outline"
                                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                                onClick={() => router.push('/login')}
                            >
                                Back to Login
                            </Button>

                            {/* Security Notice */}
                            <div className="p-3 bg-slate-700 rounded-lg">
                                <p className="text-xs text-slate-400 text-center">
                                    <Shield className="h-3 w-3 inline mr-1" />
                                    This system requires multi-factor authentication for security.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}