'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Plus, 
  Shield, 
  Settings as EditIcon, 
  Trash2, 
  Search,
  MoreHorizontal,
  Star,
  User,
  Mail,
  Clock as CalendarIcon,
  CheckCircle,
  XCircle,
  Settings,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);

  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    roleIds: [] as string[]
  });

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockPermissions: Permission[] = [
        { id: '1', name: 'user.read', category: 'User Management', description: 'View user information' },
        { id: '2', name: 'user.create', category: 'User Management', description: 'Create new users' },
        { id: '3', name: 'user.update', category: 'User Management', description: 'Update user information' },
        { id: '4', name: 'user.delete', category: 'User Management', description: 'Delete users' },
        { id: '5', name: 'role.read', category: 'Role Management', description: 'View roles and permissions' },
        { id: '6', name: 'role.manage', category: 'Role Management', description: 'Create and modify roles' },
        { id: '7', name: 'analytics.view', category: 'Analytics', description: 'View analytics dashboards' },
        { id: '8', name: 'analytics.export', category: 'Analytics', description: 'Export analytics data' },
        { id: '9', name: 'ivr.config', category: 'IVR', description: 'Configure IVR workflows' },
        { id: '10', name: 'ivr.manage', category: 'IVR', description: 'Manage IVR sessions and calls' },
        { id: '11', name: 'system.settings', category: 'System', description: 'Access system settings' },
        { id: '12', name: 'system.logs', category: 'System', description: 'View system logs and diagnostics' }
      ];

      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'Super Admin',
          description: 'Full system access with all permissions',
          permissions: mockPermissions.map(p => p.id),
          isSystem: true
        },
        {
          id: '2',
          name: 'Administrator',
          description: 'Administrative access to most features',
          permissions: ['1', '2', '3', '5', '7', '8', '9', '10', '11'],
          isSystem: true
        },
        {
          id: '3',
          name: 'Manager',
          description: 'Manage IVR operations and view analytics',
          permissions: ['1', '5', '7', '9', '10'],
          isSystem: false
        },
        {
          id: '4',
          name: 'Operator',
          description: 'Basic IVR operation access',
          permissions: ['7', '10'],
          isSystem: false
        }
      ];

      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@fairgo-imos.com',
          name: 'System Administrator',
          roles: [mockRoles[0]],
          isActive: true,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        },
        {
          id: '2',
          email: 'kailaspnair@yahoo.com',
          name: 'Kailas P Nair',
          roles: [mockRoles[1]],
          isActive: true,
          lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
        },
        {
          id: '3',
          email: 'manager@fairgo-imos.com',
          name: 'Operations Manager',
          roles: [mockRoles[2]],
          isActive: true,
          lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
        },
        {
          id: '4',
          email: 'operator@fairgo-imos.com',
          name: 'Call Operator',
          roles: [mockRoles[3]],
          isActive: false,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      ];

      setPermissions(mockPermissions);
      setRoles(mockRoles);
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      if (!newUser.email || !newUser.name) {
        toast({
          title: 'Error',
          description: 'Email and name are required',
          variant: 'destructive'
        });
        return;
      }

      const selectedRoles = roles.filter(role => newUser.roleIds.includes(role.id));
      
      const user: User = {
        id: Date.now().toString(),
        email: newUser.email,
        name: newUser.name,
        roles: selectedRoles,
        isActive: true,
        createdAt: new Date()
      };

      setUsers(prev => [...prev, user]);
      setNewUser({ email: '', name: '', roleIds: [] });
      setShowCreateUser(false);

      toast({
        title: 'User Created',
        description: `User ${user.name} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive'
      });
    }
  };

  const createRole = async () => {
    try {
      if (!newRole.name) {
        toast({
          title: 'Error',
          description: 'Role name is required',
          variant: 'destructive'
        });
        return;
      }

      const role: Role = {
        id: Date.now().toString(),
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        isSystem: false
      };

      setRoles(prev => [...prev, role]);
      setNewRole({ name: '', description: '', permissions: [] });
      setShowCreateRole(false);

      toast({
        title: 'Role Created',
        description: `Role ${role.name} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create role',
        variant: 'destructive'
      });
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isActive: !user.isActive }
          : user
      ));

      const user = users.find(u => u.id === userId);
      toast({
        title: 'User Updated',
        description: `User ${user?.name} has been ${user?.isActive ? 'deactivated' : 'activated'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast({
          title: 'User Deleted',
          description: 'User has been deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive'
        });
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.roles.some(role => role.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage users, roles, and permissions for the IVR system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                New Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new role with specific permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Content Manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-description">Description</Label>
                  <Input
                    id="role-description"
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the role"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <ScrollArea className="h-64 border rounded-md p-4">
                    {Object.entries(permissionsByCategory).map(([category, perms]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {perms.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission.id}
                                checked={newRole.permissions.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  setNewRole(prev => ({
                                    ...prev,
                                    permissions: checked
                                      ? [...prev.permissions, permission.id]
                                      : prev.permissions.filter(p => p !== permission.id)
                                  }));
                                }}
                              />
                              <div>
                                <label 
                                  htmlFor={permission.id} 
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {permission.name}
                                </label>
                                <p className="text-xs text-gray-600">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateRole(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createRole}>Create Role</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with assigned roles
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-name">Full Name</Label>
                  <Input
                    id="user-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assign Roles</Label>
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={newUser.roleIds.includes(role.id)}
                          onCheckedChange={(checked) => {
                            setNewUser(prev => ({
                              ...prev,
                              roleIds: checked
                                ? [...prev.roleIds, role.id]
                                : prev.roleIds.filter(id => id !== role.id)
                            }));
                          }}
                        />
                        <div>
                          <label 
                            htmlFor={`role-${role.id}`} 
                            className="text-sm font-medium cursor-pointer"
                          >
                            {role.name}
                          </label>
                          {role.description && (
                            <p className="text-xs text-gray-600">{role.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createUser}>Create User</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {users.filter(u => u.isActive).length} Active
          </Badge>
          <Badge variant="outline">
            {users.length} Total Users
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>Manage user accounts and their access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          {user.isActive ? (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Shield className="h-3 w-3" />
                            {user.roles.map(role => role.name).join(', ')}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            Last login: {formatLastLogin(user.lastLogin)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.isActive ? (
                          <XCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <EditIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                        disabled={user.roles.some(role => role.isSystem)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {role.isSystem ? (
                        <Star className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <Shield className="h-5 w-5 text-blue-600" />
                      )}
                      {role.name}
                    </div>
                    {role.isSystem && (
                      <Badge variant="secondary">System Role</Badge>
                    )}
                  </CardTitle>
                  {role.description && (
                    <CardDescription>{role.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Permissions</span>
                      <Badge variant="outline">{role.permissions.length}</Badge>
                    </div>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {role.permissions.map((permId) => {
                          const permission = permissions.find(p => p.id === permId);
                          return permission ? (
                            <div key={permission.id} className="text-xs text-gray-600">
                              • {permission.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </ScrollArea>
                    {!role.isSystem && (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <EditIcon className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}