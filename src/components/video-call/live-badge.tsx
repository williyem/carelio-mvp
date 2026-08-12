const LiveBadge = () => {
  return (
    <div className="bg-(--bg-success-light)  flex gap-1 sm:gap-[6px] items-center p-2 sm:p-[10px] rounded-[30px]">
      <div className="bg-(--text-green-dark) rounded-full size-2 sm:size-[10px]" />
      <p className="text-(--text-green-dark) text-xs sm:text-[14px] font-normal leading-[1.2] whitespace-nowrap">
        Live Consultation
      </p>
    </div>
  );
};

export default LiveBadge;
