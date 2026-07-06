'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Users, 
  Plus, 
  Trophy, 
  Flame, 
  Medal,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { 
  createGroup, 
  joinGroup, 
  getMyGroups, 
  getGroupLeaderboard 
} from '@/lib/storage';
import type { Group, LeaderboardEntry } from '@/lib/types';

export default function CommunityPage() {
  const { user } = useAuth();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [createGroupName, setCreateGroupName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Only load if user is logged in
    if (user) {
      setGroups(getMyGroups());
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      setLeaderboard(getGroupLeaderboard(selectedGroup.id));
    }
  }, [selectedGroup]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!joinCodeInput.trim()) return;
    
    const joined = joinGroup(joinCodeInput.trim().toUpperCase());
    if (joined) {
      setGroups(getMyGroups());
      setJoinCodeInput('');
      setSelectedGroup(joined);
    } else {
      setError('Invalid join code or group does not exist.');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!createGroupName.trim()) return;
    
    const group = createGroup(createGroupName.trim());
    setGroups(getMyGroups());
    setCreateGroupName('');
    setSelectedGroup(group);
  };

  if (selectedGroup) {
    return (
      <div className="max-w-md mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
        <button 
          onClick={() => setSelectedGroup(null)}
          className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Groups
        </button>

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
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-5 rounded-xl transition-colors">
              Join
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
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 rounded-xl transition-colors flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4 px-1">Your Groups</h2>
      
      {groups.length === 0 ? (
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
