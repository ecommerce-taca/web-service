import PropTypes from 'prop-types';

/**
 * Sidebar Navigation cho trang Cài đặt gian hàng
 */
export default function SettingsSidebarNav({ subTabs, activeSubTab, onSelectTab }) {
  return (
    <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-2 shadow-xs space-y-1">
      {subTabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelectTab(t.id)}
          className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors flex items-center justify-between cursor-pointer ${
            activeSubTab === t.id
              ? 'bg-indigo-50 text-[#4F46E5]'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{t.label}</span>
          {activeSubTab === t.id && <span className="text-xs">›</span>}
        </button>
      ))}
    </div>
  );
}

SettingsSidebarNav.propTypes = {
  subTabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  activeSubTab: PropTypes.string.isRequired,
  onSelectTab: PropTypes.func.isRequired,
};
