import { Layout } from '../components/Layout.jsx';
import { Shield } from '../components/Icons.jsx';
import { CONTACT_EMAIL, RESPONSIBLE_PARTY, mailto } from '../lib/site.js';
import { CATEGORIES } from '../lib/categories.js';


// --- Netlify form plumbing ---------------------------------------------
//
// Netlify finds forms by scanning the deployed HTML at build time, so these
// attributes have to be in the prerendered output — which they are, because
// nothing here hydrates. No database, no serverless function, no key.
//
// netlify-honeypot names a field a human never sees and a bot fills in.
// Submissions land in Netlify -> Forms, and you publish them from the
// dashboard. That step is the moderation: nothing a stranger types reaches
// the site on its own.
const FORM_PROPS = (name) => ({
  name,
  method: 'POST',
  action: '/thank-you',
  'data-netlify': 'true',
  'netlify-honeypot': 'bot-field',
});

const Hidden = ({ name }) => (
  <>
    <input type="hidden" name="form-name" value={name} />
    <p className="hidden">
      <label>Leave this empty<input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
    </p>
  </>
);

const Field = ({ label, hint, children }) => (
  <label className="mt-4 block first:mt-0">
    <span className="text-[14px] font-bold">{label}</span>
    {hint && <span className="mt-0.5 block text-[12.5px] text-ink-2">{hint}</span>}
    {children}
  </label>
);

const input = 'mt-1.5 w-full rounded-ctl border border-line-strong bg-white px-3 py-2.5 text-[15px] min-h-tap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-protea';

const Submit = ({ children }) => (
  <button type="submit"
          className="mt-6 min-h-[52px] w-full rounded-ctl bg-protea px-6 text-[15.5px] font-bold text-white hover:bg-protea-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-protea md:w-auto">
    {children}
  </button>
);

/** Dark band, then prose. Same shape as Results so the site reads as one thing. */
const InfoPage = ({ title, intro, children }) => (
  <Layout>
    <div className="bg-ink px-4 pb-14 pt-7 md:px-10 md:pb-16 md:pt-12">
      <div className="mx-auto max-w-[760px]">
        <nav className="mb-3 text-[13px] text-[#8B94A1]">
          <a href="/" className="hover:text-white">Home</a> <span className="px-1">/</span>
          <span className="text-white">{title}</span>
        </nav>
        <h1 className="text-pretty font-dsp text-[28px] font-extrabold leading-tight text-white md:text-[40px]">{title}</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[#A3AEBB] md:text-[16.5px]">{intro}</p>
      </div>
    </div>
    <article className="mx-auto max-w-[760px] px-4 pb-16 pt-10 md:px-10 md:pb-24">{children}</article>
  </Layout>
);

const H2 = ({ children }) => <h2 className="mt-10 font-dsp text-[20px] font-bold first:mt-0 md:text-[25px]">{children}</h2>;
const P = ({ children }) => <p className="mt-3 text-[15px] leading-relaxed text-ink-2 md:text-[16.5px]">{children}</p>;
const Li = ({ children }) => <li className="mt-2 text-[15px] leading-relaxed text-ink-2 md:text-[16.5px]">{children}</li>;
const Ul = ({ children }) => <ul className="mt-3 list-disc pl-5 marker:text-ink-3">{children}</ul>;

/** Omitted entirely when there is no address, rather than rendering a dead link. */
const EmailButton = ({ subject, label }) => {
  const href = mailto(subject);
  if (!href) return null;
  return (
    <a href={href}
       className="mt-5 inline-flex min-h-[52px] items-center rounded-ctl bg-protea px-6 text-[15px] font-bold text-white hover:bg-protea-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-protea">
      {label}
    </a>
  );
};

const EmailLink = () => (
  <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-protea hover:underline">{CONTACT_EMAIL}</a>
);

// ---------------------------------------------------------------- listing

export const ListYourBusiness = () => (
  <InfoPage
    title="List your business"
    intro="Free, and it stays free. What it costs you is fifteen minutes and a few documents."
  >
    <P>
      HireInCapeTown only lists businesses a person has actually checked. That is the whole
      product — it is why a customer here is further along than one scrolling a Facebook thread.
      It also means listing is not instant, and we would rather tell you that up front.
    </P>

    <H2>What you send</H2>
    <Ul>
      <Li>Your ID, or the ID of whoever is responsible for the business.</Li>
      <Li>Something with your trading address on it — a municipal bill, a lease, a bank letter.</Li>
      <Li>Your trade registration, if your work needs one. PIRB for plumbers, your Department of
        Employment and Labour letter of registration for electricians.</Li>
      <Li>Public liability cover, if you carry it. Not required, but it goes on your listing.</Li>
    </Ul>
    <P>
      Anyone legitimate has sent this set to an insurer or a landlord before. If you would rather
      not, that is fine — this is not the right directory for you.
    </P>

    <H2>What we check</H2>
    <P>
      We verify your registration number at source, with the registering body, not from a
      photograph of a certificate. Then we write down the date we looked. That date appears on
      your listing, and we re-check it when it gets old.
    </P>

    <H2>What you get</H2>
    <Ul>
      <Li>Your own page: services, suburbs you actually reach, hours, call-out fee.</Li>
      <Li>A verified badge that means something, because we turn people away.</Li>
      <Li>Customers who call or WhatsApp you directly. We do not sit in the middle of it.</Li>
      <Li>Reviews only from customers who recorded a hire — so nobody can be review-bombed by
        someone who never used them.</Li>
    </Ul>

    <H2>What it costs</H2>
    <P>
      Nothing. There is no listing fee, no commission on work you win, and no contract. If that
      changes, it will change for new listings and you will be told before it affects you.
    </P>

    <H2>How to start</H2>
    <P>Fill this in and we will come back to you about the documents.</P>

    <form {...FORM_PROPS('business-listing')} className="mt-5 rounded-[18px] border border-line bg-white p-4 md:p-6">
      <Hidden name="business-listing" />

      <Field label="Business name"><input className={input} name="business" required /></Field>
      <Field label="Your name" hint="Who we should ask for when we call.">
        <input className={input} name="contact" required />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Phone"><input className={input} name="phone" type="tel" required /></Field>
        <Field label="WhatsApp" hint="If different from the number above.">
          <input className={input} name="whatsapp" type="tel" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email"><input className={input} name="email" type="email" required /></Field>
        <Field label="Website" hint="Optional."><input className={input} name="website" type="url" placeholder="https://" /></Field>
      </div>

      <Field label="What do you do?">
        <select className={input} name="trade" required defaultValue="">
          <option value="" disabled>Choose a trade</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.label}>{c.label}</option>)}
        </select>
      </Field>

      <Field label="Suburbs you actually get to" hint="The ones you really cover, not the whole peninsula.">
        <input className={input} name="suburbs" placeholder="Diep River, Plumstead, Wynberg" required />
      </Field>

      <Field label="Services" hint="Separate them with commas.">
        <input className={input} name="services" placeholder="Burst pipes, blocked drains, geysers" required />
      </Field>

      <Field label="Trade registration number" hint="PIRB for plumbers, Department of Employment and Labour for electricians. Leave blank if your trade has no register.">
        <input className={input} name="registration" />
      </Field>

      <Field label="Anything else we should know">
        <textarea className={input} name="notes" rows={3} />
      </Field>

      <label className="mt-5 flex items-start gap-2.5 text-[13.5px] leading-relaxed">
        <input type="checkbox" name="consent" required className="mt-0.5" />
        <span>
          I am authorised to list this business, and I understand HireInCapeTown will check my ID,
          trading address and registration before the listing shows as verified.
        </span>
      </label>

      <Submit>Send my details</Submit>
      <p className="mt-3 text-[12.5px] text-ink-2">
        We reply to everyone, including the ones we cannot list.
      </p>
    </form>

    <P>Would rather just email? {CONTACT_EMAIL ? 'Write to us at' : 'An address is coming shortly.'}{' '}
      {CONTACT_EMAIL && <EmailLink />}.</P>
  </InfoPage>
);

// ---------------------------------------------------------------- vetting

export const HowVettingWorks = () => (
  <InfoPage
    title="How vetting works"
    intro="What the verified badge means, what we actually checked, and what we did not."
  >
    <div className="flex items-start gap-3 rounded-[16px] bg-trust-tint p-4 md:p-5">
      <span className="mt-0.5 shrink-0 text-trust"><Shield size={20} /></span>
      <p className="text-[14.5px] leading-relaxed md:text-[15.5px]">
        A verified listing means a person saw the owner's ID, saw proof of the trading address,
        and confirmed the trade registration with the body that issued it — on a date we publish.
      </p>
    </div>

    <H2>The four checks</H2>
    <Ul>
      <Li><strong>Identity.</strong> We see the ID of the person responsible for the business, and
        confirm the name matches what the listing says.</Li>
      <Li><strong>Trading address.</strong> A municipal bill, lease or bank letter. Somewhere that
        exists, that you can be found at.</Li>
      <Li><strong>Trade registration.</strong> For plumbers, the PIRB register. For electricians,
        the Department of Employment and Labour letter of registration. We check the number with
        the register, never from a photograph.</Li>
      <Li><strong>Liability cover.</strong> Where a business carries it, we ask for the policy
        schedule rather than taking their word for it.</Li>
    </Ul>
    <P>
      Each check carries the date we did it. A trade registration older than a year is one we are
      no longer standing behind, so we re-check it.
    </P>

    <H2>What we do not check</H2>
    <P>
      We are honest about the edges of this. We do not inspect workmanship, we do not audit
      finances, and we cannot promise someone will arrive on time. Verification tells you a
      business is who it says it is and is registered to do the work. It does not tell you they
      will do a good job — that is what the reviews are for.
    </P>

    <H2>Reviews</H2>
    <P>
      Only a customer who recorded a hire through this site can leave a review, and one hire
      allows one review. This is enforced by the database itself, not by a rule someone could
      forget to apply. It is why a listing here might show eleven reviews where another site shows
      four hundred. Eleven real ones are worth more.
    </P>

    <H2>When something goes wrong</H2>
    <P>
      If a customer reports a problem, the listing goes to pending first and we investigate second.
      It comes off the site while we look into it. The only thing this site has is that "verified"
      means something, so we protect that ahead of any individual listing.
    </P>
    <P>
      Seen something wrong on a listing? <a href="/report" className="font-semibold text-protea hover:underline">Report it here</a>.
    </P>
  </InfoPage>
);

// ---------------------------------------------------------------- report

export const Report = () => (
  <InfoPage
    title="Report a listing"
    intro="Wrong details, a business that has closed, or a bad experience — tell us and we will act on it."
  >
    <form {...FORM_PROPS('report')} className="rounded-[18px] border border-line bg-white p-4 md:p-6">
      <Hidden name="report" />

      <Field label="Which business?" hint="The name, or paste the link to its page.">
        <input className={input} name="business" id="reportBusiness" required />
      </Field>

      <Field label="What is the problem?">
        <select className={input} name="reason" required defaultValue="">
          <option value="" disabled>Choose one</option>
          <option value="wrong-details">Wrong details — number, address or hours</option>
          <option value="closed">They have closed down</option>
          <option value="not-registered">Not registered for the work they advertise</option>
          <option value="bad-job">Something went wrong on a job</option>
          <option value="review">A review on this listing is untrue or abusive</option>
          <option value="mine">This is my business and I did not ask to be listed</option>
          <option value="other">Something else</option>
        </select>
      </Field>

      <Field label="Tell us what happened" hint="Dates and details help. If it is about a review, quote the part you mean.">
        <textarea className={input} name="detail" rows={5} required minLength={15} />
      </Field>

      <Field label="How we reach you" hint="Phone or email. We reply to every report, and we never pass it to the business.">
        <input className={input} name="contact" required />
      </Field>

      <Submit>Send report</Submit>
    </form>

    <H2>What happens next</H2>
    <P>
      If the report concerns a business's conduct or its registration, the listing goes to pending
      straight away — it comes off the public site while we look into it. We would rather remove a
      good business for a week than leave a bad one up for a day.
    </P>
    <P>
      For wrong details — a changed number, new suburbs, a business that has moved — we check with
      the business and correct it.
    </P>
    <P>
      We will tell you what we found. If a listing stays up, we will say why.
    </P>

    <H2>What this is not</H2>
    <P>
      We are not a dispute service and we cannot recover money for you. For a formal complaint
      against a plumber, the Plumbing Industry Registration Board takes those; for electrical
      work, the Department of Employment and Labour does. We will point you to the right one.
    </P>

    {/* /report?business=slug comes from the link on a business page. */}
    <script dangerouslySetInnerHTML={{ __html:
      "(function(){var s=new URLSearchParams(location.search).get('business');" +
      "var el=document.getElementById('reportBusiness');" +
      "if(s&&el&&/^[a-z0-9-]+$/.test(s))el.value=s;})();" }} />

    <H2>If you are the business</H2>
    <P>
      {CONTACT_EMAIL
        ? 'If you have been reported and want to respond, use the same address above.'
        : 'If you have been reported and want to respond, get in touch.'}{' '}
      We will not make a decision without hearing from you.
    </P>
  </InfoPage>
);

// ---------------------------------------------------------------- privacy

export const Privacy = () => (
  <InfoPage
    title="Privacy & POPIA"
    intro="Short, because there is not much to say: this site collects nothing about the people who visit it."
  >
    <H2>If you are just visiting</H2>
    <P>
      We do not set cookies. There is no analytics, no tracking pixel, no advertising network, and
      nothing is stored in your browser. We do not know who you are, we cannot follow you between
      pages, and we have no account for you because there are no accounts.
    </P>
    <P>
      One caveat, stated plainly: the site loads its fonts from Google Fonts, so Google's servers
      see your IP address when a page loads. That is the only third party involved in showing you
      this site.
    </P>
    <P>
      Contacting a business from a listing opens your own phone or email app. That conversation is
      between you and them — it does not come through us and we never see it.
    </P>

    <H2>If you are a listed business</H2>
    <P>
      We hold what the public listing shows — business name, category, suburbs served, services,
      phone, description, hours and call-out fee — plus a record of which verification checks were
      done and on what date.
    </P>
    <P>
      <strong>We do not store your documents.</strong> Your ID and proof of address are looked at
      during verification and not kept in the site's database. What is recorded is that the check
      happened and when. Verification records are not readable by anyone browsing the site; the
      database denies access to them by construction.
    </P>
    <P>
      Your listing is built from trading details you advertise publicly. If you want it changed or
      taken down, say so and we will do it the same day, no questions and no argument.
    </P>

    <H2>Your rights</H2>
    <P>
      Under the Protection of Personal Information Act you may ask what we hold about you, ask for
      it to be corrected, and ask for it to be deleted.{' '}
      {CONTACT_EMAIL
        ? <>Email {RESPONSIBLE_PARTY} at <EmailLink /> and we will action it.</>
        : <>{RESPONSIBLE_PARTY} will action any such request. A contact address for these requests
            is being set up and will be published on this page.</>}
    </P>
    <P>
      If you are not satisfied with how we handle a request, you can complain to the Information
      Regulator of South Africa.
    </P>

    <H2>Who is responsible</H2>
    <P>
      {RESPONSIBLE_PARTY} is the responsible party for the personal information on this site
      {CONTACT_EMAIL ? <>, and the address above reaches us</> : null}.
    </P>
  </InfoPage>
);

// ---------------------------------------------------------------- review

export const Review = ({ businesses }) => (
  <InfoPage
    title="Leave a review"
    intro="Only if you actually used them. We read every one before it goes up, and we publish the bad ones too."
  >
    <form {...FORM_PROPS('review')} className="rounded-[18px] border border-line bg-white p-4 md:p-6">
      <Hidden name="review" />

      <Field label="Which business?">
        <select className={input} name="business" id="reviewBusiness" required defaultValue="">
          <option value="" disabled>Choose a business</option>
          {businesses.map((b) => (
            <option key={b.slug} value={b.slug}>{b.name}</option>
          ))}
        </select>
      </Field>

      {/* Radios, not stars: they work with no JavaScript, they are reachable
          by keyboard, and a screen reader announces them properly. */}
      <fieldset className="mt-5 border-0 p-0">
        <legend className="text-[14px] font-bold">How did it go?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((n) => (
            <label key={n} className="flex min-h-tap cursor-pointer items-center gap-2 rounded-full border border-line-strong px-3.5 text-[14px] font-semibold">
              <input type="radio" name="rating" value={n} required />
              {n} {n === 1 ? 'star' : 'stars'}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="What happened?" hint="What you needed, what they did, whether you would call them again.">
        <textarea className={input} name="body" rows={5} required minLength={20} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Your name" hint="Shown as you type it. A first name and initial is fine.">
          <input className={input} name="author" required />
        </Field>
        <Field label="When was the job?">
          <input className={input} name="job_date" type="date" />
        </Field>
      </div>

      <Field label="Your phone or email" hint="Never published. We use it once, to check you are a real customer.">
        <input className={input} name="contact" required />
      </Field>

      <label className="mt-5 flex items-start gap-2.5 text-[13.5px] leading-relaxed">
        <input type="checkbox" name="consent" required className="mt-0.5" />
        <span>This is my own experience of hiring this business, and it is true.</span>
      </label>

      <Submit>Send review</Submit>
      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-2">
        Reviews are not published automatically. We check that a real job happened before
        yours appears, which is why there are not thousands of them.
      </p>
    </form>

    {/* Deep links from a business page arrive as /review?business=slug. Two
        lines of script beat a build-time page per business. */}
    <script dangerouslySetInnerHTML={{ __html:
      "(function(){var s=new URLSearchParams(location.search).get('business');" +
      "if(!s)return;var el=document.getElementById('reviewBusiness');" +
      "if(el&&[].some.call(el.options,function(o){return o.value===s;}))el.value=s;})();" }} />
  </InfoPage>
);

// ---------------------------------------------------------------- thanks

export const ThankYou = () => (
  <InfoPage title="Thank you" intro="That came through.">
    <P>
      A person reads everything sent here, usually within a day or two. If we need anything
      else from you, we will be in touch on the number or address you gave.
    </P>
    <P>
      If you were listing a business: the next step is the documents — your ID, something with
      your trading address on it, and your registration number if your trade has one.{' '}
      <a href="/how-vetting-works" className="font-semibold text-protea hover:underline">What we check and why</a>.
    </P>
    <a href="/" className="mt-5 inline-flex min-h-tap items-center rounded-ctl bg-protea px-5 text-[14.5px] font-bold text-white hover:bg-protea-deep">
      Back to HireInCapeTown
    </a>
  </InfoPage>
);

// ---------------------------------------------------------------- 404

export const NotFound = () => (
  <InfoPage title="That page is not here" intro="The link may be old, or the listing may have been taken down.">
    <P>Try one of these instead:</P>
    <Ul>
      <Li><a href="/" className="font-semibold text-protea hover:underline">Search for a business</a></Li>
      <Li><a href="/plumbers" className="font-semibold text-protea hover:underline">Plumbers</a>,{' '}
        <a href="/electricians" className="font-semibold text-protea hover:underline">electricians</a>,{' '}
        <a href="/cleaning" className="font-semibold text-protea hover:underline">cleaning</a></Li>
      <Li><a href="/report" className="font-semibold text-protea hover:underline">Tell us about a broken link</a></Li>
    </Ul>
  </InfoPage>
);
