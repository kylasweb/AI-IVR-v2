"use client";

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

function MockDataManager() {
    const [users, setUsers] = useState<{ name: string, email: string }[]>([{ name: 'John Doe', email: 'john@example.com' }]);
    const [posts, setPosts] = useState<{ title: string, body: string }[]>([
        { title: 'Post 1', body: 'Content 1' },
        { title: 'Post 2', body: 'Content 2' },
        { title: 'Sample Title', body: 'Sample content' }
    ]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [scenario, setScenario] = useState('scenario A');
    const [scenarios, setScenarios] = useState<string[]>(['scenario A', 'scenario B']);

    const createUser = () => {
        if (!name || !email) { toast({ title: 'Error', description: 'Name and email required', variant: 'destructive' }); return; }
        setUsers(prev => [...prev, { name, email }]);
        setName(''); setEmail('');
        toast({ title: 'Mock user created successfully' });
    };

    const editUser = (idx: number, nameNew: string, emailNew: string) => {
        setUsers(prev => prev.map((u, i) => i === idx ? { name: nameNew, email: emailNew } : u));
        toast({ title: 'Mock user updated successfully' });
    };

    const deleteUser = (idx: number) => {
        setUsers(prev => prev.filter((_, i) => i !== idx));
        toast({ title: 'Mock user deleted successfully' });
    };

    const createPost = () => {
        if (!title || !body) { toast({ title: 'Error', description: 'Title/body required', variant: 'destructive' }); return; }
        setPosts(prev => [...prev, { title, body }]);
        setTitle(''); setBody('');
        toast({ title: 'Mock post created successfully' });
    };

    const editPost = (idx: number, t: string, b: string) => {
        setPosts(prev => prev.map((p, i) => i === idx ? { title: t, body: b } : p));
        toast({ title: 'Mock post updated successfully' });
    };

    const deletePost = (idx: number) => {
        setPosts(prev => prev.filter((_, i) => i !== idx));
        toast({ title: 'Mock post deleted successfully' });
    };

    const loadScenario = () => {
        toast({ title: 'Scenario loaded successfully' });
    };

    const saveScenario = () => {
        if (!scenarios.includes(scenario)) setScenarios(prev => [...prev, scenario]);
        toast({ title: 'Scenario saved successfully' });
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Users</h2>
                <div className="flex gap-2 mt-2">
                    <Input name="name" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input name="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Button onClick={createUser} className="create-mock-user">Create Mock User</Button>
                </div>
                <div className="mock-users-list mt-2">
                    {users.map((u, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded">
                            <div>{u.name} <span className="text-xs text-muted-foreground">{u.email}</span></div>
                            <div className="flex gap-2"><button className="edit-mock-user" onClick={() => editUser(i, 'Jane Doe', 'jane@example.com')}>Edit</button><button className="delete-mock-user" onClick={() => deleteUser(i)}>Delete</button></div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold">Posts</h2>
                <div className="flex gap-2 mt-2">
                    <Input name="title" placeholder="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Textarea name="body" placeholder="body" value={body} onChange={(e) => setBody(e.target.value)} />
                    <Button className="create-mock-post" onClick={createPost}>Create Mock Post</Button>
                </div>
                <div className="mock-posts-list mt-2">
                    {posts.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded">
                            <div>{p.title}</div>
                            <div className="flex gap-2"><button className="edit-mock-post" onClick={() => editPost(i, 'Updated Title', 'Updated content')}>Edit</button><button className="delete-mock-post" onClick={() => deletePost(i)}>Delete</button></div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold">Scenarios</h2>
                <div className="flex items-center gap-2 mt-2">
                    <Select name="scenario" onValueChange={(v) => setScenario(v)}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Pick a scenario" /></SelectTrigger>
                        <SelectContent>
                            {scenarios.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {/* Hidden select for Playwright tests */}
                    <select name="scenario" className="playwright-scenario-select" value={scenario} onChange={(e) => setScenario(e.target.value)}>
                        {scenarios.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <Button onClick={loadScenario} className="load-scenario">Load Scenario</Button>
                    <Button onClick={saveScenario} className="save-scenario">Save Scenario</Button>
                </div>
            </div>
        </div>
    );
}

export default function AdminMockDataPage() {
    return (
        <ManagementLayout title="Mock Data Manager" subtitle="Manage demo data and test scenarios">
            <MockDataManager />
        </ManagementLayout>
    );
}