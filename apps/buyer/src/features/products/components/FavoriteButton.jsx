import PropTypes from 'prop-types';

const FavoriteButton = ({ isFavorite, onToggle, className = '' }) => {
  const handleClick = (e) => {
    e.preventDefault(); // Ngăn Link tag wrap bên ngoài kích hoạt
    e.stopPropagation(); // Ngăn event bubbling
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors cursor-pointer border border-taca-border/50 p-2 ${className}`}
      aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill={isFavorite ? "#ff424e" : "none"} 
        stroke={isFavorite ? "#ff424e" : "currentColor"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`transition-all duration-300 ${isFavorite ? 'scale-110' : 'scale-100'}`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
};

FavoriteButton.propTypes = {
  isFavorite: PropTypes.bool,
  onToggle: PropTypes.func,
  className: PropTypes.string
};

FavoriteButton.defaultProps = {
  isFavorite: false,
  className: ''
};

export default FavoriteButton;
