-- A third public state, and somewhere to put a business's own website.
--
-- 'listed' means: this business is real and its details came from a public
-- source, but nobody has checked a document. It appears on the site with no
-- verified badge and an explicit "not verified" marker.
--
-- The distinction is the product. A directory that vets before it publishes
-- starts empty, and an empty directory helps nobody — so listings may go up
-- unverified, as long as the page never claims otherwise.

alter type hireincapetown.business_status add value if not exists 'listed' before 'verified';

-- Many unverified listings have a website and no phone number. Without this
-- there is no way to contact them, which makes the listing pointless.
alter table hireincapetown.businesses add column if not exists website text;
