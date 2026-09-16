// Stroke icons on a 24px grid, matching design/StyleTile.dc.html.
// Never emoji — they render differently on every device and can't be recoloured.
const S = ({ size = 20, children, fill = 'none', ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === 'none' ? 'currentColor' : 'none'}
       strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>{children}</svg>
);

export const Pin     = (p) => <S {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.4" /></S>;
export const Search  = (p) => <S {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></S>;
export const Shield  = (p) => <S {...p} strokeWidth="2.4"><path d="M12 3l7 2.6v5.2c0 4.4-3 8.1-7 9.2-4-1.1-7-4.8-7-9.2V5.6z" /><path d="M9 12.1l2.2 2.2 4-4.3" /></S>;
export const Star    = (p) => <S {...p} fill="currentColor"><path d="M12 3.6l2.5 5.3 5.6.8-4.1 4 1 5.7-5-2.7-5 2.7 1-5.7-4.1-4 5.6-.8z" /></S>;
export const Phone   = (p) => <S {...p}><path d="M7 3.8h3l1.4 3.5-2 1.4a12 12 0 0 0 5.9 5.9l1.4-2 3.5 1.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 5 6a2 2 0 0 1 2-2.2z" /></S>;
export const Chat    = (p) => <S {...p}><path d="M20.5 11.8a8.4 8.4 0 0 1-12.2 7.5L4 20.5l1.3-4.1A8.4 8.4 0 1 1 20.5 11.8z" /><path d="M9 9.6h1.6l1 2-1.1.9a6 6 0 0 0 2.9 2.9l.9-1.1 2 1v1.6a1.1 1.1 0 0 1-1.2 1.1 8.7 8.7 0 0 1-7.2-7.2A1.1 1.1 0 0 1 9 9.6z" /></S>;
export const Check   = (p) => <S {...p} strokeWidth="2.3"><circle cx="12" cy="12" r="9" /><path d="M8.4 12.2l2.6 2.6 4.6-5" /></S>;
export const Dot     = (p) => <S {...p} strokeWidth="2"><circle cx="12" cy="12" r="9" /></S>;
export const Clock   = (p) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.4v5.2l3.2 1.9" /></S>;
export const Flag    = (p) => <S {...p}><path d="M5 21V4.5" /><path d="M5 5.2c4-2 7 2 12 0v8.4c-5 2-8-2-12 0z" /></S>;

const TRADE = {
  wrench:  <path d="M14.5 3.5a4.5 4.5 0 0 0-5.9 5.9L3.8 14.2a2 2 0 0 0 0 2.8l3.2 3.2a2 2 0 0 0 2.8 0l4.8-4.8a4.5 4.5 0 0 0 5.9-5.9l-2.9 2.9-2.6-.6-.6-2.6z" />,
  bolt:    <path d="M13.3 2.5L5 13.4h5.5l-.8 8.1L18 10.6h-5.5z" />,
  spray:   <><path d="M13 2.8l-3.4 3.4 2.3 2.3L15.3 5z" /><path d="M9.6 6.2L4.4 11.4a2 2 0 0 0 0 2.8l3.3 3.3L14 11.2" /><path d="M18 14.5c0 1.2-.9 2.1-2 2.1s-2-.9-2-2.1 2-3.7 2-3.7 2 2.5 2 3.7z" /><path d="M6 21h9" /></>,
  truck:   <><path d="M2.5 7.5h10v8.8h-10z" /><path d="M12.5 10.5h4.2l3.3 3.2v2.6h-7.5z" /><circle cx="6.5" cy="18" r="1.9" /><circle cx="16.5" cy="18" r="1.9" /></>,
  scissors:<><circle cx="6" cy="17.5" r="3" /><circle cx="18" cy="17.5" r="3" /><path d="M8.2 15.4L18.5 4.2" /><path d="M15.8 15.4L5.5 4.2" /></>,
  house:   <><path d="M3.5 10.8L12 4l8.5 6.8" /><path d="M5.8 12.4V20h12.4v-7.6" /><path d="M10 20v-4.6h4V20" /></>,
  car:     <><path d="M3.2 14.2l1.5-4.9A2.4 2.4 0 0 1 7 7.6h10a2.4 2.4 0 0 1 2.3 1.7l1.5 4.9" /><path d="M3.2 14.2h17.6v3.6H3.2z" /><path d="M6.2 17.8v1.9" /><path d="M17.8 17.8v1.9" /></>,
  camera:  <><path d="M3.2 8.4h3.6l1.5-2.3h7.4l1.5 2.3h3.6v11H3.2z" /><circle cx="12" cy="13.4" r="3.4" /></>,
};

export const Trade = ({ icon, size = 24 }) => <S size={size} strokeWidth="1.7">{TRADE[icon] ?? TRADE.wrench}</S>;
