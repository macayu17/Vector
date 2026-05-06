'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCalendarStore, EventType } from '@/store/calendarStore';
import { useApplicationStore } from '@/store/applicationStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    Building2,
    Check,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Video,
    FileText,
    Bell,
    MessageSquare
} from 'lucide-react';

const EVENT_TYPES: { value: EventType; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'interview', label: 'Interview', icon: <Video className="w-4 h-4" />, color: 'text-[#c14f3c] bg-transparent border-[#c14f3c]/50' },
    { value: 'oa', label: 'Online Assessment', icon: <FileText className="w-4 h-4" />, color: 'text-primary bg-transparent border-primary/50' },
    { value: 'deadline', label: 'Deadline', icon: <Bell className="w-4 h-4" />, color: 'text-[#d69f57] bg-transparent border-[#d69f57]/50' },
    { value: 'followup', label: 'Follow Up', icon: <MessageSquare className="w-4 h-4" />, color: 'text-[#7f8f69] bg-transparent border-[#7f8f69]/50' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
    const { events, addEvent, toggleCompleted, deleteEvent } = useCalendarStore();
    const { applications } = useApplicationStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const [newEvent, setNewEvent] = useState({
        companyName: '',
        title: '',
        type: 'interview' as EventType,
        date: '',
        time: '',
        notes: '',
    });

    useEffect(() => {
        const frame = requestAnimationFrame(() => setIsMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get events for current month
    const getEventsForDate = (date: Date) => {
        return events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    // Get upcoming events (next 7 days)
    const upcomingEvents = events
        .filter(e => {
            const eventDate = new Date(e.date);
            eventDate.setHours(0, 0, 0, 0);
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return eventDate >= today && eventDate <= weekFromNow && !e.completed;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate calendar days
    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const handleAddEvent = () => {
        if (!newEvent.companyName || !newEvent.title || !newEvent.date) return;

        addEvent({
            id: uuidv4(),
            companyName: newEvent.companyName,
            title: newEvent.title,
            type: newEvent.type,
            date: new Date(newEvent.date),
            time: newEvent.time || undefined,
            notes: newEvent.notes || undefined,
            completed: false,
        });

        setNewEvent({
            companyName: '',
            title: '',
            type: 'interview',
            date: '',
            time: '',
            notes: '',
        });
        setIsAddModalOpen(false);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const getEventTypeConfig = (type: EventType) => {
        return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0];
    };

    if (!isMounted) {
        return (
            <main className="flex-1 overflow-auto bg-background">
                <div className="max-w-6xl mx-auto p-6">
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-auto bg-background">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
                    <div>
                        <p className="editorial-label mb-1">§ V — Appointments</p>
                        <h1 className="text-3xl font-semibold">Calendar</h1>
                        <p className="text-sm text-muted-foreground">
                            Track interviews, OAs, and deadlines
                        </p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Event
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <Card className="p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold">
                                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentDate(new Date())}
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="editorial-label text-center text-[10px] py-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth().map((day, index) => {
                                if (!day) {
                                    return <div key={`empty-${index}`} className="aspect-square" />;
                                }

                                const dayEvents = getEventsForDate(day);
                                const isToday = day.toDateString() === today.toDateString();

                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={`
                      aspect-square border border-transparent p-1 text-center relative transition-colors
                      ${isToday ? 'border-primary bg-secondary/40 text-primary' : 'hover:border-border hover:bg-secondary/20'}
                    `}
                                    >
                                        <span className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                                            {day.getDate()}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                                {dayEvents.slice(0, 3).map((_, i) => (
                                                    <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Upcoming Events */}
                    <Card className="p-6">
                        <p className="editorial-label mb-2">Next seven days</p>
                        <h2 className="text-2xl font-semibold mb-4">Upcoming</h2>

                        {upcomingEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <CalendarIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">No upcoming events</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingEvents.map((event) => {
                                    const config = getEventTypeConfig(event.type);
                                    return (
                                        <div
                                            key={event.id}
                                            className={`
                        p-3 rounded-lg border-l-3
                        event-${event.type}
                        ${event.completed ? 'opacity-50' : ''}
                      `}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className={`text-xs ${config.color}`}>
                                                            {config.icon}
                                                            <span className="ml-1">{config.label}</span>
                                                        </Badge>
                                                    </div>
                                                    <p className="font-medium text-sm truncate">{event.title}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                        <Building2 className="w-3 h-3" />
                                                        <span>{event.companyName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{formatDate(event.date)}{event.time && ` at ${event.time}`}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => toggleCompleted(event.id)}
                                                    >
                                                        <Check className={`w-4 h-4 ${event.completed ? 'text-primary' : ''}`} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive"
                                                        onClick={() => deleteEvent(event.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Add Event Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <p className="editorial-label">New appointment</p>
                            <DialogTitle className="text-2xl font-semibold">Add Event</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Event Type</Label>
                                <Select
                                    value={newEvent.type}
                                    onValueChange={(value) => setNewEvent({ ...newEvent, type: value as EventType })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EVENT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center gap-2">
                                                    {type.icon}
                                                    {type.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Company</Label>
                                <Select
                                    value={newEvent.companyName}
                                    onValueChange={(value) => setNewEvent({ ...newEvent, companyName: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {applications.map((app) => (
                                            <SelectItem key={app.id} value={app.companyName}>
                                                {app.companyName}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="other">Other...</SelectItem>
                                    </SelectContent>
                                </Select>
                                {newEvent.companyName === 'other' && (
                                    <Input
                                        placeholder="Enter company name"
                                        onChange={(e) => setNewEvent({ ...newEvent, companyName: e.target.value })}
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="e.g., Technical Interview Round 1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time (optional)</Label>
                                    <Input
                                        type="time"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Notes (optional)</Label>
                                <Input
                                    value={newEvent.notes}
                                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                                    placeholder="Any additional notes..."
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddEvent} className="flex-1">
                                    Add Event
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </main>
    );
}
