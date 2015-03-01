<PRE>
Based on http://bakkot.github.io/SlateStarComments/ssc.js .. Thanks Bakkot!
Originally developed in chrome with tampermonkey..
Also tested with pale moon with greasemonkey..

Features:
Ability to go back to the last 5 refresh times in case you accidentally refresh before finishing.
Thread hiding (or at least adapted for reason).
Some basic filtering (whole message for now) which auto hides threads
that match, not just individual messages.. (this is the main thing I wanted)
Simple editor for filters
Reformatting the date strings and added support for your local time.
Youtube inline.
Alt-text for story pictures..
Plus whatever the source script did: highlighting new comments, adding floating bar to jump to new comments.
Works in both Firefox and Chrome (at least).. if I can get user-scripts to work on others, I will test them too...


Using the below method (vs method posted 2/28/2015 in comments) will allow greasemonkey to update for you


Firefox install:

Install greasemonkey using add-on manager.
Go to: https://github.com/sthgrau/greasonable/raw/master/reason.user.js
This should prompt you to install in greasemonkey
That should be it, just reload..

Chrome install:

Install tampermonkey using extensions manager.
Go to: https://github.com/sthgrau/greasonable/raw/master/reason.user.js
This should prompt you to install in greasemonkey




</PRE>
How to use:
<P>
New comments are bounded by an orange box and are also listed in a floating box in the top right (click [+] to expand)
<P>
Comments can be jumped to from the floating box, most reliably by clicking on the date, clicking on hyperlinked names go to the original hyperlink dstination)
<P>
Replies to the current user will be highlighed by green instead, and the time marked green in the floating box.. This is a little problematic to start since the login box is not reliably available at the start. Therefore, I am setting it in localStorage, so the first time, it may not work..
<P>
The "<<" and ">>" go backwards and forwards in time with regard to times loaded with new comments. In case you need to restart, or the browser crashes, etc..
<P>
If you click the 'Hide thread' link at the bottom of a comment, it hides that comment plus any responses.
<P>
To change the filter list, click '[filters]' at the bottom right. Enter/remove each filter one per line and click '[submit]' .
