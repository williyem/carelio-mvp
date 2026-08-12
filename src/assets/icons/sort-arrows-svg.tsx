const SortArrowsSvg = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M14.1673 7.91667L10.0007 3.75L5.83398 7.91667H14.1673ZM14.1673 12.0833L10.0007 16.25L5.83398 12.0833H14.1673Z"
        fill="#A4A4A4"
        className="group-hover:fill-[#5c5c5c] transition-colors"
      />
    </svg>
  );
};

export default SortArrowsSvg;
