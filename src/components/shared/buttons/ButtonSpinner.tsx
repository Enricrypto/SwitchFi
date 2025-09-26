const ButtonSpinner = () => (
  <button
    aria-label="Loading"
    className="
      w-10 h-10
      rounded-full
      bg-[#1B002B]
      border border-[#AB37FF66]
      shadow-[0_0_12px_#AB37FF88]
      flex items-center justify-center
      transition-colors duration-300
      hover:brightness-110
    "
  >
    <span
      className="
        w-5 h-5
        border-[3px]
        border-t-transparent
        border-r-[#AB37FF]
        border-b-transparent
        border-l-[#AB37FF]
        rounded-full
        animate-spin-fast
        drop-shadow-[0_0_6px_#AB37FF99]
      "
    />
  </button>
);

export default ButtonSpinner;
