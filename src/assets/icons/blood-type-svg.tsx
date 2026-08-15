import { Droplet } from 'lucide-react';

interface BloodTypeSvgProps {
  className?: string;
}

const BloodTypeSvg = ({ className }: BloodTypeSvgProps = {}) => {
  return (
    <Droplet
      className={className}
      width={13}
      height={13}
      fill="currentColor"
      stroke="currentColor"
    />
  );
};

export default BloodTypeSvg;
