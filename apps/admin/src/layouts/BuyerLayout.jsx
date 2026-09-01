import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const BuyerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-[1280px] mx-auto px-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BuyerLayout;
