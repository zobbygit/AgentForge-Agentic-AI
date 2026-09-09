import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      toast.success('Welcome back!');
      // navigate('/dashboard');
      const currentUser = useAuthStore.getState().user;

navigate(
  currentUser?.role === 'ADMIN'
    ? '/admin'
    : '/dashboard'
);
    } catch (err) {
      const msg = (err as AxiosError<{ message: string }>)?.response?.data?.message || 'Login failed';
      setError(msg);
    }
  };



return (
  <div className="min-h-screen bg-[#050A18] flex items-center justify-center px-4 relative overflow-hidden">

    {/* ─────────────────────────────────────────────
        BACKGROUND ATMOSPHERE
    ───────────────────────────────────────────── */}

    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Main indigo light */}
      <motion.div
        className="absolute w-[520px] h-[520px] rounded-full bg-indigo-600/20 blur-[120px]"
        style={{ top: '-180px', left: '-160px' }}
        animate={{
          x: [0, 45, -20, 0],
          y: [0, 30, -15, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Cyan light */}
      <motion.div
        className="absolute w-[420px] h-[420px] rounded-full bg-cyan-500/15 blur-[110px]"
        style={{ bottom: '-160px', right: '-120px' }}
        animate={{
          x: [0, -40, 20, 0],
          y: [0, -25, 15, 0],
          scale: [1, 0.94, 1.07, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Small violet light */}
      <motion.div
        className="absolute w-[240px] h-[240px] rounded-full bg-violet-500/10 blur-[90px]"
        style={{ top: '35%', right: '12%' }}
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -20, 15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Existing grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Soft center glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-[420px] h-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.035] blur-[80px]"
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating light particles */}
      {[
        ['12%', '28%', 'indigo'],
        ['82%', '22%', 'cyan'],
        ['18%', '72%', 'cyan'],
        ['88%', '68%', 'indigo'],
        ['72%', '12%', 'violet'],
        ['28%', '86%', 'indigo'],
      ].map(([left, top, color], i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${
            color === 'cyan'
              ? 'bg-cyan-300'
              : color === 'violet'
              ? 'bg-violet-300'
              : 'bg-indigo-300'
          }`}
          style={{ left, top }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.1, 0.8, 0.1],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: 3.5 + i * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.45,
          }}
        />
      ))}

    </div>


    {/* ─────────────────────────────────────────────
        LOGIN CONTAINER
    ───────────────────────────────────────────── */}

    <motion.div
      initial={{
        opacity: 0,
        y: 35,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative w-full max-w-md"
    >

      {/* Animated glow behind card */}
      <motion.div
        className="absolute -inset-[1px] rounded-[18px] bg-gradient-to-r from-indigo-500/40 via-cyan-400/20 to-indigo-500/40 blur-xl opacity-40"
        animate={{
          opacity: [0.25, 0.5, 0.25],
          scale: [0.98, 1.015, 0.98],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="relative"
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >

        <div className="forge-card p-8 relative overflow-hidden">

          {/* Card shine */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(115deg, transparent 20%, rgba(129,140,248,0.05) 45%, transparent 70%)',
            }}
            animate={{
              x: ['-120%', '120%'],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
          />

          {/* ─────────────────────────────────────
              BRAND
          ───────────────────────────────────── */}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link
              to="/"
              className="flex items-center gap-2 mb-8 relative z-10"
            >

              <motion.div
                whileHover={{
                  scale: 1.12,
                  rotate: -8,
                }}
                whileTap={{
                  scale: 0.94,
                }}
                className="relative w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30"
              >
                <motion.div
                  className="absolute inset-0 rounded-lg bg-indigo-400/40 blur-md"
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                    scale: [0.9, 1.15, 0.9],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                <Zap
                  size={15}
                  className="text-white relative z-10"
                />
              </motion.div>

              <span className="font-display font-bold text-white">
                AgentForge
              </span>

            </Link>
          </motion.div>


          {/* ─────────────────────────────────────
              HEADING
          ───────────────────────────────────── */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10"
          >
            <h1 className="font-display text-2xl font-bold text-white mb-1">
              Welcome back
            </h1>

            <p className="text-slate-400 text-sm mb-7">
              Sign in to your agent workspace
            </p>
          </motion.div>


          {/* ERROR */}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{ duration: 0.35 }}
              className="relative z-10 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5"
            >
              <AlertCircle size={15} />
              {error}
            </motion.div>
          )}


          {/* ─────────────────────────────────────
              FORM
          ───────────────────────────────────── */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 relative z-10"
          >

            {/* EMAIL */}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.38,
                duration: 0.45,
              }}
            >
              <label className="text-xs text-slate-400 mb-1.5 block">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="forge-input pl-10 transition-all duration-300 focus:shadow-[0_0_25px_rgba(99,102,241,0.12)]"
                  placeholder="you@example.com"
                />

              </div>
            </motion.div>


            {/* PASSWORD */}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.46,
                duration: 0.45,
              }}
            >
              <label className="text-xs text-slate-400 mb-1.5 block">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="forge-input pl-10 pr-10 transition-all duration-300 focus:shadow-[0_0_25px_rgba(99,102,241,0.12)]"
                  placeholder="••••••••"
                />

                <motion.button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  whileHover={{
                    scale: 1.12,
                  }}
                  whileTap={{
                    scale: 0.88,
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </motion.button>

              </div>
            </motion.div>


            {/* ─────────────────────────────────────
                PREMIUM CTA
            ───────────────────────────────────── */}

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{
                y: -2,
                scale: 1.015,
              }}
              whileTap={{
                scale: 0.985,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 18,
              }}
              className="forge-btn-primary w-full mt-2 relative overflow-hidden group"
            >

              {/* moving shine */}
              <motion.span
                className="absolute inset-y-0 w-16 bg-white/20 blur-xl -skew-x-12"
                animate={{
                  x: ['-100px', '450px'],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut',
                }}
              />

              <span className="relative z-10">
                {isLoading ? 'Signing in...' : 'Sign in'}
              </span>

            </motion.button>

          </form>


          {/* ─────────────────────────────────────
              LOGIN NOTE
          ───────────────────────────────────── */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.58,
              duration: 0.45,
            }}
            className="relative z-10 mt-5 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl"
          >
            <p className="text-xs text-slate-500 mb-1 font-medium">
              User Login Inputs📲
            </p>

            <p className="text-xs text-slate-400">
              Remember you email and password for smooth login
            </p>
          </motion.div>


          {/* ─────────────────────────────────────
              REGISTER
          ───────────────────────────────────── */}

          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.7,
              duration: 0.5,
            }}
            className="relative z-10 text-center text-sm text-slate-500 mt-6"
          >
            Don't have an account?{' '}

            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign up free
            </Link>
          </motion.p>

        </div>
      </motion.div>
    </motion.div>
  </div>
);
}

  // return (
  //   <div className="min-h-screen bg-[#050A18] flex items-center justify-center px-4 relative overflow-hidden">
  //     <div className="orb w-[400px] h-[400px] bg-indigo-600 top-[-100px] left-[-100px]" />
  //     <div className="orb w-[300px] h-[300px] bg-cyan-500 bottom-[-50px] right-[-50px]" />
  //     <div className="absolute inset-0 grid-bg" />

  //     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
  //       <div className="forge-card p-8">
  //         <Link to="/" className="flex items-center gap-2 mb-8">
  //           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
  //             <Zap size={15} className="text-white" />
  //           </div>
  //           <span className="font-display font-bold text-white">AgentForge</span>
  //         </Link>

  //         <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
  //         <p className="text-slate-400 text-sm mb-7">Sign in to your agent workspace</p>

  //         {error && (
  //           <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
  //             <AlertCircle size={15} /> {error}
  //           </div>
  //         )}

  //         <form onSubmit={handleSubmit} className="space-y-4">
  //           <div>
  //             <label className="text-xs text-slate-400 mb-1.5 block">Email</label>
  //             <div className="relative">
  //               <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
  //               <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
  //                 className="forge-input pl-10" placeholder="you@example.com" />
  //             </div>
  //           </div>
  //           <div>
  //             <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
  //             <div className="relative">
  //               <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
  //               <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
  //                 className="forge-input pl-10 pr-10" placeholder="••••••••" />
  //               <button type="button" onClick={() => setShowPass(!showPass)}
  //                 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
  //                 {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
  //               </button>
  //             </div>
  //           </div>

  //           <button type="submit" disabled={isLoading} className="forge-btn-primary w-full mt-2">
  //             {isLoading ? 'Signing in...' : 'Sign in'}
  //           </button>
  //         </form>

  //         <div className="mt-5 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
  //           <p className="text-xs text-slate-500 mb-1 font-medium">User Login Inputs📲</p>
  //           <p className="text-xs text-slate-400">Remember you email and password for smooth login</p>
  //         </div>

  //         <p className="text-center text-sm text-slate-500 mt-6">
  //           Don't have an account?{' '}
  //           <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign up free</Link>
  //         </p>
  //       </div>
  //     </motion.div>
  //   </div>
  // );
// }
