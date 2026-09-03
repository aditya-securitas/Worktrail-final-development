import React from 'react'

const Recyclebin: React.FC = () => {
  return (
    <section className="dashboard-page-card bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#0680A6] mb-1 block">Superadmin workspace</span>
      <h1 className="text-2xl font-bold text-slate-800">Recycle Bin</h1>
      <p className="text-sm text-slate-500 mt-2">Manage deleted records and restore items.</p>
    </section>
  )
}

export default Recyclebin
