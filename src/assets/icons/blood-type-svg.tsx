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
      fill="#020F17"
      stroke="#020F17"
    />
  );
};

export default BloodTypeSvg;
