const Footer = () => {
  return (
    <footer className="mt-auto border-t border-taca-border bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-5 text-center text-[11px] font-medium leading-5 text-taca-text-muted sm:px-6 sm:py-6 md:px-8 lg:px-[80px]">
        <p className="m-0">&copy; {new Date().getFullYear()} Taca Ecommerce. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
