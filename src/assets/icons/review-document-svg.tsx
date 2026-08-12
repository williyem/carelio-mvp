import * as React from 'react';

interface ReviewDocumentSvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

export const ReviewDocumentSvg: React.FC<ReviewDocumentSvgProps> = ({
  size = 32,
  color = '#1792E6',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M26.8 12.4V26.7916C26.8011 26.9492 26.7711 27.1055 26.7118 27.2515C26.6525 27.3975 26.5651 27.5304 26.4544 27.6426C26.3438 27.7548 26.2121 27.8441 26.0669 27.9054C25.9218 27.9668 25.7659 27.9989 25.6084 28H6.39155C6.07573 28 5.77282 27.8746 5.54939 27.6514C5.32595 27.4282 5.20027 27.1254 5.19995 26.8096V5.1904C5.19995 4.546 5.73635 4 6.39755 4H18.4V11.2C18.4 11.5183 18.5264 11.8235 18.7514 12.0485C18.9765 12.2736 19.2817 12.4 19.6 12.4H26.8ZM26.8 10H20.8V4.0036L26.8 10ZM11.2 10V12.4H14.8V10H11.2ZM11.2 14.8V17.2H20.8V14.8H11.2ZM11.2 19.6V22H20.8V19.6H11.2Z"
      fill={color}
    />
  </svg>
);
