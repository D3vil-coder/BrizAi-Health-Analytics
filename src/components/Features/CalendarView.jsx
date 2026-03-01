import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Calendar as CalendarIcon, ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon, Clock, MapPin, Edit2, List } from 'lucide-react';
import { format, parse, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore, startOfToday } from 'date-fns';

const CalendarView = () => {
    const { tasks, setTasks } = useApp();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // View Mode: 'calendar' or 'todos'
    const [viewMode, setViewMode] = useState('calendar');

    // Form State
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [newEvent, setNewEvent] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [eventColor, setEventColor] = useState('neon-blue');
    const [isTodo, setIsTodo] = useState(false); // If true, no date/time

    // Calendar Logic (Monday Start)
    const calendarStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const resetForm = () => {
        setNewEvent('');
        setStartTime('');
        setEndTime('');
        setLocation('');
        setEventColor('neon-blue');
        setEditingTaskId(null);
        setIsTodo(false);
    };

    const handleSaveTask = () => {
        if (!newEvent.trim()) return;

        const taskData = {
            id: editingTaskId || Date.now(),
            text: newEvent,
            date: isTodo ? null : format(selectedDate, 'yyyy-MM-dd'),
            completed: false,
            color: eventColor,
            start: isTodo ? '' : startTime,
            end: isTodo ? '' : endTime,
            location: location,
            isTodo: isTodo
        };

        if (editingTaskId && editingTaskId !== 'new_todo' && editingTaskId !== 'new_event') {
            setTasks(tasks.map(t => t.id === editingTaskId ? { ...t, ...taskData } : t));
        } else {
            setTasks([...tasks, taskData]);
        }

        resetForm();
    };

    const startEditing = (task) => {
        setEditingTaskId(task.id);
        setNewEvent(task.text);
        setStartTime(task.start || '');
        setEndTime(task.end || '');
        setLocation(task.location || '');
        setEventColor(task.color || 'neon-blue');
        setIsTodo(!!task.isTodo);

        if (!task.isTodo && task.date) {
            setSelectedDate(new Date(task.date));
            setViewMode('calendar');
        } else if (task.isTodo) {
            setViewMode('todos');
        }

        setIsSidebarOpen(true);
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
        if (editingTaskId === id) {
            resetForm();
        }
    };

    const getTasksForDay = (date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return tasks.filter(t => t.date === dateKey && !t.isTodo);
    };

    const getTodos = () => {
        return tasks.filter(t => t.isTodo);
    };

    const colors = {
        'neon-blue': 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
        'neon-green': 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]',
        'neon-purple': 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
        'neon-pink': 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]',
        'neon-orange': 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 animate-fade-in">
            {/* Main Calendar Grid */}
            <div className="flex-1 flex flex-col card p-0 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-lg text-white">
                        <ChevronLeft />
                    </button>

                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CalendarIcon className="text-accent-primary" size={20} />
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <button onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }} className="text-[10px] text-text-secondary hover:text-white mt-0.5">
                            Jump to Today
                        </button>
                    </div>

                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-lg text-white">
                        <ChevronRight />
                    </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="py-2 text-center text-xs font-medium text-text-secondary">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-bg-secondary">
                    {calendarDays.map((day, idx) => {
                        const dayTasks = getTasksForDay(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isDayToday = isToday(day);
                        const isPast = isBefore(day, startOfToday());

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => { setSelectedDate(day); setViewMode('calendar'); }}
                                className={`
                  min-h-[100px] border-b border-r border-white/5 p-2 cursor-pointer transition-colors relative group
                  ${!isCurrentMonth ? 'bg-black/20 text-gray-600' : 'hover:bg-white/5'}
                  ${isSelected && viewMode === 'calendar' ? 'bg-white/10' : ''}
                `}
                            >
                                {/* Past Day Cross */}
                                {isPast && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                                            <div className="w-full h-px bg-cyan-500 shadow-[0_0_5px_#06b6d4] rotate-45 absolute"></div>
                                            <div className="w-full h-px bg-cyan-500 shadow-[0_0_5px_#06b6d4] -rotate-45 absolute"></div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-1 relative z-10">
                                    <span className={`
                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                    ${isDayToday ? 'bg-accent-primary text-bg-primary shadow-[0_0_15px_rgba(0,255,157,0.5)]' : 'text-text-secondary'}
                  `}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                <div className="space-y-1 relative z-10">
                                    {dayTasks.slice(0, 3).map(task => (
                                        <div
                                            key={task.id}
                                            className={`text-[10px] px-1.5 py-0.5 rounded truncate ${task.completed ? 'opacity-50 line-through' : ''} ${colors[task.color]} text-white`}
                                        >
                                            {task.text}
                                        </div>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <div className="text-[10px] text-text-secondary pl-1">
                                            +{dayTasks.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar: Tasks & Todos */}
            <div className={`
        transition-all duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'w-96' : 'w-0 opacity-0 overflow-hidden'}
      `}>
                <div className="card h-full flex flex-col p-0 overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                        <h3 className="text-lg font-bold text-white">Tasks & Schedule</h3>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-text-secondary hover:text-white">
                            <ChevronRightIcon size={20} />
                        </button>
                    </div>

                    {/* SPLIT VIEW CONTAINER */}
                    <div className="flex-1 flex flex-col min-h-0">

                        {/* TOP HALF: TODOS */}
                        <div className="flex-1 flex flex-col min-h-0 border-b border-white/10">
                            <div className="p-3 bg-white/5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                                <h4 className="text-sm font-bold text-accent-primary uppercase tracking-wider flex items-center gap-2">
                                    <List size={16} /> Todos
                                    <span className="min-w-[18px] h-[18px] px-1 bg-accent-primary text-bg-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {getTodos().filter(t => !t.completed).length}
                                    </span>
                                </h4>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {getTodos().map(task => (
                                    <div key={task.id} className="group relative p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors
                                  ${task.completed ? 'bg-accent-primary border-accent-primary text-bg-primary' : 'border-text-secondary hover:border-white'}
                                `}
                                            >
                                                {task.completed && <Check size={10} strokeWidth={3} />}
                                            </button>
                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => startEditing(task)}>
                                                <div className={`text-sm ${task.completed ? 'text-text-secondary line-through' : 'text-white'}`}>
                                                    {task.text}
                                                </div>
                                            </div>
                                            <button onClick={() => deleteTask(task.id)} className="text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {getTodos().length === 0 && (
                                    <p className="text-xs text-text-secondary italic text-center py-4">No pending todos.</p>
                                )}
                            </div>

                            {/* Add Todo Footer */}
                            <div className="p-3 border-t border-white/10 bg-white/5">
                                {editingTaskId === 'new_todo' ? (
                                    <div className="animate-fade-in">
                                        <input
                                            type="text"
                                            value={newEvent}
                                            onChange={(e) => setNewEvent(e.target.value)}
                                            placeholder="New Todo Item..."
                                            className="input-field mb-2 text-sm"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={resetForm} className="text-xs text-text-secondary hover:text-white px-2">Cancel</button>
                                            <button onClick={handleSaveTask} className="btn-primary py-1 px-3 text-xs">Add</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { resetForm(); setEditingTaskId('new_todo'); setIsTodo(true); }}
                                        className="w-full py-2 rounded-lg border border-dashed border-white/20 text-text-secondary hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs"
                                    >
                                        <Plus size={14} /> Add Todo
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* BOTTOM HALF: SCHEDULE */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="p-3 bg-white/5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <CalendarIcon size={16} className="text-accent-primary" />
                                    {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM dd')}
                                </h4>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {getTasksForDay(selectedDate).map(task => (
                                    <div key={task.id} className="group relative p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors
                                  ${task.completed ? 'bg-accent-primary border-accent-primary text-bg-primary' : 'border-text-secondary hover:border-white'}
                                `}
                                            >
                                                {task.completed && <Check size={10} strokeWidth={3} />}
                                            </button>

                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => startEditing(task)}>
                                                <div className={`text-sm font-medium ${task.completed ? 'text-text-secondary line-through' : 'text-white'}`}>
                                                    {task.text}
                                                </div>
                                                {(task.start || task.location) && (
                                                    <div className="text-xs text-text-secondary mt-1 flex flex-col gap-0.5">
                                                        {task.start && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={10} /> {task.start} {task.end ? `- ${task.end}` : ''}
                                                            </span>
                                                        )}
                                                        {task.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={10} /> {task.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${colors[task.color]}`}></div>

                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity bg-bg-secondary rounded shadow-lg px-1">
                                                <button onClick={() => startEditing(task)} className="text-text-secondary hover:text-blue-400 p-1"><Edit2 size={12} /></button>
                                                <button onClick={() => deleteTask(task.id)} className="text-text-secondary hover:text-red-400 p-1"><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {getTasksForDay(selectedDate).length === 0 && (
                                    <p className="text-xs text-text-secondary italic text-center py-4">No events scheduled.</p>
                                )}
                            </div>

                            {/* Add Event Footer */}
                            <div className="p-3 border-t border-white/10 bg-white/5">
                                {(editingTaskId === 'new_event' || (editingTaskId && !isTodo && editingTaskId !== 'new_todo')) ? (
                                    <div className="animate-fade-in space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-accent-primary uppercase">
                                                {editingTaskId !== 'new_event' ? 'Edit Event' : 'New Event'}
                                            </span>
                                            <button onClick={resetForm} className="text-xs text-text-secondary hover:text-white">Cancel</button>
                                        </div>

                                        <input
                                            type="text"
                                            value={newEvent}
                                            onChange={(e) => setNewEvent(e.target.value)}
                                            placeholder="Event Title..."
                                            className="input-field text-sm py-2"
                                            autoFocus
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            <div
                                                className="input-field flex items-center justify-between cursor-pointer relative hover:border-accent-primary/50 transition-colors py-2 bg-bg-secondary/80"
                                                onClick={() => document.getElementById('calendar-start-time').showPicker()}
                                            >
                                                <span className="text-xs text-white font-medium">
                                                    {startTime
                                                        ? format(parse(startTime, 'HH:mm', new Date()), 'hh:mm a')
                                                        : 'Start'}
                                                </span>
                                                <Clock size={12} className="text-accent-primary" />
                                                <input
                                                    id="calendar-start-time"
                                                    type="time"
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                            </div>
                                            <div
                                                className="input-field flex items-center justify-between cursor-pointer relative hover:border-accent-primary/50 transition-colors py-2 bg-bg-secondary/80"
                                                onClick={() => document.getElementById('calendar-end-time').showPicker()}
                                            >
                                                <span className="text-xs text-white font-medium">
                                                    {endTime
                                                        ? format(parse(endTime, 'HH:mm', new Date()), 'hh:mm a')
                                                        : 'End'}
                                                </span>
                                                <Clock size={12} className="text-accent-primary" />
                                                <input
                                                    id="calendar-end-time"
                                                    type="time"
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-text-secondary shrink-0" />
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="Location (optional)"
                                                className="input-field text-xs py-1.5"
                                            />
                                        </div>

                                        <div className="flex gap-2 pt-1 items-center flex-wrap">
                                            {Object.keys(colors).map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setEventColor(c)}
                                                    className={`w-5 h-5 rounded-full ${colors[c]} ${eventColor === c ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'}`}
                                                />
                                            ))}
                                            <button
                                                onClick={handleSaveTask}
                                                className="ml-auto btn-primary py-1.5 px-3 text-xs"
                                            >
                                                {editingTaskId !== 'new_event' ? 'Update' : 'Add'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { resetForm(); setEditingTaskId('new_event'); setIsTodo(false); }}
                                        className="w-full py-2 rounded-lg border border-dashed border-white/20 text-text-secondary hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs"
                                    >
                                        <Plus size={14} /> Add Event
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-bg-secondary p-2 rounded-l-lg border-y border-l border-white/10 text-text-secondary hover:text-white"
                >
                    <ChevronLeftIcon size={20} />
                </button>
            )}
        </div>
    );
};

export default CalendarView;
