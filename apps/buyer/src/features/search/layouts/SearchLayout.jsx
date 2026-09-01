import { Outlet } from 'react-router-dom';
import WhiteHeader from '../../../components/layout/WhiteHeader';
import Footer from '../../../components/layout/Footer';

const SearchLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5fa]">
      <WhiteHeader />
      <main className="flex-1 pb-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default SearchLayout;
