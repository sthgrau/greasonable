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
<LI>Some basic filtering (whole message for now) which auto hides threads that match, not just individual messages.. (this is the main thing I wanted)</LI>
<LI>Simple editor for filters</LI>
<LI>Reformatting the date strings and added support for your local time.</LI>
<LI>Youtube inline.</LI>
<LI>Alt-text for story pictures..</LI>
<LI>Plus whatever the source script did: highlighting new comments, adding floating bar to jump to new comments.</LI>
<LI>Works in both Firefox and Chrome (at least).. if I can get user-scripts to work on others, I will test them too...</LI>
<LI>Added support for Asynchronous replies.. This means you can comment and it won't reload the page. I am putting up a basic comment just to give an idea of what the comment will look like, but for now is clearly inferior to the standard.</LI>
<LI>Added support for user-specified fonts. I got a list of well supported fonts, but I am open to adding more</LI>
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
<LI>This should prompt you to install in tampermonkey</LI>
</UL>
<P>
Updating:
<UL style="list-style-type:none">
<LI>Click the tampermonkey icon near the address bar (black box with two white circles), click 'Dashboard' in the left column, near the bottom</LI>
<LI>In the 'Full Reason' line, click the cell in the 'Last Updated' column</LI>
</UL>
<HR>


Downgrade instructions:
<P>
Should there be a problem with a new version, you can go back to any version in the repository.
<UL style="list-style-type:none">
<LI>Go to: https://github.com/sthgrau/greasonable</LI>
<LI>Click on reason.user.js in the file listing window</LI>
<LI>Click the History button near the top right of the file contents frame</LI>
<LI>Find a version you are happy with (unfortunately, it appears to mix both dev and master branches, dev files should in the future have a name with 'dev' in it)</LI>
<LI>Click the button with hexadecimal text on the same line as the commit you want</LI>
<LI>Click the view button at the top right of the diff frame</LI>
<LI>Confirm the version and name are what you expect</LI>
<LI>Click on the raw button at the top right of the file contents frame</LI>
</UL>
<P>
I'll try to come up with a better solution for this
<P>
<HR>


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
There is a tab-like interface.
The first tab is for filtering users (as show in hover text).
The second tab is for content filtering (also has hover text).
The third tab is for miscellaneous stuff:
You can turn on and off inline youtube display and the filtering.. When you hit submit, it will show/hide youtube and show/hide filtered comments immediately.
You can also choose to override the fonts for both the stories and the comments. Enabling/disabling takes effect immediately.
You can now cancel as well if you screw something up.. 
<P>
This option Box is also now available on the front page, where some of the new modifications also are put into place
