import { Pin } from './Icons.jsx';

export const Layout = ({ children, dark = false }) => (
  <>
    <header className={dark ? 'bg-ink' : 'bg-ink'}>
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-3.5 md:px-10 md:py-4">
        <a href="/" className="flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-protea">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-protea text-white"><Pin size={15} /></span>
          <span className="font-dsp text-[16.5px] font-extrabold text-white md:text-[18px]">HireInCapeTown</span>
        </a>
        <nav className="flex items-center gap-5">
          <a href="/how-vetting-works" className="hidden text-[14.5px] font-semibold text-[#C6CDD6] hover:text-white md:block">How vetting works</a>
          <a href="/list-your-business" className="rounded-[11px] bg-white px-4 py-2.5 text-[14px] font-bold text-ink hover:bg-[#F2F3F5]">List your business</a>
        </nav>
      </div>
    </header>

    <main>{children}</main>

    <footer className="mt-14 bg-ink">
      <div className="mx-auto max-w-[1180px] px-4 py-12 md:px-10">
        <h2 className="max-w-[620px] text-pretty font-dsp text-[26px] font-extrabold leading-tight text-white md:text-[32px]">
          Cape Town businesses deserve to be found.
        </h2>
        <p className="mt-3.5 max-w-[560px] text-[15px] leading-relaxed text-[#A3AEBB]">
          One person with a bakkie in Khayelitsha, or twelve staff in Constantia — same listing, same free start.
          We check who you are so customers don't have to guess.
        </p>
        <a href="/list-your-business"
           className="mt-5 inline-flex min-h-[52px] items-center rounded-ctl bg-white px-7 font-dsp text-[16px] font-bold text-ink">
          List your business — free
        </a>
        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#2C3542] pt-7 text-[13px] text-[#8B94A1]">
          <a href="/privacy" className="hover:text-white">Privacy &amp; POPIA</a>
          <a href="/how-vetting-works" className="hover:text-white">How vetting works</a>
          <a href="/report" className="hover:text-white">Report a listing</a>
          <span className="ml-auto">Cape Town, South Africa</span>
        </div>
      </div>
    </footer>
  </>
);
