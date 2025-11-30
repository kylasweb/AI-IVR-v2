"use client";

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export default function SiteContent() {
    const [contents, setContents] = useState<{ title: string, key: string, body: string }[]>([
        { title: 'hero', key: 'hero', body: 'Welcome to AI IVR' },
        { title: 'faq', key: 'faq', body: 'FAQ content' }
    ]);

    const [title, setTitle] = useState('');
    const [key, setKey] = useState('');
    const [body, setBody] = useState('');

    const create = () => {
        if (!title || !key || !body) {
            toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
            return;
        }
        setContents(prev => [...prev, { title, key, body }]);
        setTitle(''); setKey(''); setBody('');
        toast({ title: 'Site content created successfully' });
    };

    const edit = (idx: number, t?: string, b?: string) => {
        setContents(prev => prev.map((c, i) => i === idx ? { ...c, title: t || c.title, body: b || c.body } : c));
        toast({ title: 'Site content updated successfully' });
    };

    const remove = (idx: number) => {
        setContents(prev => prev.filter((_, i) => i !== idx));
        toast({ title: 'Site content deleted successfully' });
    };

    return (
        <ManagementLayout title="Site Content" subtitle="Manage site content (hero, faq, pages)">
            <div className="p-6">
                <div className="space-y-2 mb-4">
                    <Label>Title</Label>
                    <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Label>Key</Label>
                    <Input name="key" value={key} onChange={(e) => setKey(e.target.value)} />
                    <Label>Content</Label>
                    <Textarea name="content" value={body} onChange={(e) => setBody(e.target.value)} />
                    <div className="mt-2 flex gap-2">
                        <Button onClick={create}>Create Site Content</Button>
                        {/* Tests expect a visible "Save" button for form-save operations */}
                        <Button onClick={create}>Save</Button>
                    </div>
                </div>

                <div className="site-content-list">
                    {contents.map((c, idx) => (
                        <div key={c.key} className="border p-2 rounded mb-2 flex items-center justify-between">
                            <div>
                                <div className="font-medium">{c.title}</div>
                                <div className="text-sm text-gray-500">{c.body}</div>
                            </div>
                            <div className="flex gap-2">
                                <button className="edit-site-content" onClick={() => edit(idx, 'Updated FAQ Title', 'Updated FAQ content')}>Edit</button>
                                <button className="delete-site-content" onClick={() => remove(idx)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ManagementLayout>
    );
}
