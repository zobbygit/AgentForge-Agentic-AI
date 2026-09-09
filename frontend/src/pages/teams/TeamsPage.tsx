import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  X,
  Copy,
  Crown,
  Shield,
  Eye,
  Trash2,
  UserPlus,
  FolderKanban,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const ROLE_META: Record<string, { icon: any; color: string; label: string }> = {
  OWNER: {
    icon: Crown,
    color: 'text-amber-400',
    label: 'Owner'
  },
  EDITOR: {
    icon: Shield,
    color: 'text-indigo-400',
    label: 'Editor'
  },
  VIEWER: {
    icon: Eye,
    color: 'text-slate-400',
    label: 'Viewer'
  },
};

export default function TeamsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await api.get('/teams');
      return data.data.teams;
    },
  });

  const createTeam = useMutation({
    mutationFn: (name: string) => api.post('/teams', { name }),

    onSuccess: () => {
      toast.success('Team created');
      qc.invalidateQueries({ queryKey: ['teams'] });
      setShowCreate(false);
      setTeamName('');
    },
  });

  const joinTeam = useMutation({
    mutationFn: (code: string) =>
      api.post('/teams/join', { inviteCode: code }),

    onSuccess: () => {
      toast.success('Joined team');
      qc.invalidateQueries({ queryKey: ['teams'] });
      setShowJoin(false);
      setInviteCode('');
    },

    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message || 'Invalid invite code'
      ),
  });

  const updateRole = useMutation({
    mutationFn: ({ teamId, memberId, role }: any) =>
      api.put(`/teams/${teamId}/members`, {
        memberId,
        role
      }),

    onSuccess: () => {
      toast.success('Role updated');
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const removeMember = useMutation({
    mutationFn: ({ teamId, memberId }: any) =>
      api.delete(`/teams/${teamId}/members/${memberId}`),

    onSuccess: () => {
      toast.success('Member removed');
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/teams/${id}`),

    onSuccess: () => {
      toast.success('Team deleted');
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const teams = data || [];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Teams
          </h1>

          <p className="text-slate-400 text-sm mt-0.5">
            Collaborate on projects with role-based access
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowJoin(true)}
            className="forge-btn-secondary text-sm inline-flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            <UserPlus size={15} />
            Join
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="forge-btn-primary text-sm inline-flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            <Plus size={15} />
            New Team
          </button>
        </div>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="forge-card p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white">
                  New Team
                </h3>

                <button
                  onClick={() => setShowCreate(false)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Team name"
                className="forge-input text-sm mb-4"
                onKeyDown={e =>
                  e.key === 'Enter' &&
                  teamName &&
                  createTeam.mutate(teamName)
                }
              />

              <button
                onClick={() =>
                  teamName && createTeam.mutate(teamName)
                }
                disabled={!teamName || createTeam.isPending}
                className="forge-btn-primary w-full text-sm"
              >
                {createTeam.isPending ? 'Creating...' : 'Create Team'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="forge-card p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white">
                  Join Team
                </h3>

                <button
                  onClick={() => setShowJoin(false)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <input
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                placeholder="Invite code"
                className="forge-input text-sm mb-4 font-mono"
                onKeyDown={e =>
                  e.key === 'Enter' &&
                  inviteCode &&
                  joinTeam.mutate(inviteCode)
                }
              />

              <button
                onClick={() =>
                  inviteCode && joinTeam.mutate(inviteCode)
                }
                disabled={!inviteCode || joinTeam.isPending}
                className="forge-btn-primary w-full text-sm"
              >
                {joinTeam.isPending ? 'Joining...' : 'Join Team'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="forge-card h-32 animate-pulse"
            />
          ))}
        </div>
      ) : teams.length === 0 ? (

        /* Empty state */
        <div className="forge-card p-8 sm:p-12 text-center">
          <Users
            size={32}
            className="text-indigo-400 mx-auto mb-4"
          />

          <p className="text-slate-300 font-medium mb-2">
            No teams yet
          </p>

          <p className="text-slate-500 text-sm">
            Create a team or join one with an invite code
          </p>
        </div>

      ) : (

        /* Teams */
        <div className="space-y-4">

          {teams.map((team: any) => {

            const myMembership = team.members.find(
              (m: any) => m.userId._id === user?._id
            );

            const isOwner = myMembership?.role === 'OWNER';

            return (
              <div
                key={team._id}
                className="forge-card p-4 sm:p-5"
              >

                {/* Team header */}
                <div className="flex items-start justify-between gap-3 mb-4">

                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold text-white truncate">
                      {team.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500">
                        Invite code:
                      </span>

                      <code className="text-xs bg-white/[0.05] px-2 py-0.5 rounded text-indigo-300 font-mono">
                        {team.inviteCode}
                      </code>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            team.inviteCode
                          );

                          toast.success('Copied!');
                        }}
                        className="text-slate-500 hover:text-indigo-400 transition-colors"
                        title="Copy invite code"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => {
                        if (confirm('Delete this team?')) {
                          deleteTeam.mutate(team._id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                      title="Delete team"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Members */}
                <div className="space-y-2">

                  {team.members.map((m: any) => {
                    const meta = ROLE_META[m.role];
                    const Icon = meta.icon;

                    return (
                      <div
                        key={m.userId._id}
                        className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                      >

                        {/* Avatar */}
                        <div className="w-8 h-8 bg-indigo-500/15 rounded-full flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                          {m.userId.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        {/* User info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-300 truncate">
                            {m.userId.name}
                          </p>

                          <p className="text-xs text-slate-500 truncate">
                            {m.userId.email}
                          </p>
                        </div>

                        {/* Role */}
                        <span
                          className={`flex items-center gap-1 text-xs ${meta.color} flex-shrink-0`}
                        >
                          <Icon size={12} />
                          {meta.label}
                        </span>

                        {/* Owner controls */}
                        {isOwner && m.role !== 'OWNER' && (
                          <div className="flex items-center gap-1 w-full sm:w-auto sm:flex-shrink-0 pl-11 sm:pl-0">

                            <select
                              value={m.role}
                              onChange={e =>
                                updateRole.mutate({
                                  teamId: team._id,
                                  memberId: m.userId._id,
                                  role: e.target.value
                                })
                              }
                              className="text-xs bg-white/[0.05] border border-white/[0.1] rounded px-2 py-1 text-slate-300 outline-none focus:border-indigo-500/40"
                            >
                              <option value="VIEWER">
                                Viewer
                              </option>

                              <option value="EDITOR">
                                Editor
                              </option>
                            </select>

                            <button
                              onClick={() =>
                                removeMember.mutate({
                                  teamId: team._id,
                                  memberId: m.userId._id
                                })
                              }
                              className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                              title="Remove member"
                            >
                              <X size={12} />
                            </button>

                          </div>
                        )}

                      </div>
                    );
                  })}

                </div>

                {/* Project link */}
                <Link
                  to="/projects"
                  className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-white/[0.06] text-sm text-indigo-400 hover:text-indigo-300 transition-colors group"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <FolderKanban
                      size={14}
                      className="flex-shrink-0"
                    />

                    <span className="truncate">
                      {isOwner
                        ? 'Assign a project to this team'
                        : 'View shared projects'}
                    </span>
                  </span>

                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform flex-shrink-0"
                  />
                </Link>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}