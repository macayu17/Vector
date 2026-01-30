'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useApplicationStore } from '@/store/applicationStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Settings as SettingsIcon,
    User,
    Palette,
    Download,
    Trash2,
    Moon,
    Sun,
    Check,
    Save
} from 'lucide-react';

export default function SettingsPage() {
    const { settings, updateSettings } = useSettingsStore();
    const { applications } = useApplicationStore();
    const { user } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        currency: 'USD',
        stalledDays: 14,
    });

    useEffect(() => {
        setIsMounted(true);
        setDarkMode(document.documentElement.classList.contains('dark'));

        // Get user metadata from Supabase auth
        const userEmail = user?.email || settings.email || '';
        const userFullName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
        const nameParts = userFullName.split(' ');

        setFormData({
            firstName: settings.firstName || nameParts[0] || '',
            lastName: settings.lastName || nameParts.slice(1).join(' ') || '',
            email: userEmail,
            currency: settings.currency,
            stalledDays: settings.stalledDays,
        });
    }, [settings, user]);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', String(newDarkMode));
        document.documentElement.classList.toggle('dark', newDarkMode);
    };

    const handleSave = () => {
        updateSettings(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleExport = () => {
        // Define CSV headers
        const headers = [
            'Company',
            'Job Title',
            'Status',
            'Priority',
            'Job Type',
            'Location',
            'Salary Min',
            'Salary Max',
            'Currency',
            'Applied Date',
            'Link',
            'Notes'
        ];

        // Convert applications to CSV rows
        const rows = applications.map(app => [
            app.companyName,
            app.jobTitle,
            app.status,
            app.priority,
            app.jobType,
            app.location || '',
            app.salaryMin || '',
            app.salaryMax || '',
            app.currency || 'USD',
            app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : '',
            app.jobUrl || '',
            app.notes || ''
        ].map(field => {
            // Escape quotes and wrap in quotes to handle commas and newlines
            const stringValue = String(field || '');
            return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(','));

        // Combine headers and rows
        const csvContent = [headers.join(','), ...rows].join('\n');

        // Create download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `careerflow_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isMounted) {
        return (
            <main className="flex-1 overflow-auto glass">
                <div className="max-w-2xl mx-auto p-6">
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-auto glass">
            <div className="max-w-2xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border border-border">
                            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Settings</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage your preferences
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <Card className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold">Profile</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="bg-background/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Appearance Section */}
                    <Card className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Palette className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold">Appearance</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Dark Mode</p>
                                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleDarkMode}
                                    className="gap-2"
                                >
                                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Default Currency</p>
                                    <p className="text-sm text-muted-foreground">For salary displays</p>
                                </div>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                >
                                    <SelectTrigger className="w-32 bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                        <SelectItem value="INR">INR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Stalled After</p>
                                    <p className="text-sm text-muted-foreground">Days before marking as stalled</p>
                                </div>
                                <Select
                                    value={String(formData.stalledDays)}
                                    onValueChange={(value) => setFormData({ ...formData, stalledDays: parseInt(value) })}
                                >
                                    <SelectTrigger className="w-32 bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">7 days</SelectItem>
                                        <SelectItem value="14">14 days</SelectItem>
                                        <SelectItem value="21">21 days</SelectItem>
                                        <SelectItem value="30">30 days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>

                    {/* Data Section */}
                    <Card className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Download className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold">Data</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Export Data</p>
                                    <p className="text-sm text-muted-foreground">Download your applications as CSV</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Export CSV
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-destructive">Clear Local Data</p>
                                    <p className="text-sm text-muted-foreground">Reset all stored data</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        localStorage.clear();
                                        window.location.reload();
                                    }}
                                    className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Save Button */}
                    <Button onClick={handleSave} className="w-full gap-2">
                        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Saved!' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </main>
    );
}
