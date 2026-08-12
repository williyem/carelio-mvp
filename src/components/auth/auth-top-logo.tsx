import LogoSvg from '@/assets/icons/logo-svg';

const AuthTopLogo = () => {
  return (
    <div>
      <div className="shrink-0 hide-below-lg">
        <div className="flex justify-center sm:justify-start items-center">
          <LogoSvg className="w-[80px] h-[36px] md:w-[124px] md:h-[56px]" />
        </div>
      </div>
    </div>
  );
};

export default AuthTopLogo;
