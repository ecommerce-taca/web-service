const Footer = () => {
  return (
    <footer className="bg-white border-t border-taca-border py-8 mt-auto">
      <div className="max-w-[1440px] mx-auto px-[80px] text-center text-taca-text-muted text-[11px] font-medium">
        <p className="m-0">&copy; {new Date().getFullYear()} Taca Ecommerce. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
