"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ManagementLayout from '@/components/layout/management-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/hooks/use-user';

export default function AdminLoginPage() {
    const router = useRouter();
    const { login } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!email.trim() || !password.trim()) {
            document.body.insertAdjacentHTML('beforeend', '<div class="error-message">Email and password are required</div>');
            return;
        }

        const ok = await login(email, password);
        if (ok) {
            document.body.insertAdjacentHTML('beforeend', '<div class="success-message">Login successful</div>');
            window.location.href = '/admin/dashboard';
        } else {
            document.body.insertAdjacentHTML('beforeend', '<div class="error-message">Invalid email or password</div>');
        }
    };

    return (
        <ManagementLayout title="Admin Login" subtitle="Sign in to the admin console">
            <div className="max-w-md mx-auto py-12">
                <form className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="flex justify-between gap-2">
                        <Button type="button" onClick={handleLogin}>Login</Button>
                        <Button variant="outline" onClick={() => { setEmail(''); setPassword(''); }}>Clear</Button>
                    </div>
                </form>
            </div>
        </ManagementLayout>
    );
}
