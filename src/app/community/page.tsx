'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, 
  Plus, 
  Trophy, 
  Flame, 
  Medal,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Loader2
} from 'lucide-react';
import type { Group, LeaderboardEntry } from '@/lib/types';

export default function CommunityPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [createGroupName, setCreateGroupName] = useState('');
  const [error, setError] = useState('');

  // Fetch my groups
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['groups', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: members, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);
        
      if (memberError || !members.length) return [];
      
      const groupIds = members.map(m => m.group_id);
      
      const { data: myGroups, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);
        
      if (groupError) return [];
      return myGroups as Group[];
    },
    enabled: !!user,
  });

  // Calculate leaderboard streak logic
  const calculateStreak = (workoutDates: string[]): number => {
    if (workoutDates.length === 0) return 0;
    
    // Sort descending
    const sorted = [...new Set(workoutDates)].sort((a, b) => b.localeCompare(a));
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if they worked out today or yesterday
    let lastWorkoutStr = sorted[0];
    let streak = 0;
    
    const today = new Date(todayStr);
    const lastWorkout = new Date(lastWorkoutStr);
    const diffTime = Math.abs(today.getTime() - lastWorkout.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
      return 0; // Streak broken
    }
    
    // Count consecutive days with 1 day grace
    let currentDate = new Date(sorted[0]);
    streak = 1;
    
    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i]);
      const diff = Math.ceil(Math.abs(currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        streak++;
        currentDate = prevDate;
      } else if (diff === 2) {
        streak++;
        currentDate = prevDate;
      } else {
        break; // streak broken
      }
    }
    
    return streak;
  };

  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['leaderboard', selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup) return [];
      
      const { data: members } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', selectedGroup.id);
        
      if (!members || !members.length) return [];
      
      const userIds = members.map(m => m.user_id);
      
      // Get all emails for users
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);
        
      const emailMap = new Map((usersData || []).map(u => [u.id, u.email]));
      
      // Get all workouts for these users
      const { data: workouts } = await supabase
        .from('workout_logs')
        .select('user_id, date')
        .in('user_id', userIds);
        
      const workoutsByUser = new Map<string, string[]>();
      userIds.forEach(id => workoutsByUser.set(id, []));
      
      if (workouts) {
        workouts.forEach(w => {
          workoutsByUser.get(w.user_id)?.push(w.date);
        });
      }
      
      const entries: LeaderboardEntry[] = userIds.map(uid => {
        const email = emailMap.get(uid) || 'Unknown';
        const dates = workoutsByUser.get(uid) || [];
        return {
          user_id: uid,
          email,
          current_streak: calculateStreak(dates),
          last_workout_date: dates.length > 0 ? [...dates].sort().reverse()[0] : undefined
        };
      });
      
      return entries.sort((a, b) => b.current_streak - a.current_streak);
    },
    enabled: !!selectedGroup,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not auth');
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({ name, join_code: joinCode, created_by: user.id })
        .select()
        .single();
        
      if (groupError) throw groupError;
      
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ group_id: newGroup.id, user_id: user.id });
        
      if (memberError) throw memberError;
      
      return newGroup as Group;
    },
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setCreateGroupName('');
      setSelectedGroup(newGroup);
    },
    onError: () => setError('Failed to create group')
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error('Not auth');
      
      const { data: group, error: fetchError } = await supabase
        .from('groups')
        .select('*')
        .eq('join_code', code)
        .maybeSingle();
        
      if (fetchError || !group) throw new Error('Invalid code');
      
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: user.id });
        
      // ignore unique violation (already joined)
      if (joinError && joinError.code !== '23505') throw joinError;
      
      return group as Group;
    },
    onSuccess: (joinedGroup) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setJoinCodeInput('');
      setSelectedGroup(joinedGroup);
    },
    onError: () => setError('Invalid join code or group does not exist.')
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase.from('groups').delete().eq('id', groupId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setSelectedGroup(null);
    },
    onError: () => setError('Failed to delete group. You may not have permission.')
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!joinCodeInput.trim()) return;
    joinGroupMutation.mutate(joinCodeInput.trim().toUpperCase());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!createGroupName.trim()) return;
    createGroupMutation.mutate(createGroupName.trim());
  };

  const handleDeleteGroup = () => {
    if (confirm('Are you sure you want to delete this group? This cannot be undone.')) {
      if (selectedGroup) {
        deleteGroupMutation.mutate(selectedGroup.id);
      }
    }
  };

  if (selectedGroup) {
    const isCreator = selectedGroup.created_by === user?.id;

    return (
      <div className="max-w-md mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setSelectedGroup(null)}
            className="flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Groups
          </button>
          
          {isCreator && (
            <button 
              onClick={handleDeleteGroup}
              disabled={deleteGroupMutation.isPending}
              className="flex items-center text-red-400 hover:text-red-300 transition-colors text-sm disabled:opacity-50"
              aria-label="Delete Group"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-white">{selectedGroup.name}</h1>
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Trophy className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Invite Code: <span className="font-mono text-emerald-400 font-bold tracking-wider">{selectedGroup.join_code}</span>
          </p>
        </div>

        <h2 className="text-lg font-semibold text-white mb-4 px-1">Streak Leaderboard</h2>
        
        {isLoadingLeaderboard ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, idx) => (
              <div 
                key={entry.user_id}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  entry.user_id === user?.id 
                    ? 'bg-slate-800/80 border-emerald-500/30' 
                    : 'bg-slate-900/50 border-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center">
                    {idx === 0 ? <Medal className="w-6 h-6 text-yellow-400" /> :
                     idx === 1 ? <Medal className="w-6 h-6 text-slate-300" /> :
                     idx === 2 ? <Medal className="w-6 h-6 text-amber-600" /> :
                     <span className="text-slate-500 font-medium">#{idx + 1}</span>}
                  </div>
                  <div>
                    <p className={`font-medium ${entry.user_id === user?.id ? 'text-white' : 'text-slate-300'}`}>
                      {entry.user_id === user?.id ? 'You' : entry.email.split('@')[0]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-orange-400 bg-orange-400/10 px-3 py-1 rounded-lg">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold">{entry.current_streak}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Community</h1>
          <p className="text-sm text-slate-400">Join groups and maintain your streak.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <form onSubmit={handleJoin} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-medium text-white mb-3">Join a Group</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Join Code" 
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 uppercase font-mono tracking-wider focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={joinGroupMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium px-5 rounded-xl transition-colors"
            >
              {joinGroupMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join'}
            </button>
          </div>
        </form>

        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-medium text-white mb-3">Create a Group</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Group Name" 
              value={createGroupName}
              onChange={(e) => setCreateGroupName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={createGroupMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium px-5 rounded-xl transition-colors flex items-center justify-center"
            >
              {createGroupMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4 px-1">Your Groups</h2>
      
      {isLoadingGroups ? (
        <div className="flex justify-center p-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-slate-300 font-medium mb-1">No groups yet</h3>
          <p className="text-sm text-slate-500">Create or join a group to start competing on the leaderboard.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <button 
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors group text-left"
            >
              <div>
                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{group.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Code: {group.join_code}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
