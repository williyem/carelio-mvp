import localFont from 'next/font/local';

export const eudoxusSans = localFont({
  src: [
    {
      path: '../assets/fonts/eudoxus-sans/EudoxusSans-Regular-BF659b6cb1d4714.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/eudoxus-sans/EudoxusSans-Light-BF659b6cb2036b5.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../assets/fonts/eudoxus-sans/EudoxusSans-ExtraLight-BF659b6cb1e7092.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../assets/fonts/eudoxus-sans/EudoxusSans-Medium-BF659b6cb1c14cb.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/eudoxus-sans/EudoxusSans-Bold-BF659b6cb1408e5.ttf',
      weight: '700',
      style: 'normal',
    },

    {
      path: '../assets/fonts/eudoxus-sans/EudoxusSans-ExtraBold-BF659b6cb1b96c9.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-eudoxus-sans',
  display: 'swap',
});
