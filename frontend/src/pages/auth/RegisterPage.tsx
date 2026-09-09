import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return null;
    const checks = [p.length >= 8, /[A-Z]/.test(p), /[a-z]/.test(p), /\d/.test(p)];
    const score = checks.filter(Boolean).length;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-500', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to AgentForge.');
      navigate('/dashboard');
    } catch (err) {
      const msg = (err as AxiosError<{ message: string }>)?.response?.data?.message || 'Registration failed';
      setError(msg);
    }
  };


return (
  <div className="min-h-screen bg-[#050A18] flex items-center justify-center px-4 py-12 relative overflow-hidden">

    {/* Background atmosphere */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      <motion.div
        className="absolute w-[520px] h-[520px] rounded-full bg-indigo-600/20 blur-[120px]"
        style={{ top: '-180px', right: '-160px' }}
        animate={{
          x: [0, -35, 20, 0],
          y: [0, 30, -15, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[420px] h-[420px] rounded-full bg-cyan-500/15 blur-[110px]"
        style={{ bottom: '-160px', left: '-120px' }}
        animate={{
          x: [0, 35, -15, 0],
          y: [0, -25, 15, 0],
          scale: [1, 0.94, 1.06, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[240px] h-[240px] rounded-full bg-violet-500/10 blur-[90px]"
        style={{ top: '40%', left: '10%' }}
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

      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Floating particles */}
      {[
        ['14%', '20%', 'indigo'],
        ['84%', '26%', 'cyan'],
        ['10%', '68%', 'cyan'],
        ['90%', '72%', 'indigo'],
        ['70%', '10%', 'violet'],
        ['30%', '90%', 'indigo'],
      ].map(([left, top, color], i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${
            i % 3 === 1
              ? 'w-1.5 h-1.5 bg-cyan-300'
              : color === 'violet'
              ? 'w-1 h-1 bg-violet-300'
              : 'w-1 h-1 bg-indigo-300'
          }`}
          style={{ left, top }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.1, 0.8, 0.1],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: 3.5 + i * 0.45,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}

    </div>


    {/* Register container */}
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

      {/* Glow behind card */}
      <motion.div
        className="absolute -inset-[1px] rounded-[18px] bg-gradient-to-r from-indigo-500/40 via-cyan-400/20 to-indigo-500/40 blur-xl"
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
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
      >

        <div className="forge-card p-8 relative overflow-hidden">

          {/* Card light sweep */}
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

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10"
          >
            <Link to="/" className="flex items-center gap-2 mb-8">

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
                    opacity: [0.2, 0.65, 0.2],
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


          {/* Heading */}
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
              Create your account
            </h1>

            <p className="text-slate-400 text-sm mb-7">
              Start orchestrating AI agents in minutes
            </p>
          </motion.div>


          {/* Error */}
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


          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 relative z-10"
          >

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.38,
                duration: 0.45,
              }}
            >
              <label className="text-xs text-slate-400 mb-1.5 block">
                Full name
              </label>

              <div className="relative">

                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="forge-input pl-10 transition-all duration-300 focus:shadow-[0_0_25px_rgba(99,102,241,0.12)]"
                  placeholder="Alex Johnson"
                  minLength={2}
                  maxLength={50}
                />

              </div>
            </motion.div>


            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.46,
                duration: 0.45,
              }}
            >
              <label className="text-xs text-slate-400 mb-1.5 block">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  className="forge-input pl-10 transition-all duration-300 focus:shadow-[0_0_25px_rgba(99,102,241,0.12)]"
                  placeholder="you@example.com"
                />

              </div>
            </motion.div>


            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.54,
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
                  value={form.password}
                  onChange={e =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  className="forge-input pl-10 pr-10 transition-all duration-300 focus:shadow-[0_0_25px_rgba(99,102,241,0.12)]"
                  placeholder="Min 8 chars, uppercase + number"
                  minLength={8}
                />

                <motion.button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </motion.button>

              </div>


              {/* Password strength */}
              {passwordStrength && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: 'auto',
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="mt-2"
                >

                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">

                    <motion.div
                      className={`h-full ${passwordStrength.color}`}
                      initial={{ width: 0 }}
                      animate={{
                        width: passwordStrength.width,
                      }}
                      transition={{
                        duration: 0.45,
                        ease: 'easeOut',
                      }}
                    />

                  </div>

                  <motion.p
                    key={passwordStrength.label}
                    initial={{
                      opacity: 0,
                      x: -5,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    className="text-xs text-slate-500 mt-1"
                  >
                    {passwordStrength.label} password
                  </motion.p>

                </motion.div>
              )}

            </motion.div>


            {/* Create account */}
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
              className="forge-btn-primary w-full mt-2 relative overflow-hidden"
            >

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
                {isLoading
                  ? 'Creating account...'
                  : 'Create account'}
              </span>

            </motion.button>

          </form>


          {/* Benefits */}
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
              delay: 0.65,
              duration: 0.45,
            }}
            className="relative z-10 mt-5 space-y-1.5"
          >

            {[
              'Pass must have 1 Uppercase+Lowercase+number',
              'No credit card required',
              'Free forever on free models',
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{
                  opacity: 0,
                  x: -8,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.7 + index * 0.08,
                  duration: 0.35,
                }}
                className="flex items-center gap-2 text-xs text-slate-500"
              >
                <CheckCircle2
                  size={12}
                  className="text-indigo-400 flex-shrink-0"
                />

                {item}
              </motion.div>
            ))}

          </motion.div>


          {/* Sign in */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.9,
              duration: 0.5,
            }}
            className="relative z-10 text-center text-sm text-slate-500 mt-6"
          >
            Already have an account?{' '}

            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </motion.p>

        </div>
      </motion.div>
    </motion.div>
  </div>
);
}

//   return (
//     <div className="min-h-screen bg-[#050A18] flex items-center justify-center px-4 py-12 relative overflow-hidden">
//       <div className="orb w-[400px] h-[400px] bg-indigo-600 top-[-100px] right-[-100px]" />
//       <div className="orb w-[300px] h-[300px] bg-cyan-500 bottom-[-50px] left-[-50px]" />
//       <div className="absolute inset-0 grid-bg" />

//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
//         <div className="forge-card p-8">
//           <Link to="/" className="flex items-center gap-2 mb-8">
//             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
//               <Zap size={15} className="text-white" />
//             </div>
//             <span className="font-display font-bold text-white">AgentForge</span>
//           </Link>

//           <h1 className="font-display text-2xl font-bold text-white mb-1">Create your account</h1>
//           <p className="text-slate-400 text-sm mb-7">Start orchestrating AI agents in minutes</p>

//           {error && (
//             <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
//               <AlertCircle size={15} /> {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="text-xs text-slate-400 mb-1.5 block">Full name</label>
//               <div className="relative">
//                 <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
//                 <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
//                   className="forge-input pl-10" placeholder="Alex Johnson" minLength={2} maxLength={50} />
//               </div>
//             </div>
//             <div>
//               <label className="text-xs text-slate-400 mb-1.5 block">Email</label>
//               <div className="relative">
//                 <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
//                 <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
//                   className="forge-input pl-10" placeholder="you@example.com" />
//               </div>
//             </div>
//             <div>
//               <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
//               <div className="relative">
//                 <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
//                 <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
//                   className="forge-input pl-10 pr-10" placeholder="Min 8 chars, uppercase + number" minLength={8} />
//                 <button type="button" onClick={() => setShowPass(!showPass)}
//                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
//                   {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
//                 </button>
//               </div>
//               {passwordStrength && (
//                 <div className="mt-2">
//                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
//                     <div className={`h-full ${passwordStrength.color} transition-all`} style={{ width: passwordStrength.width }} />
//                   </div>
//                   <p className="text-xs text-slate-500 mt-1">{passwordStrength.label} password</p>
//                 </div>
//               )}
//             </div>

//             <button type="submit" disabled={isLoading} className="forge-btn-primary w-full mt-2">
//               {isLoading ? 'Creating account...' : 'Create account'}
//             </button>
//           </form>

//           <div className="mt-5 space-y-1.5">
//             {['Pass must have 1 Uppercase+Lowercase+number', 
//             'No credit card required', 
//             'Free forever on free models'].map(item => (
//               <div key={item} className="flex items-center gap-2 text-xs text-slate-500">
//                 <CheckCircle2 size={12} className="text-indigo-400 flex-shrink-0" /> {item}
//               </div>
//             ))}
//           </div>

//           <p className="text-center text-sm text-slate-500 mt-6">
//             Already have an account?{' '}
//             <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   );
// }
