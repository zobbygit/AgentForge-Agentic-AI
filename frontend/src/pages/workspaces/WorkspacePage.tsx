import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Code2, Plus, File, Save, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LANGUAGES = ['typescript', 'javascript', 'python', 'markdown', 'json', 'yaml', 'html', 'css', 'bash', 'plaintext'];

export default function WorkspacePage() {
  const qc = useQueryClient();
  const [activeWs, setActiveWs] = useState<any>(null);
  const [activeFile, setActiveFile] = useState<any>(null);
  const [content, setContent] = useState('');
  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFile, setNewFile] = useState({ name: '', language: 'typescript' });

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => { const { data } = await api.get('/workspaces'); return data.data.workspaces; },
  });

  const createWs = useMutation({
    mutationFn: (name: string) => api.post('/workspaces', { name }),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['workspaces'] }); setActiveWs(res.data.data.workspace); setShowNewWs(false); setNewWsName(''); },
  });

  const addFile = useMutation({
    mutationFn: ({ wsId, file }: any) => api.put(`/workspaces/${wsId}`, {
      files: [...(activeWs?.files || []), { ...file, content: '', size: 0, updatedAt: new Date() }],
    }),
    onSuccess: (res) => { setActiveWs(res.data.data.workspace); setShowNewFile(false); setNewFile({ name: '', language: 'typescript' }); },
  });

  const saveFile = useMutation({
    mutationFn: ({ wsId, files }: any) => api.put(`/workspaces/${wsId}`, { files }),
    onSuccess: (res) => { setActiveWs(res.data.data.workspace); toast.success('Saved'); },
  });

  const openFile = (file: any) => { setActiveFile(file); setContent(file.content || ''); };

  const handleSave = () => {
    if (!activeWs || !activeFile) return;
    const files = activeWs.files.map((f: any) =>
      f.name === activeFile.name ? { ...f, content, size: content.length, updatedAt: new Date() } : f
    );
    saveFile.mutate({ wsId: activeWs._id, files });
  };

  return (
   <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full min-w-0">
      <div className="flex items-center justify-between gap-4 mb-6 min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-white">Workspace</h1>
          <p className="text-slate-400 text-sm mt-0.5">File workspace for agents and your code</p>
        </div>
        <button onClick={() => setShowNewWs(true)} className="forge-btn-primary text-sm inline-flex items-center gap-2">
          <Plus size={16} /> New Workspace
        </button>
      </div>

      {showNewWs && (
        <div className="forge-card p-4 mb-4 flex items-center gap-3">
          <input value={newWsName} onChange={e => setNewWsName(e.target.value)} placeholder="Workspace name"
            className="forge-input text-sm flex-1" onKeyDown={e => e.key === 'Enter' && newWsName && createWs.mutate(newWsName)} />
          <button onClick={() => newWsName && createWs.mutate(newWsName)} className="forge-btn-primary text-sm py-2.5">Create</button>
          <button onClick={() => setShowNewWs(false)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
        </div>
      )}

     <div className="grid md:grid-cols-4 gap-5 min-w-0">
        {/* Workspace list */}
        <div className="md:col-span-1 min-w-0">
          <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-3">Workspaces</h2>
          {isLoading ? <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="forge-card h-10 animate-pulse" />)}</div> : null}
          <div className="space-y-1.5">
            {(workspaces || []).map((ws: any) => (
              <button key={ws._id} onClick={() => { setActiveWs(ws); setActiveFile(null); setContent(''); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${activeWs?._id === ws._id ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                <Code2 size={14} className="inline mr-2 opacity-70" />{ws.name}
                <span className="text-xs text-slate-600 ml-1">({ws.files?.length || 0})</span>
              </button>
            ))}
            {(workspaces || []).length === 0 && !isLoading && (
              <p className="text-xs text-slate-600 text-center py-4">No workspaces</p>
            )}
          </div>
        </div>

        {/* File browser + editor */}
      <div className="md:col-span-3 min-w-0">
          {!activeWs ? (
            <div className="forge-card p-12 text-center">
              <Code2 size={32} className="text-indigo-400 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Select or create a workspace to start editing</p>
            </div>
          ) : (
           <div className="forge-card overflow-hidden h-[600px] flex flex-col min-w-0 w-full">
              {/* Toolbar */}
             <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0a1020] min-w-0">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar min-w-0 flex-1">
                  {activeWs.files?.map((f: any) => (
                    <button key={f.name} onClick={() => openFile(f)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all flex-shrink-0 ${activeFile?.name === f.name ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                      <File size={11} />{f.name}
                    </button>
                  ))}
                  <button onClick={() => setShowNewFile(true)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 flex-shrink-0">
                    <Plus size={11} /> File
                  </button>
                </div>
                {activeFile && (
                  <button onClick={handleSave} disabled={saveFile.isPending}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 rounded-lg transition-all flex-shrink-0">
                    <Save size={11} /> {saveFile.isPending ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>




              {showNewFile && (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-[#0a1020]">
<input
  value={newFile.name}
  onChange={e => setNewFile({ ...newFile, name: e.target.value })}
  placeholder="filename.ts"
  className="forge-input text-xs py-1.5 flex-1 min-w-[140px] !text-slate-200 placeholder:!text-slate-500"
/>

<select
  value={newFile.language}
  onChange={e => setNewFile({ ...newFile, language: e.target.value })}
  className="forge-input text-xs py-1.5 min-w-0"
>
    {LANGUAGES.map(l => (
      <option
        key={l}
        value={l}
        className="bg-[#0f172a] text-slate-200"
      >
        {l}
      </option>
    ))}
  </select>

  <button
    onClick={() =>
      newFile.name && addFile.mutate({
        wsId: activeWs._id,
        file: newFile
      })
    }
    className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-500/30"
  >
    Add
  </button>

  <button
    onClick={() => setShowNewFile(false)}
    className="text-slate-500 hover:text-slate-300"
  >
    <X size={14} />
  </button>
</div>
              )}

              {/* Editor */}
              <div className="flex-1 overflow-hidden min-w-0">
                {!activeFile ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-600 text-sm">Select a file to edit</p>
                  </div>
                ) : (
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
               className="w-full h-full min-w-0 bg-transparent resize-none p-4 font-mono text-xs text-slate-300 leading-relaxed focus:outline-none"
                    placeholder="// Start typing..."
                    spellCheck={false}
                    onKeyDown={e => {
                      if (e.key === 'Tab') { e.preventDefault(); const s = e.currentTarget.selectionStart; setContent(c => c.substring(0,s) + '  ' + c.substring(e.currentTarget.selectionEnd)); }
                      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
                    }}
                  />
                )}
              </div>

              {activeFile && (
                <div className="px-4 py-2 border-t border-white/[0.06] bg-[#0a1020] flex items-center justify-between text-xs text-slate-600">
                  <span>{activeFile.language}</span>
                  <span>{content.length} chars · {content.split('\n').length} lines · Ctrl+S to save</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}















// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Code2, Plus, File, Save, X } from 'lucide-react';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// const LANGUAGES = ['typescript', 'javascript', 'python', 'markdown', 'json', 'yaml', 'html', 'css', 'bash', 'plaintext'];

// export default function WorkspacePage() {
//   const qc = useQueryClient();
//   const [activeWs, setActiveWs] = useState<any>(null);
//   const [activeFile, setActiveFile] = useState<any>(null);
//   const [content, setContent] = useState('');
//   const [showNewWs, setShowNewWs] = useState(false);
//   const [newWsName, setNewWsName] = useState('');
//   const [showNewFile, setShowNewFile] = useState(false);
//   const [newFile, setNewFile] = useState({ name: '', language: 'typescript' });

//   const { data: workspaces, isLoading } = useQuery({
//     queryKey: ['workspaces'],
//     queryFn: async () => { const { data } = await api.get('/workspaces'); return data.data.workspaces; },
//   });

//   const createWs = useMutation({
//     mutationFn: (name: string) => api.post('/workspaces', { name }),
//     onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['workspaces'] }); setActiveWs(res.data.data.workspace); setShowNewWs(false); setNewWsName(''); },
//   });

//   const addFile = useMutation({
//     mutationFn: ({ wsId, file }: any) => api.put(`/workspaces/${wsId}`, {
//       files: [...(activeWs?.files || []), { ...file, content: '', size: 0, updatedAt: new Date() }],
//     }),
//     onSuccess: (res) => { setActiveWs(res.data.data.workspace); setShowNewFile(false); setNewFile({ name: '', language: 'typescript' }); },
//   });

//   const saveFile = useMutation({
//     mutationFn: ({ wsId, files }: any) => api.put(`/workspaces/${wsId}`, { files }),
//     onSuccess: (res) => { setActiveWs(res.data.data.workspace); toast.success('Saved'); },
//   });

//   const openFile = (file: any) => { setActiveFile(file); setContent(file.content || ''); };

//   const handleSave = () => {
//     if (!activeWs || !activeFile) return;
//     const files = activeWs.files.map((f: any) =>
//       f.name === activeFile.name ? { ...f, content, size: content.length, updatedAt: new Date() } : f
//     );
//     saveFile.mutate({ wsId: activeWs._id, files });
//   };

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="font-display text-2xl font-bold text-white">Workspace</h1>
//           <p className="text-slate-400 text-sm mt-0.5">File workspace for agents and your code</p>
//         </div>
//         <button onClick={() => setShowNewWs(true)} className="forge-btn-primary text-sm inline-flex items-center gap-2">
//           <Plus size={16} /> New Workspace
//         </button>
//       </div>

//       {showNewWs && (
//         <div className="forge-card p-4 mb-4 flex items-center gap-3">
//           <input value={newWsName} onChange={e => setNewWsName(e.target.value)} placeholder="Workspace name"
//             className="forge-input text-sm flex-1" onKeyDown={e => e.key === 'Enter' && newWsName && createWs.mutate(newWsName)} />
//           <button onClick={() => newWsName && createWs.mutate(newWsName)} className="forge-btn-primary text-sm py-2.5">Create</button>
//           <button onClick={() => setShowNewWs(false)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
//         </div>
//       )}

//       <div className="grid md:grid-cols-4 gap-5">
//         {/* Workspace list */}
//         <div className="md:col-span-1">
//           <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-3">Workspaces</h2>
//           {isLoading ? <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="forge-card h-10 animate-pulse" />)}</div> : null}
//           <div className="space-y-1.5">
//             {(workspaces || []).map((ws: any) => (
//               <button key={ws._id} onClick={() => { setActiveWs(ws); setActiveFile(null); setContent(''); }}
//                 className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${activeWs?._id === ws._id ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
//                 <Code2 size={14} className="inline mr-2 opacity-70" />{ws.name}
//                 <span className="text-xs text-slate-600 ml-1">({ws.files?.length || 0})</span>
//               </button>
//             ))}
//             {(workspaces || []).length === 0 && !isLoading && (
//               <p className="text-xs text-slate-600 text-center py-4">No workspaces</p>
//             )}
//           </div>
//         </div>

//         {/* File browser + editor */}
//         <div className="md:col-span-3">
//           {!activeWs ? (
//             <div className="forge-card p-12 text-center">
//               <Code2 size={32} className="text-indigo-400 mx-auto mb-4" />
//               <p className="text-slate-400 text-sm">Select or create a workspace to start editing</p>
//             </div>
//           ) : (
//             <div className="forge-card overflow-hidden h-[600px] flex flex-col">
//               {/* Toolbar */}
//               <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0a1020]">
//                 <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
//                   {activeWs.files?.map((f: any) => (
//                     <button key={f.name} onClick={() => openFile(f)}
//                       className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all flex-shrink-0 ${activeFile?.name === f.name ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
//                       <File size={11} />{f.name}
//                     </button>
//                   ))}
//                   <button onClick={() => setShowNewFile(true)}
//                     className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 flex-shrink-0">
//                     <Plus size={11} /> File
//                   </button>
//                 </div>
//                 {activeFile && (
//                   <button onClick={handleSave} disabled={saveFile.isPending}
//                     className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 rounded-lg transition-all flex-shrink-0">
//                     <Save size={11} /> {saveFile.isPending ? 'Saving...' : 'Save'}
//                   </button>
//                 )}
//               </div>




//               {showNewFile && (
//            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-[#0a1020]">
// <input
//   value={newFile.name}
//   onChange={e => setNewFile({ ...newFile, name: e.target.value })}
//   placeholder="filename.ts"
//   className="forge-input text-xs py-1.5 flex-1 min-w-[140px] !text-slate-200 placeholder:!text-slate-500"
// />

//   <select
//     value={newFile.language}
//     onChange={e => setNewFile({ ...newFile, language: e.target.value })}
//     className="forge-input text-xs py-1.5"
//   >
//     {LANGUAGES.map(l => (
//       <option
//         key={l}
//         value={l}
//         className="bg-[#0f172a] text-slate-200"
//       >
//         {l}
//       </option>
//     ))}
//   </select>

//   <button
//     onClick={() =>
//       newFile.name && addFile.mutate({
//         wsId: activeWs._id,
//         file: newFile
//       })
//     }
//     className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-500/30"
//   >
//     Add
//   </button>

//   <button
//     onClick={() => setShowNewFile(false)}
//     className="text-slate-500 hover:text-slate-300"
//   >
//     <X size={14} />
//   </button>
// </div>
//               )}

//               {/* Editor */}
//               <div className="flex-1 overflow-hidden">
//                 {!activeFile ? (
//                   <div className="h-full flex items-center justify-center">
//                     <p className="text-slate-600 text-sm">Select a file to edit</p>
//                   </div>
//                 ) : (
//                   <textarea
//                     value={content}
//                     onChange={e => setContent(e.target.value)}
//                     className="w-full h-full bg-transparent resize-none p-4 font-mono text-xs text-slate-300 leading-relaxed focus:outline-none"
//                     placeholder="// Start typing..."
//                     spellCheck={false}
//                     onKeyDown={e => {
//                       if (e.key === 'Tab') { e.preventDefault(); const s = e.currentTarget.selectionStart; setContent(c => c.substring(0,s) + '  ' + c.substring(e.currentTarget.selectionEnd)); }
//                       if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
//                     }}
//                   />
//                 )}
//               </div>

//               {activeFile && (
//                 <div className="px-4 py-2 border-t border-white/[0.06] bg-[#0a1020] flex items-center justify-between text-xs text-slate-600">
//                   <span>{activeFile.language}</span>
//                   <span>{content.length} chars · {content.split('\n').length} lines · Ctrl+S to save</span>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
