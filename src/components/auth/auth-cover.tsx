import Image from 'next/image';
import auth1 from '@/assets/images/auth/auth-1.jpg';
import auth2 from '@/assets/images/auth/auth-2.jpg';
import auth3 from '@/assets/images/auth/auth-3.jpg';
import auth4 from '@/assets/images/auth/auth-4.jpg';

const AuthCover = () => {
  return (
    <div className="w-full h-full flex gap-[10px]">
      {/* First Image - Rounded bottom, padding bottom */}
      <div className="flex-1 relative overflow-hidden rounded-b-[100px] mb-16">
        <Image
          src={auth1}
          alt="Healthcare professional"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Second Image - Rounded top, padding top */}
      <div className="flex-1 relative overflow-hidden rounded-t-[100px] mt-16">
        <Image
          src={auth2}
          alt="Healthcare professional"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Third Image - Rounded bottom, padding bottom */}
      <div className="flex-1 relative overflow-hidden rounded-b-[100px] mb-16">
        <Image
          src={auth3}
          alt="Healthcare professional"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Fourth Image - Rounded top, padding top */}
      <div className="flex-1 relative overflow-hidden rounded-t-[100px] mt-16">
        <Image
          src={auth4}
          alt="Healthcare professional"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
};

export default AuthCover;
