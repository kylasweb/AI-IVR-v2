// System Settings Types
export interface SystemSetting {
    id: string;
    key: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    category: string;
    description?: string;
    isEncrypted: boolean;
}

export interface SettingCategory {
    name: string;
    icon: any;
    description: string;
    settings: SystemSetting[];
}

export interface GitCommit {
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
}

export interface GitRelease {
    tag: string;
    name: string;
    body: string;
    date: string;
    url: string;
    isPrerelease: boolean;
}

export interface SystemSettingsState {
    categories: SettingCategory[];
    loading: boolean;
    saving: boolean;
    hasChanges: boolean;
    commits: GitCommit[];
    releases: GitRelease[];
    activeCategory: string;
    editingSettings: Set<string>;
}
