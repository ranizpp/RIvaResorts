RIVA RESORTS WEBSITE
====================

PREVIEW ON YOUR COMPUTER
  Unzip the folder and double-click index.html. Every page, menu link and
  button works offline. (The Google Map and Google Fonts need internet.)

PAGES
  index.html          Home
  stay.html           Stay: rooms and cottages
  experiences.html    Experiences: pool, campfire, dining, play
  gatherings.html     Gatherings: events and celebrations
  location.html       Location: setting, seasons, nearby, getting here
  gallery.html        Gallery: filterable photos
  contact.html        Contact and enquiry form
  404.html            Shown for any missing page

PUT IT ONLINE (shared hosting / cPanel)
  1. Upload EVERYTHING in this folder (including the hidden .htaccess file)
     into public_html for rivaresortswayanad.in.
  2. Once SSL is active, open .htaccess and remove the # from the three
     "Force HTTPS" lines.
  3. Submit https://rivaresortswayanad.in/sitemap.xml in Google Search Console.

BEFORE LAUNCH
  - Replace every dashed gold "To confirm" placeholder with real details.
    Search the .html files for:  class="tbc"
  - Delete the "Draft preview" note: the <div class="draft-note"> line near
    the end of each .html file.
  - Swap photos by replacing files in assets/images/ with the SAME file name
    (keep JPG, about 2000px wide max).

ENQUIRIES
  All forms open WhatsApp to +91 90483 22999 with the details filled in.
  To change the number, edit WA='919048322999' in assets/js/site.js and the
  wa.me / tel: links in the .html files.

LINKING TO A ROOM
  contact.html?room=Deluxe%20Room  opens the form with that room selected.
