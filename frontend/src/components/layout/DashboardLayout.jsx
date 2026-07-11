import Sidebar from './Sidebar'

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="lg:hidden h-14 border-b border-surface-hover" />
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout