
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const SvgPresentationChartLine: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12M3.75 3h-1.5m1.5 0h16.5M3.75 12.75h16.5m-16.5 0V6.75A2.25 2.25 0 0 1 5.25 4.5h4.5m-4.5 0h3.75M21.75 12.75v4.875A1.375 1.375 0 0 1 20.375 19H18.25M21.75 12.75h-5.25m5.25 0h-4.125M17.5 8.25c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3Zm-9.5 6.5h.008v.008H8v-.008Zm0 0H7.25m.75 0A2.25 2.25 0 0 0 5.25 13H4.5M8 14.5h.008v.008H8v-.008Zm0 0h1.5m-1.5 0H5.25m2.75 0h.008v.008H8v-.008Zm0 0a2.25 2.25 0 0 0-2.25 2.25v1.5M8 14.5H6.75m1.25 0h1.5m-1.5 0H5.25m2.75 0h1.5m0 0H8.75m2.75-2.625h1.5m-1.5 0h.008v.008h-.008v-.008Zm0 0H10.5m1.25 0h2.25m1.5-1.5H16.5m-1.5 0h.008v.008h-.008v-.008Zm0 0H15m.75 0h1.5M15 9.75h.008v.008H15v-.008Zm0 0h1.5m-1.5 0H12.75m2.25 0h.008v.008H15v-.008Zm0 0a2.25 2.25 0 0 0-2.25 2.25v1.5m7.5-6h-.008v.008h.008v-.008Zm0 0H19.5m.75 0a2.25 2.25 0 0 0-2.25-2.25H16.5" />
  </svg>
);

export const SvgCog: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15.75 0a7.462 7.462 0 0 1-1.302-4.438M21 12a7.462 7.462 0 0 1-1.302 4.438m-14.396-8.876a7.462 7.462 0 0 1 4.438-1.302M12 3.75a7.462 7.462 0 0 1 4.438 1.302m0 8.876a7.462 7.462 0 0 1-4.438 1.302M12 20.25a7.462 7.462 0 0 1-4.438-1.302m0-8.876a7.462 7.462 0 0 1 4.438-1.302M12 3.75a7.462 7.462 0 0 1 4.438 1.302" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
  </svg>
);

export const SvgPlay: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
  </svg>
);

export const SvgChartBar: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

export const SvgDocumentText: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

export const SvgCurrencyDollar: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const SvgPlus: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const SvgMinus: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg>
);

export const SvgListBullet: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const SvgXMark: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export const SvgArrowRightCircle: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const SvgLightBulb: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3 .378A6.011 6.011 0 0 1 12 12.75m6 0a6.011 6.011 0 0 0-6-3.75M9.75 21a0.75.75 0 0 1-.75-.75v-4.5a0.75.75 0 0 1 .75-.75h4.5a0.75.75 0 0 1 .75.75v4.5a0.75.75 0 0 1-.75.75H9.75Z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75c0 .414-.168.75-.375.75S9 13.164 9 12.75c0-.414.168-.75.375-.75S9.75 12.336 9.75 12.75Zm4.5 0c0 .414-.168.75-.375.75S13.5 13.164 13.5 12.75c0-.414.168-.75.375-.75S14.25 12.336 14.25 12.75Z" />
  </svg>
);

export const SvgInformationCircle: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);
