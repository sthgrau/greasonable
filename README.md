<P>
Based on http://bakkot.github.io/SlateStarComments/ssc.js .. Thanks Bakkot!
<P>
Originally developed in chrome with tampermonkey..
Also tested with pale moon with greasemonkey..

<P>
Features:
<UL>
<LI>Ability to go back to the last 5 refresh times in case you accidentally refresh before finishing.</LI>
<LI>Thread hiding (or at least adapted for reason).</LI>
<LI>Some basic filtering (whole message for now) which auto hides threads</LI>
<LI>that match, not just individual messages.. (this is the main thing I wanted)</LI>
<LI>Simple editor for filters</LI>
<LI>Reformatting the date strings and added support for your local time.</LI>
<LI>Youtube inline.</LI>
<LI>Alt-text for story pictures..</LI>
<LI>Plus whatever the source script did: highlighting new comments, adding floating bar to jump to new comments.</LI>
<LI>Works in both Firefox and Chrome (at least).. if I can get user-scripts to work on others, I will test them too...</LI>
</UL>


<P>
<P>
Using the below method (vs method posted 2/28/2015 in comments) will allow greasemonkey to update for you


<HR>
<P>
<P>
Firefox install:

<P>
<UL style="list-style-type:none">
<LI>Install greasemonkey using add-on manager.</LI>
<LI>Go to: https://github.com/sthgrau/greasonable/raw/master/reason.user.js</LI>
<LI>This should prompt you to install in greasemonkey</LI>
<LI>That should be it, just reload..</LI>
</UL>
<P>
Updating:
<UL style="list-style-type:none">
<LI>Click the monkey drop down near the search bar, near the top right. Click 'Manage User Scripts'</LI>
<LI>Right click 'Full Reason' and click 'Find Updates'</LI>
</UL>


<HR>
<P>
<P>
Chrome install:

<P>
<UL style="list-style-type:none">
<LI>Install tampermonkey using extensions manager.</LI>
<LI>Go to: https://github.com/sthgrau/greasonable/raw/master/reason.user.js</LI>
<LI>This should prompt you to install in greasemonkey</LI>
</UL>
<P>
Updating:
<UL style="list-style-type:none">
<LI>Click the tampermonkey icon near the address bar (black box with two white circles), click 'Dashboard' in the left column, near the bottom</LI>
<LI>In the 'Full Reason' line, click the cell in the 'Last Updated' column</LI>
</UL>
<HR>




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
The top text area is for filtering users (as show in hover text).
The second text area is for content filtering (also has hover text).
You can also turn on and off inline youtube display and the filtering.. When you hit submit, it will show/hide youtube and show/hide filtered comments immediately.
You can now cancel as well if you screw something up.. 
