const AddressCard = ({ isDefault, name, phone, address, onEdit, onDelete }) => {
  return (
    <div className="border border-taca-border rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        {isDefault && (
          <div className="inline-flex">
            <span className="text-[12px] font-bold text-taca-primary bg-[#E6F0FF] px-2 py-1 rounded">
              MẶC ĐỊNH
            </span>
          </div>
        )}
        <div className="text-[15px] text-taca-text-main font-bold">
          {name} <span className="mx-2 text-taca-text-muted font-normal">·</span> {phone}
        </div>
        <div className="text-[14px] text-taca-text-muted">
          {address}
        </div>
      </div>
      
      <div className="flex-shrink-0 flex items-center gap-4">
        {!isDefault && onDelete && (
          <button 
            onClick={onDelete}
            className="text-taca-sale text-[14px] font-bold hover:text-red-700 focus:outline-none transition-colors"
          >
            Xóa
          </button>
        )}
        <button 
          onClick={onEdit}
          className="text-taca-primary text-[14px] font-bold hover:text-taca-primary-hover focus:outline-none transition-colors"
        >
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
