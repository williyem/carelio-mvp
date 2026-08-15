interface FullNameSvgProps {
  className?: string;
}

const FullNameSvg = ({ className }: FullNameSvgProps = {}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M8.10768 7.24732C8.04102 7.24065 7.96102 7.24065 7.88768 7.24732C6.30102 7.19398 5.04102 5.89398 5.04102 4.29398C5.04102 2.66065 6.36102 1.33398 8.00102 1.33398C9.63435 1.33398 10.961 2.66065 10.961 4.29398C10.9543 5.89398 9.69435 7.19398 8.10768 7.24732Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.77445 9.70602C3.16112 10.786 3.16112 12.546 4.77445 13.6193C6.60779 14.846 9.61445 14.846 11.4478 13.6193C13.0611 12.5393 13.0611 10.7793 11.4478 9.70602C9.62112 8.48602 6.61445 8.48602 4.77445 9.70602Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default FullNameSvg;
