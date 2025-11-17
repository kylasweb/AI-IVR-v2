'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Plus, Users, UserCheck, UserX, Phone, Mail, MapPin, Calendar, DollarSign, Star } from 'lucide-react';

interface CooperativeMember {
    id: string;
    userId: string;
    societyId: string;
    role: string;
    status: string;
    joinedAt: string;
    contributionAmount?: number;
    performanceRating?: number;
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    society: {
        id: string;
        name: string;
        type: string;
        region: string;
    };
}

interface CooperativeSociety {
    id: string;
    name: string;
    type: string;
    region: string;
}

const MemberManagement: React.FC = () => {
    const [members, setMembers] = useState<CooperativeMember[]>([]);
    const [societies, setSocieties] = useState<CooperativeSociety[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [editingMember, setEditingMember] = useState<CooperativeMember | null>(null);

    // Member form
    const [memberForm, setMemberForm] = useState({
        userId: '',
        societyId: '',
        role: 'member',
        contributionAmount: '',
        performanceRating: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [membersRes, societiesRes] = await Promise.all([
                fetch('/api/cooperative/members'),
                fetch('/api/cooperative/societies')
            ]);

            if (membersRes.ok) {
                const membersData = await membersRes.json();
                setMembers(membersData.data || []);
            }

            if (societiesRes.ok) {
                const societiesData = await societiesRes.json();
                setSocieties(societiesData.data || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMember = async () => {
        try {
            const response = await fetch('/api/cooperative/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...memberForm,
                    contributionAmount: memberForm.contributionAmount ? parseFloat(memberForm.contributionAmount) : undefined,
                    performanceRating: memberForm.performanceRating ? parseFloat(memberForm.performanceRating) : undefined
                })
            });

            if (response.ok) {
                setShowMemberDialog(false);
                setMemberForm({
                    userId: '',
                    societyId: '',
                    role: 'member',
                    contributionAmount: '',
                    performanceRating: ''
                });
                loadData();
            }
        } catch (error) {
            console.error('Error creating member:', error);
        }
    };

    const handleUpdateMemberStatus = async (memberId: string, status: string) => {
        try {
            const response = await fetch(`/api/cooperative/members/${memberId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                loadData();
            }
        } catch (error) {
            console.error('Error updating member status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'president': return 'bg-purple-100 text-purple-800';
            case 'secretary': return 'bg-blue-100 text-blue-800';
            case 'treasurer': return 'bg-green-100 text-green-800';
            case 'member': return 'bg-gray-100 text-gray-800';
            default: return 'bg-indigo-100 text-indigo-800';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Users className="h-6 w-6 text-blue-500" />
                        Member Management
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Manage cooperative society members and their participation
                    </p>
                </div>

                <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Cooperative Member</DialogTitle>
                            <DialogDescription>
                                Add a new member to a cooperative society
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="member-society">Society</Label>
                                <Select value={memberForm.societyId} onValueChange={(value) => setMemberForm({ ...memberForm, societyId: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select society" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {societies.map((society) => (
                                            <SelectItem key={society.id} value={society.id}>
                                                {society.name} ({society.region})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="member-user">User ID</Label>
                                <Input
                                    id="member-user"
                                    value={memberForm.userId}
                                    onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
                                    placeholder="Enter user ID"
                                />
                            </div>
                            <div>
                                <Label htmlFor="member-role">Role</Label>
                                <Select value={memberForm.role} onValueChange={(value) => setMemberForm({ ...memberForm, role: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="treasurer">Treasurer</SelectItem>
                                        <SelectItem value="secretary">Secretary</SelectItem>
                                        <SelectItem value="president">President</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="member-contribution">Monthly Contribution (₹)</Label>
                                    <Input
                                        id="member-contribution"
                                        type="number"
                                        value={memberForm.contributionAmount}
                                        onChange={(e) => setMemberForm({ ...memberForm, contributionAmount: e.target.value })}
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="member-rating">Performance Rating (1-5)</Label>
                                    <Input
                                        id="member-rating"
                                        type="number"
                                        min="1"
                                        max="5"
                                        step="0.1"
                                        value={memberForm.performanceRating}
                                        onChange={(e) => setMemberForm({ ...memberForm, performanceRating: e.target.value })}
                                        placeholder="Enter rating"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateMember}>Add Member</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Members Overview</CardTitle>
                    <CardDescription>
                        Total members: {members.length} | Active: {members.filter(m => m.status === 'active').length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Society</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Contribution</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium">{member.user.name}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {member.user.email}
                                            </div>
                                            {member.user.phone && (
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {member.user.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium">{member.society.name}</div>
                                            <div className="text-sm text-muted-foreground">{member.society.type} • {member.society.region}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getRoleColor(member.role)}>
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(member.status)}>
                                            {member.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {member.contributionAmount ? (
                                            <span className="font-medium">₹{member.contributionAmount.toLocaleString()}</span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {member.performanceRating ? (
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{member.performanceRating}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {new Date(member.joinedAt).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {member.status === 'active' ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleUpdateMemberStatus(member.id, 'inactive')}
                                                >
                                                    <UserX className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleUpdateMemberStatus(member.id, 'active')}
                                                >
                                                    <UserCheck className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default MemberManagement;