import tacaLogo from '../assets/taca-logo.js';

const BrandLogo = ({
  alt = 'Taca',
  className = '',
  width,
  height,
  decorative = false,
  src = tacaLogo,
  ...props
}) => {
  return (
    <img
      src={src}
      alt={decorative ? '' : alt}
      aria-hidden={decorative ? 'true' : undefined}
      width={width}
      height={height}
      className={`block h-auto w-auto max-w-full ${className}`.trim()}
      draggable="false"
      {...props}
    />
  );
};

export default BrandLogo;
