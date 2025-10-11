export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  isSystem: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  path: string;
  description: string;
  requiresAuth: boolean;
  requiredPermissions: string[];
}

export interface AccessLog {
  id: string;
  userId: string;
  resource: string;
  action: string;
  granted: boolean;
  reason?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export class RBACService {
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private users: Map<string, User> = new Map();
  private resources: Map<string, Resource> = new Map();
  private accessLogs: AccessLog[] = [];

  constructor() {
    this.initializeSystemRoles();
    this.initializeSystemPermissions();
    this.initializeSystemResources();
  }

  private initializeSystemRoles(): void {
    const systemRoles: Role[] = [
      {
        id: 'super_admin',
        name: 'Super Admin',
        description: 'Full system access',
        permissions: [],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Administrative access',
        permissions: [],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Management access',
        permissions: [],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'agent',
        name: 'Agent',
        description: 'Agent access',
        permissions: [],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access',
        permissions: [],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    systemRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  private initializeSystemPermissions(): void {
    const systemPermissions: Permission[] = [
      // User management
      { id: 'user.create', name: 'Create User', resource: 'user', action: 'create', description: 'Create new users', isSystem: true },
      { id: 'user.read', name: 'Read User', resource: 'user', action: 'read', description: 'View user information', isSystem: true },
      { id: 'user.update', name: 'Update User', resource: 'user', action: 'update', description: 'Update user information', isSystem: true },
      { id: 'user.delete', name: 'Delete User', resource: 'user', action: 'delete', description: 'Delete users', isSystem: true },
      
      // Role management
      { id: 'role.create', name: 'Create Role', resource: 'role', action: 'create', description: 'Create new roles', isSystem: true },
      { id: 'role.read', name: 'Read Role', resource: 'role', action: 'read', description: 'View role information', isSystem: true },
      { id: 'role.update', name: 'Update Role', resource: 'role', action: 'update', description: 'Update role information', isSystem: true },
      { id: 'role.delete', name: 'Delete Role', resource: 'role', action: 'delete', description: 'Delete roles', isSystem: true },
      
      // IVR management
      { id: 'ivr.configure', name: 'Configure IVR', resource: 'ivr', action: 'configure', description: 'Configure IVR settings', isSystem: true },
      { id: 'ivr.monitor', name: 'Monitor IVR', resource: 'ivr', action: 'monitor', description: 'Monitor IVR activity', isSystem: true },
      { id: 'ivr.analytics', name: 'View IVR Analytics', resource: 'ivr', action: 'analytics', description: 'View IVR analytics', isSystem: true },
      
      // Call management
      { id: 'call.listen', name: 'Listen to Calls', resource: 'call', action: 'listen', description: 'Listen to call recordings', isSystem: true },
      { id: 'call.download', name: 'Download Calls', resource: 'call', action: 'download', description: 'Download call recordings', isSystem: true },
      { id: 'call.delete', name: 'Delete Calls', resource: 'call', action: 'delete', description: 'Delete call recordings', isSystem: true },
      
      // Analytics
      { id: 'analytics.view', name: 'View Analytics', resource: 'analytics', action: 'view', description: 'View analytics data', isSystem: true },
      { id: 'analytics.export', name: 'Export Analytics', resource: 'analytics', action: 'export', description: 'Export analytics data', isSystem: true },
      
      // System management
      { id: 'system.configure', name: 'Configure System', resource: 'system', action: 'configure', description: 'Configure system settings', isSystem: true },
      { id: 'system.logs', name: 'View System Logs', resource: 'system', action: 'logs', description: 'View system logs', isSystem: true },
      { id: 'system.backup', name: 'Backup System', resource: 'system', action: 'backup', description: 'Create system backups', isSystem: true }
    ];

    systemPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });

    // Assign permissions to roles
    this.assignPermissionsToRole('super_admin', systemPermissions.map(p => p.id));
    this.assignPermissionsToRole('admin', systemPermissions.filter(p => !p.resource.includes('system')).map(p => p.id));
    this.assignPermissionsToRole('manager', systemPermissions.filter(p => 
      !['user.delete', 'role.delete', 'system.configure', 'system.backup'].includes(p.id)
    ).map(p => p.id));
    this.assignPermissionsToRole('agent', systemPermissions.filter(p => 
      ['ivr.monitor', 'call.listen', 'analytics.view'].includes(p.id)
    ).map(p => p.id));
    this.assignPermissionsToRole('viewer', systemPermissions.filter(p => 
      p.action === 'read' || p.action === 'view' || p.action === 'monitor'
    ).map(p => p.id));
  }

  private initializeSystemResources(): void {
    const systemResources: Resource[] = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        type: 'page',
        path: '/dashboard',
        description: 'Main dashboard',
        requiresAuth: true,
        requiredPermissions: ['analytics.view']
      },
      {
        id: 'users',
        name: 'User Management',
        type: 'page',
        path: '/users',
        description: 'User management page',
        requiresAuth: true,
        requiredPermissions: ['user.read']
      },
      {
        id: 'roles',
        name: 'Role Management',
        type: 'page',
        path: '/roles',
        description: 'Role management page',
        requiresAuth: true,
        requiredPermissions: ['role.read']
      },
      {
        id: 'ivr-config',
        name: 'IVR Configuration',
        type: 'page',
        path: '/ivr/config',
        description: 'IVR configuration page',
        requiresAuth: true,
        requiredPermissions: ['ivr.configure']
      },
      {
        id: 'ivr-monitor',
        name: 'IVR Monitor',
        type: 'page',
        path: '/ivr/monitor',
        description: 'IVR monitoring page',
        requiresAuth: true,
        requiredPermissions: ['ivr.monitor']
      },
      {
        id: 'analytics',
        name: 'Analytics',
        type: 'page',
        path: '/analytics',
        description: 'Analytics page',
        requiresAuth: true,
        requiredPermissions: ['analytics.view']
      },
      {
        id: 'system-settings',
        name: 'System Settings',
        type: 'page',
        path: '/system/settings',
        description: 'System settings page',
        requiresAuth: true,
        requiredPermissions: ['system.configure']
      }
    ];

    systemResources.forEach(resource => {
      this.resources.set(resource.id, resource);
    });
  }

  // User management
  async createUser(userData: {
    email: string;
    name: string;
    roles: string[];
  }): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: userData.email,
      name: userData.name,
      roles: userData.roles,
      permissions: await this.getUserPermissions(userData.roles),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);
    return user;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    
    if (updates.roles) {
      updatedUser.permissions = await this.getUserPermissions(updates.roles);
    }

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is system user
    const systemRoles = Array.from(this.roles.values()).filter(r => r.isSystem);
    const hasSystemRole = user.roles.some(roleId => 
      systemRoles.some(r => r.id === roleId)
    );

    if (hasSystemRole) {
      throw new Error('Cannot delete system user');
    }

    this.users.delete(userId);
  }

  async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    return user || null;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Role management
  async createRole(roleData: {
    name: string;
    description: string;
    permissions: string[];
  }): Promise<Role> {
    const role: Role = {
      id: crypto.randomUUID(),
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions.map(id => this.permissions.get(id)).filter(Boolean) as Permission[],
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.roles.set(role.id, role);
    return role;
  }

  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystem) {
      throw new Error('Cannot modify system role');
    }

    const updatedRole = { ...role, ...updates, updatedAt: new Date() };
    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  async deleteRole(roleId: string): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystem) {
      throw new Error('Cannot delete system role');
    }

    this.roles.delete(roleId);
  }

  async getRole(roleId: string): Promise<Role | null> {
    return this.roles.get(roleId) || null;
  }

  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const permissions = permissionIds
      .map(id => this.permissions.get(id))
      .filter(Boolean) as Permission[];

    role.permissions = permissions;
    role.updatedAt = new Date();

    // Update all users with this role
    for (const user of this.users.values()) {
      if (user.roles.includes(roleId)) {
        user.permissions = await this.getUserPermissions(user.roles);
      }
    }
  }

  // Permission management
  async createPermission(permissionData: {
    name: string;
    resource: string;
    action: string;
    description: string;
  }): Promise<Permission> {
    const permission: Permission = {
      id: `${permissionData.resource}.${permissionData.action}`,
      name: permissionData.name,
      resource: permissionData.resource,
      action: permissionData.action,
      description: permissionData.description,
      isSystem: false
    };

    this.permissions.set(permission.id, permission);
    return permission;
  }

  async getPermission(permissionId: string): Promise<Permission | null> {
    return this.permissions.get(permissionId) || null;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values());
  }

  // Access control
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.isActive) {
      return false;
    }

    return user.permissions.includes(permission);
  }

  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.isActive) {
      return false;
    }

    return permissions.some(permission => user.permissions.includes(permission));
  }

  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.isActive) {
      return false;
    }

    return permissions.every(permission => user.permissions.includes(permission));
  }

  async hasRole(userId: string, roleId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.isActive) {
      return false;
    }

    return user.roles.includes(roleId);
  }

  async hasAnyRole(userId: string, roleIds: string[]): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.isActive) {
      return false;
    }

    return roleIds.some(roleId => user.roles.includes(roleId));
  }

  async canAccessResource(userId: string, resourceId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.isActive) {
      return false;
    }

    const resource = this.resources.get(resourceId);
    if (!resource) {
      return false;
    }

    if (!resource.requiresAuth) {
      return true;
    }

    return this.hasAllPermissions(userId, resource.requiredPermissions);
  }

  // Access logging
  async logAccess(accessData: {
    userId: string;
    resource: string;
    action: string;
    granted: boolean;
    reason?: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    const log: AccessLog = {
      id: crypto.randomUUID(),
      ...accessData,
      timestamp: new Date()
    };

    this.accessLogs.push(log);

    // Keep only last 10000 logs
    if (this.accessLogs.length > 10000) {
      this.accessLogs = this.accessLogs.slice(-10000);
    }
  }

  async getAccessLogs(filters?: {
    userId?: string;
    resource?: string;
    granted?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AccessLog[]> {
    let logs = [...this.accessLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.resource) {
        logs = logs.filter(log => log.resource === filters.resource);
      }
      if (filters.granted !== undefined) {
        logs = logs.filter(log => log.granted === filters.granted);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Helper methods
  private async getUserPermissions(roleIds: string[]): Promise<string[]> {
    const permissions = new Set<string>();

    for (const roleId of roleIds) {
      const role = this.roles.get(roleId);
      if (role) {
        role.permissions.forEach(permission => {
          permissions.add(permission.id);
        });
      }
    }

    return Array.from(permissions);
  }

  // Analytics
  async getAccessAnalytics(): Promise<{
    totalAccessAttempts: number;
    grantedAccess: number;
    deniedAccess: number;
    topResources: { resource: string; count: number }[];
    topUsers: { userId: string; count: number }[];
    accessByHour: { hour: number; count: number }[];
  }> {
    const totalAccessAttempts = this.accessLogs.length;
    const grantedAccess = this.accessLogs.filter(log => log.granted).length;
    const deniedAccess = totalAccessAttempts - grantedAccess;

    // Top resources
    const resourceCounts: { [resource: string]: number } = {};
    this.accessLogs.forEach(log => {
      resourceCounts[log.resource] = (resourceCounts[log.resource] || 0) + 1;
    });
    const topResources = Object.entries(resourceCounts)
      .map(([resource, count]) => ({ resource, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top users
    const userCounts: { [userId: string]: number } = {};
    this.accessLogs.forEach(log => {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });
    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Access by hour
    const hourCounts: { [hour: number]: number } = {};
    this.accessLogs.forEach(log => {
      const hour = log.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const accessByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourCounts[i] || 0
    }));

    return {
      totalAccessAttempts,
      grantedAccess,
      deniedAccess,
      topResources,
      topUsers,
      accessByHour
    };
  }

  // Export/Import
  async exportRoles(): Promise<string> {
    const roles = Array.from(this.roles.values()).filter(role => !role.isSystem);
    return JSON.stringify(roles, null, 2);
  }

  async importRoles(rolesData: string): Promise<void> {
    const roles = JSON.parse(rolesData);
    
    for (const roleData of roles) {
      const role: Role = {
        ...roleData,
        id: crypto.randomUUID(),
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.roles.set(role.id, role);
    }
  }
}