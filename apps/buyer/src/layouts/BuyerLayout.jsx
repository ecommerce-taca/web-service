import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const BuyerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-taca-surface">
      <Header />
      <main className="flex-1 py-7">
        <div className="max-w-[1440px] mx-auto px-[80px]">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BuyerLayout;
