const NewAppointmentSvg = ({ color = 'currentColor' }: { color?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.33398 1.33337V3.33337"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.666 1.33337V3.33337"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.33398 6.06006H13.6673"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 5.66671V11.3334C14 13.3334 13 14.6667 10.6667 14.6667H5.33333C3 14.6667 2 13.3334 2 11.3334V5.66671C2 3.66671 3 2.33337 5.33333 2.33337H10.6667C13 2.33337 14 3.66671 14 5.66671Z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 9.5H13.5"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M12 8V11"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default NewAppointmentSvg;
