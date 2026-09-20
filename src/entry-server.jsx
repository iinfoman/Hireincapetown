import { renderToStaticMarkup } from 'react-dom/server';
import { Home } from './pages/Home.jsx';
import { Results } from './pages/Results.jsx';
import { Business } from './pages/Business.jsx';
import { ListYourBusiness, HowVettingWorks, Report, Privacy, Review, ThankYou } from './pages/Info.jsx';

// renderToStaticMarkup, not renderToString: nothing hydrates, so React's
// data-reactroot bookkeeping would be dead weight in every page.
export const PAGES = { Home, Results, Business, ListYourBusiness, HowVettingWorks, Report, Privacy, Review, ThankYou };
export const render = (name, props) => renderToStaticMarkup(PAGES[name](props));
