# Silver Waters Healing & Consulting: Home, About, Services and Contact (Prototype v10)

Built from Prototype v1 with Sierra's feedback. Files: index.html, styles.css, script.js, assets/.

## What changed from v1
- Hero uses the supplied night image. The water ripples slowly (SVG displacement), bending the moonlight reflection. The two clouds were separated from the image and slide outward on scroll. Stars fade in and out softly, also in the services section and footer.
- Dividers are now one clean wave with a dotted line riding above it (no overlapping layers).
- Header: "Book a session". Smart header: tints after 40px, hides on scroll down, returns on scroll up.
- Credentials count up once when scrolled into view. Reiki line now mentions Ashati.
- Who this is for: the paper texture has a slow parallax; the left column no longer sticks.
- Ways to work together: section holds still while the three cards step through on scroll (desktop). Cards share one height. Clicking a tab still works.
- How a session works: section holds while the moons fill, new moon to half to full, in the deep gold.
- Start with a conversation: WebGL dotted rings over the supplied blue texture, pushed away from the pointer.
- Footer: curtain reveal with the wave as the lifting edge (square corners).

## Scroll-driven sections
Pinned at 1024px wide and 672px tall or larger. Below that they behave as normal sections.

## To replace before launch
- Pexels photos (owl, tarot) are hotlinked; download and host locally
- Jill portrait is a crop from the current site
- No booking link yet; buttons go to contact.html
- Newsletter form is a CSS-only demo

## v3 changes (carried into v4)
- New header and footer logos; hero image restored (no clouds, no water motion) and lowered so dark sky sits behind the nav.
- Rolling wave on the hero and footer edges; paused off screen and under reduced motion.
- Who section has the parallax paper; session section is flat with no parallax; first moon now fills to a quarter.
- Services track is shorter, with a progress line under the active tab.
- Meet Jill split into two sections (bio, then "The approach" with the owl); star divider under every large heading.
- Scattered, randomly placed stars replace the tiled dots.
- Closing section is now a pond: pointer and clicks drop raindrops that send rings outward.

### v3 round 2
- Stronger parallax on Who section; stars kept to the sky on the hero and services images.
- Meet Jill text centred on the portrait; mobile portrait and text share the same edges.
- Owl now has a slowly turning text ring; session section has a faint dotted ring and water-line pattern.
- Waves travel across as well as rise and fall, with dots marching along the line.
- CTA pond: no spinning dots; drops travel farther and fall at random intervals like light rain.
- Footer logo links home; Golden Cedar Collective links to goldencedarcollective.com; mobile tabs stack so all three show.

## v5 changes
- CTA shader fills the whole band; largest dots about 20% smaller.
- Mailing list section uses the gold wave dots along the bottom.
- Meet Jill text bottom-aligned to the portrait; rays sit a little further from the arch.
- Footer credit link has no underline.
- Wave dividers have a bigger swell on desktop (taller band, larger rise and fall).

## v6 changes
- Mailing list wave dots are now a faded background (lower opacity, soft masked edges, cut off at the bottom of the section, behind the text).

## v7 changes
- Mailing list wave dots now sit centred behind the heading and form, faded in every direction with no hard cut-off.

## v8 changes
- Who this is for: parallax is much stronger (the paper moves roughly 45% of scroll distance).
- New pages built from the home page: about.html, services.html, contact.html. They share the header, hero art, waves, footer, newsletter, star dividers, scattered stars and the pond shader band.
- About: meet Jill, "A practice rooted in clarity", the approach section with the owl, what you can expect.
- Services: three service blocks (anchors #consulting, #intuitive, #energy), "A session shaped around you", how it works, FAQ.
- Contact: demo form (no backend yet), contact details, choose the path, what to expect, FAQ.

## Copy to confirm with Jill
- Reply time of 1 to 2 business days and "confidential support" wording on the Contact page (taken from the old mockup).
- FAQ answers on Services and Contact are written from facts already on the site; no prices, session lengths or booking platform are stated.
- How online sessions are held (platform) is not stated anywhere yet.
- Jill's path paragraph on About is adapted from the old mockup into third person.

## To replace before launch (still open)
- Pexels photos (owl, tarot) hotlinked; Jill portrait is a stand-in crop.
- Contact and newsletter forms are CSS-only demos.

## v9 changes
- Services page: each service is now its own full-width band (paper texture, then navy with the faint dotted pattern, then paper), with a star divider under each heading and the badge centred in a ringed halo at a fixed size so it lines up with the text block.
- Removed the wave dots from the newsletter background on every page. The asset (assets/img/wave-dots.png) stays in the folder for use elsewhere.

## v10 changes
- Header "Book a session" button: hover and keyboard focus now fill light with dark text, so the label no longer disappears.
