const Footer = () => {
  return (
    <footer className="bg-white border-t border-border py-8 mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 text-center text-muted text-[14px]">
        <p>&copy; {new Date().getFullYear()} Taca Ecommerce. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
