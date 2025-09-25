const Spinner = () => (
  <svg
    className="animate-spin h-6 w-6 text-purple-500 inline-block mr-2"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    style={{ animationDuration: '0.9s' }}
  >
    <circle
      className="opacity-20"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-80"
      fill="currentColor"
      d="M12 2a10 10 0 00-10 10h4a6 6 0 016-6V2z"
    />
  </svg>
);

export default Spinner;
