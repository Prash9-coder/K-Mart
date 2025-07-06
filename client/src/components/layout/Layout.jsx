import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import AIChatbot from '../ui/AIChatbot'

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container-custom py-8">
        <Outlet />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  )
}

export default Layout