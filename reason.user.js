// ==UserScript==
// @name         Full Reason dev
// @namespace    http://github.com/sthgrau/greasonable
// @version      0.9.4.3
// @description  does something useful
// @author       Me
// @match        http://reason.com/*
// @grant        none
// ==/UserScript==

// run to reset:
// localStorage.removeItem('visited-' + location.pathname);

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
//console.log(window.parent);
//console.log(window.top);
//console.log(window.self);

// Global variables are fun!
var lastGivenDate, commentCountText, commentsList, divDiv, dateInput, commentsScroller;

var maxDatesPerPost=6;
var myIndex=0; // keep track of what the current date viewed is. List is sorted in reverse to latest is first (ie element 0)
var pathString = 'visited-' + location.pathname; //made this global because it is now used when manually entering a date
var userIgnoreList = 'reason-ignore-list';
var commentIgnoreList = 'reason-comment-ignore-list';
var myNameTag = 'reason-user-name';
var inlineYoutubeTag = 'reason-inline-youtube';
var filterTag = 'reason-filter-comments';
var customFontTag = 'reason-custom-fonts';
var commentFontTag = 'reason-comment-font';
var storyFontTag = 'reason-story-font';
var localTzTag = 'reason-use-local-tz';
var ytLoaded=0;
var unhidden="Hide thread";
var hidden="Unhide thread";
var myComments=[];
var myReplies=[];
var cssFontClass='cfclass';
var defaultFont = 'Arial, Helvetica, sans-serif';
var fonts = [ 'Georgia, serif' , '"Palatino Linotype", "Book Antiqua", Palatino, serif' , '"Times New Roman", Times, serif',
             'Arial, Helvetica, sans-serif' , '"Arial Black", Gadget, sans-serif' , '"Comic Sans MS", cursive, sans-serif' ,
             'Impact, Charcoal, sans-serif' , '"Lucida Sans Unicode", "Lucida Grande", sans-serif' , 'Tahoma, Geneva, sans-serif' ,
             '"Trebuchet MS", Helvetica, sans-serif' , 'Verdana, Geneva, sans-serif' , '"Courier New", Courier, monospace' ,
             '"Lucida Console", Monaco, monospace' ];
//number to append to new async comments to make them unique
var globnum=0;

var myName="anonymousHRuserYouAreAdickifYouusethishandle";
if ( typeof(localStorage[myNameTag]) != 'undefined' ) {
    myName = localStorage[myNameTag];
    console.log("Setting my name to " + myName);
}
if ( typeof(localStorage[userIgnoreList]) == 'undefined' ) {
    localStorage[userIgnoreList] = "buttplug|shrike|gambol|tony";
}
if ( typeof(localStorage[commentIgnoreList]) == 'undefined' ) {
    localStorage[commentIgnoreList] = "gambol|kochtopus";
}
if ( typeof(localStorage[customFontTag]) == 'undefined' ) {
    localStorage[customFontTag] = false;
}
if ( typeof(localStorage[commentFontTag]) == 'undefined' ) {
    localStorage[commentFontTag] = defaultFont;
}
if ( typeof(localStorage[storyFontTag]) == 'undefined' ) {
    localStorage[storyFontTag] = defaultFont;
}
if ( typeof(localStorage[inlineYoutubeTag]) == 'undefined' ) {
    localStorage[inlineYoutubeTag] = true;
}
if ( typeof(localStorage[filterTag]) == 'undefined' ) {
    localStorage[filterTag] = true;
}
if ( typeof(localStorage[localTzTag]) == 'undefined' ) {
    localStorage[localTzTag] = true;
}
localStorage[localTzTag] = true;

//damn autoplay ads

/*
//breaking regular videos.. so disabling for now
ht=document.body.getElementsByTagName('iframe');
for (i=0;i<ht.length;i++) {
    ht[i].style.display='none';
}
*/


// *** Sets up borders and populates comments list

function border(since, updateTitle) {
    lastGivenDate = since;
    var commentList = document.getElementById('comments').querySelectorAll('.com-block');
    var mostRecent = since;
    var newComments = [];
    
    // Walk comments, setting borders as appropriate and saving new comments in a list
    for(var i = 0; i < commentList.length; i++) {
        var myReplyNum=parseInt(commentList[i].classList[1].replace("reply",""));
        var postTime = Date.parse(commentList[i].querySelector('time').getAttribute('datetime'));
        var replyToMe=0;
        if (postTime > since) {
            commentList[i].classList.add('new-comment');
            if (myReplies.indexOf(commentList[i].id) > -1 ) {
                //if ( typeof(commentList[i-1]) == "object"  && myReplyNum < 5 && commentList[i-1].classList.contains('myPost')) {
                commentList[i].classList.add("replyToMe");
                replyToMe=1;
            }
            newComments.push({time: postTime, ele: commentList[i], toMe: replyToMe});
            if (postTime > mostRecent) {
                mostRecent = postTime;
            }
        }
        else {
            commentList[i].classList.remove("replyToMe");
            commentList[i].classList.remove('new-comment');
        }
    }
    var newCount = newComments.length;
    
    // Maybe add new comment count to title
    if (updateTitle) {
        document.title = '(' + newCount + ') ' + document.title;
    }
    
    // Populate the floating comment list
    commentCountText.data = '' + newCount + ' comment' + (newCount == 1 ? '' : 's') + ' since ';
    commentsList.innerHTML = '';
    if (newCount > 0 ) {
        divDiv.style.display = 'block';
        newComments.sort(function(a, b){return a.time - b.time;});
        for(i = 0; i < newCount; i++) {
            var ele = newComments[i].ele;
            var newLi = document.createElement('li');
            newLi.className = "ncl";
            var dateString = ( localStorage[localTzTag] == "true" ) ? returnFormattedDateString(new Date(newComments[i].time)) : newComments[i].time;
            if (newComments[i].toMe == 1 ) {
                newLi.innerHTML = '<span class="comments-commenter">' + ele.querySelector('strong').innerHTML  + '</span>' + ' <span class="comments-date-to-me">' + dateString + '</span>';
            }
            else {
                newLi.innerHTML = '<span class="comments-commenter">' + ele.querySelector('strong').innerHTML  + '</span>' + ' <span class="comments-date">' + dateString + '</span>';
            }
            newLi.addEventListener('click', function(ele){return function(){ele.scrollIntoView(true);};}(ele));
            commentsList.appendChild(newLi);
        }
    }
    else {
        divDiv.style.display = 'none';
    }
    return mostRecent;
}


// *** Toggles visibility of comment which invoked it

function commentToggle() {
    var myComment = this.parentElement.parentElement;
    var myBody = myComment.querySelector('div.content');
    var myMeta = myComment.querySelector('p.meta');
    //var myChildren = myComment.nextElementSibling;
    var myChildren = document.getElementsByClassName("parent-" + myComment.id);
    if(this.textContent == unhidden) {
        this.textContent = hidden;
        myComment.style.opacity = '.6';
        myBody.style.display = 'none';
        myMeta.style.display = 'none';
        for (var k=0;k<myChildren.length; k++ ) {
            myChildren[k].style.display  = 'none';
        }
    }
    else {
        this.textContent = unhidden;
        myComment.style.opacity = '1';
        myBody.style.display = 'block';
        myMeta.style.display = 'block';
        for (var k=0;k<myChildren.length; k++ ) {
            myChildren[k].style.display  = 'block';
        }
    }
    myComment.scrollIntoView(true);
}





// ** Set up highlights on first run
function makeMainCss() {
    var styleEle = document.createElement('style');
    styleEle.type = 'text/css';
    styleEle.id = "main-style-css";
    styleEle.textContent = 'li.new-comment { border: 1px solid #f37221; }' +
        'li.replyToMe { border: 2px solid #10DD1B; }' +
        '.commentId { color: #C5C5C5; }' +
        '.bad-match { color: #C5C5C5; }' +
        '.new-text { color: #C5C5C5; display: none; }' +
        '.new-comment .new-text { display: inline; }' +
        '.comments-floater { position: fixed; right: 4px; top: 4px; padding: 2px 5px; width: 250px;font-size: 14px; border-radius: 5px; background: rgba(250, 250, 250, 0.90); }' +
        '.show-filter-floater { position: fixed; right: 4px; bottom: 0px; margin-bottom:0px; padding: 2px 5px; }' +
        '.filter-floater { position: fixed; right: 4px; bottom: 0px; margin-bottom:0px; padding: 2px 5px; height: 25vh; width: 250px;font-size: 14px; border-radius: 5px; background: rgba(250, 250, 250, 0.90); }' +
        '.ufilters { width: 250px; height: 20vh; }' +
        '.cfilters { width: 250px; height: 20vh; }' +
        '.miscfilters { width: 250px; height: 19vh; }' +
        '.comments-scroller { word-wrap: break-word; max-height: 500px; max-height: 70vh; overflow-y:scroll; }' +
        '.comments-date { font-size: 11px; }' +
        '.comments-date-to-me { color: #109D1B; font-size: 11px; }' +
        'a.comment-reply-link { font-size: 13px; }' +
        '.semantic-cell { display: table-cell; }' +
        '.cct-span { white-space: nowrap; }' +
        '.date-input { width: 100%; box-sizing: border-box; }' +
        '.input-span { width: 100%; padding-left: 5px; }' +
        '.hider { position: absolute; left: -22px; top: 6px;}' +
        '.next { position: absolute; left: -44px; top: 6px;}' +
        '.prev { position: absolute; left: -66px; top: 6px;}';

    styleEle.textContent = styleEle.textContent + '';
    document.head.appendChild(styleEle);
}

function makeHighlight() {
    // *** Inject some css used by the floating list
    
    makeMainCss();
    
    fontOverride();
    
    // *** Create and insert the floating list of comments, and its contents
    
    
    // The floating box.
    var floatBox = document.createElement('div');
    floatBox.className = 'comments-floater';
    
    
    // Container for the text node below.
    var cctSpan = document.createElement('span');
    cctSpan.className = 'semantic-cell cct-span';
    
    // The text node which says 'x comments since'
    commentCountText = document.createTextNode('');
    
    
    // Container for the text box below.
    var inputSpan = document.createElement('span');
    inputSpan.className = 'semantic-cell input-span';
    
    // The text box with the date.
    dateInput = document.createElement('input');
    dateInput.className = 'date-input';
    dateInput.addEventListener('blur', function(){
        var newDate = Date.parse(dateInput.value);
        if (isNaN(newDate)) {
            alert('Given date not valid.');
            dateInput.value = ( localStorage[localTzTag] == 'true' ) ? returnFormattedDateString(new Date(lastGivenDate)) : lastGivenDate;
            return;
        }
        border(newDate, false);
        lastVisits = localStorage[pathString].split(",");
        if ( lastVisits.sort(function(a,b) {return ( a != newDate )})[0] != newDate.toString() ) { //um, my hack to see if date is already in the list
            lastVisits.push(newDate.toString());
            localStorage[pathString] = lastVisits.sort(function(a,b){return b-a}).slice(0,maxDatesPerPost).join(); //save last maxDatesPerPost dates
        }
    }, false);
    dateInput.addEventListener('keypress', function(e){
        if (e.keyCode === 13) {
            dateInput.blur();
        }
    }, false);
    
    
    // Container for the comments list and the '[+]'
    divDiv = document.createElement('div');
    divDiv.style.display = 'none';
    
    // The '[+]'
    var hider = document.createElement('span');
    hider.textContent = '[+]';
    hider.className = 'hider';
    hider.addEventListener('click', function(){
        if (commentsScroller.style.display != 'none') {
            commentsScroller.style.display = 'none';
        }
        else {
            commentsScroller.style.display = '';
        }
    }, false);
    var prev = document.createElement('span');
    prev.textContent = '<<';
    prev.className = 'prev';
    prev.addEventListener('click', function(){
        getLastVisit(1);
    }, false);
    var next = document.createElement('span');
    next.textContent = '>>';
    next.className = 'next';
    next.addEventListener('click', function(){
        getLastVisit(-1);
    }, false);
    
    // Scrollable container for the comments list 
    commentsScroller = document.createElement('div');
    commentsScroller.className = 'comments-scroller';
    commentsScroller.style.display = 'none';
    
    // Actual list of comments
    commentsList = document.createElement('ul');
    
    
    
    // Insert all the things we made into each other and ultimately the document.
    
    cctSpan.appendChild(commentCountText);
    floatBox.appendChild(cctSpan);
    
    inputSpan.appendChild(dateInput);
    floatBox.appendChild(inputSpan);
    
    floatBox.appendChild(prev);
    divDiv.appendChild(hider);
    commentsScroller.appendChild(commentsList);
    divDiv.appendChild(commentsScroller);
    floatBox.appendChild(divDiv);
    floatBox.appendChild(next);
    
    document.body.appendChild(floatBox);
    
    
    
    
    
    // *** Retrieve the last-visit time from storage, border all comments made after, and save the time of the latest comment in storage for next time 
    getLastVisit(0); //made function as this will be called by next and prev "buttons"
}

function getLastVisit(delta)
{
    delta = typeof delta != 'undefined' ? delta : 0; //default to show current index
    myIndex = myIndex + delta;
    var lastVisits = [];
    if ( typeof(localStorage[pathString]) != 'undefined' ) {
        lastVisits = localStorage[pathString].split(",");
    }
    if ( myIndex < 0 ) {
        myIndex = 0; //keep it to a minimum of 0
    }
    
    var lastVisit=0;
    if ( myIndex >= lastVisits.length ) {
        myIndex = lastVisits.length - 1; //keep it to the earliest record
    }
    else {
        lastVisit = parseInt(lastVisits[myIndex]);
        if (isNaN(lastVisit)) {
            lastVisit = 0; // prehistory! Actually 1970, which predates all SSC comments, so we're good.
        }
    }
    dateInput.value = (localStorage[localTzTag] == 'true' ) ? returnFormattedDateString(new Date(lastVisit)) : lastVisit;
    var mostRecent = border(lastVisit, false);
    lastVisits.push(mostRecent);
    if ( ( lastVisits.length == 1 ) || ( mostRecent != lastVisits[0] ) ) {
        localStorage[pathString] = lastVisits.sort(function(a,b){return b-a}).slice(0,maxDatesPerPost).join(); //save last maxDatesPerPost dates
    }
}

function makeOptionsForm() {
    
    var showFilterBox = document.createElement('div');
    showFilterBox.className = 'show-filter-floater';
    var filterBox = document.createElement('div');
    filterBox.className = 'filter-floater';
    filterBox.style.display='none';
    
    var userFiltTab = document.createElement('span');
    userFiltTab.textContent = '[users]';
    userFiltTab.className = 'userFiltTab';
    userFiltTab.addEventListener('click', function(){
        utext.style.display='';
        ctext.style.display='none';
        miscBox.style.display='none';
    }, false);
    filterBox.appendChild(userFiltTab);
    var commFiltTab = document.createElement('span');
    commFiltTab.textContent = '[comments]';
    commFiltTab.className = 'commFiltTab';
    commFiltTab.addEventListener('click', function(){
        ctext.style.display='';
        utext.style.display='none';
        miscBox.style.display='none';
    }, false);
    filterBox.appendChild(commFiltTab);
    var miscFiltTab = document.createElement('span');
    miscFiltTab.textContent = '[misc]';
    miscFiltTab.className = 'commFiltTab';
    miscFiltTab.addEventListener('click', function(){
        ctext.style.display='none';
        utext.style.display='none';
        miscBox.style.display='';
    }, false);
    filterBox.appendChild(miscFiltTab);
    
    filterBox.appendChild(document.createElement('br'));
    utext=document.createElement('textarea');
    utext.className='ufilters';
    utext.title = 'User Filter';
    filterBox.appendChild(utext);
    ctext=document.createElement('textarea');
    ctext.className='cfilters';
    ctext.title = 'Comment Filter';
    ctext.style.display='none';
    filterBox.appendChild(ctext);
    
    var miscBox = document.createElement('div');
    miscBox.className='miscfilters';
    miscBox.style.display='none';
    var cb=document.createElement('input');
    cb.type='checkbox';
    cb.className='youtubeCb';
    cb.value='1';
    cb.checked =  ( localStorage[inlineYoutubeTag] == "true"  ) ? true : false;
    
    var lab=document.createElement('label');
    lab.innerHTML='YouTube';
    miscBox.appendChild(cb);
    miscBox.appendChild(lab);
    var cbf=document.createElement('input');
    cbf.type='checkbox';
    cbf.className='filterCb';
    cbf.value='1';
    cbf.checked =  ( localStorage[filterTag] == "true" ) ? true : false;
    var labf=document.createElement('label');
    labf.innerHTML='Filter Comments';
    miscBox.appendChild(cbf);
    miscBox.appendChild(labf);
    
    // miscBox.appendChild(document.createElement('br'));
    var ltzcb=document.createElement('input');
    ltzcb.type='checkbox';
    ltzcb.className='localTzCb';
    ltzcb.value='1';
    ltzcb.checked =  ( localStorage[localTzTag] == "true" ) ? true : false;
    var labltz=document.createElement('label');
    labltz.innerHTML='Use your Time';
    //miscBox.appendChild(ltzcb);
    // miscBox.appendChild(labltz);
    
    var storyFontSelectLab=document.createElement('label');
    storyFontSelectLab.innerHTML='Story font';
    var storyFontSelect = document.createElement('select');
    storyFontSelect.className = 'story-font'; 
    for (var i=0; i<fonts.length; i++ ) {
        var display=fonts[i].split(',')[0].replace(/"/g,'');
        var selected = (localStorage[storyFontTag] == fonts[i]) ? "selected" : "";
        storyFontSelect[storyFontSelect.length] = new Option(display, fonts[i], selected);
        storyFontSelect[storyFontSelect.length-1].selected = (localStorage[storyFontTag] == fonts[i]) ? true : false;
    }
    miscBox.appendChild(document.createElement('br'));
    miscBox.appendChild(storyFontSelectLab);
    miscBox.appendChild(storyFontSelect);
    miscBox.appendChild(document.createElement('br'));
    
    var commFontSelectLab=document.createElement('label');
    commFontSelectLab.innerHTML='Comment font';
    var commFontSelect = document.createElement('select');
    commFontSelect.className = 'comment-font'; 
    for (var i=0; i<fonts.length; i++ ) {
        var display=fonts[i].split(',')[0].replace(/"/g,'');
        var selected = (localStorage[commentFontTag] == fonts[i]) ? "selected" : "";
        commFontSelect[commFontSelect.length] = new Option(display, fonts[i], selected);
        commFontSelect[commFontSelect.length-1].selected = (localStorage[commentFontTag] == fonts[i]) ? true : false;
    }
    miscBox.appendChild(commFontSelectLab);
    miscBox.appendChild(commFontSelect);
    
    var fscb=document.createElement('input');
    fscb.type='checkbox';
    fscb.className='fontCb';
    fscb.value='1';
    fscb.checked =  ( localStorage[customFontTag] == "true"  ) ? true : false;
    
    var fslab=document.createElement('label');
    fslab.innerHTML='Use custom fonts';
    miscBox.appendChild(fscb);
    miscBox.appendChild(fslab);
    filterBox.appendChild(miscBox);
    
    filterBox.appendChild(document.createElement('br'));
    var filtHider = document.createElement('span');
    filtHider.textContent = '[filters]';
    filtHider.className = 'filtHider';
    filtHider.addEventListener('click', function(){
        utext.value=localStorage[userIgnoreList].split('|').join("\n");
        ctext.value=localStorage[commentIgnoreList].split('|').join("\n");
        cb.checked =  ( localStorage[inlineYoutubeTag] == "true"  ) ? true : false;
        cbf.checked =  ( localStorage[filterTag] == "true"  ) ? true : false;
        fscb.checked =  ( localStorage[customFontTag] == "true"  ) ? true : false;
        ltzcb.checked = ( localStorage[localTzTag] == "true" ) ? true : false;
        
        filterBox.style.display = '';
        subHider.style.display='';
        canHider.style.display='';
        filtHider.style.display='none';
    }, false);
    
    var subHider = document.createElement('span');
    subHider.textContent = '[submit]';
    subHider.className = 'subHider';
    subHider.style.display='none';
    subHider.addEventListener('click', function(){
        localStorage[userIgnoreList] = utext.value.split("\n").join("|").replace(/ +\|/g,"|").replace(/\| +/g,"|");
        localStorage[commentIgnoreList] = ctext.value.split("\n").join("|").replace(/ +\|/g,"|").replace(/\| +/g,"|");
        
        if ( localStorage[inlineYoutubeTag] == "true" && cb.checked == false ) {
            hideYouTube();
        }
        if ( localStorage[inlineYoutubeTag] == "false" && cb.checked == true ) {
            showYouTube();
        }
        if ( localStorage[customFontTag] == "true" && fscb.checked == false ) {
            localStorage[customFontTag] = fscb.checked;
            localStorage[storyFontTag] = storyFontSelect.value;
            localStorage[commentFontTag] = commFontSelect.value;
            fontOverride();
        }
        if ( ( localStorage[customFontTag] == "false" && fscb.checked == true ) || (fscb.checked == true && (
            ( localStorage[storyFontTag] != storyFontSelect.value ) ||
            ( localStorage[commentFontTag] != commFontSelect.value ) ) ) ){
            localStorage[storyFontTag] = storyFontSelect.value;
            localStorage[commentFontTag] = commFontSelect.value;
            localStorage[customFontTag] = fscb.checked;
            
            fontOverride();
        }
        
        localStorage[inlineYoutubeTag] = cb.checked;
        localStorage[filterTag] = cbf.checked;
        
        localStorage[localTzTag] = ltzcb.checked;
        
        filterBox.style.display = 'none';
        subHider.style.display='none';
        canHider.style.display='none';
        filtHider.style.display='';
        hideBastards();
    }, false);
    filterBox.appendChild(subHider);
    var canHider = document.createElement('span');
    canHider.textContent = '[cancel]';
    canHider.className = 'canHider';
    canHider.style.display='none';
    canHider.addEventListener('click', function(){
        filterBox.style.display = 'none';
        subHider.style.display='none';
        canHider.style.display='none';
        filtHider.style.display='';
    }, false);
    filterBox.appendChild(canHider);
    showFilterBox.appendChild(filterBox);
    showFilterBox.appendChild(filtHider);
    
    document.body.appendChild(showFilterBox);
    
}

function fontOverride() {
    var tmpStyleEle;
    var isNew=0;
    if ( document.getElementById(cssFontClass) ) {
        tmpStyleEle = document.getElementById(cssFontClass);
    }
    else {
        isNew=1;
        tmpStyleEle = document.createElement('style');
        tmpStyleEle.type = 'text/css';
        tmpStyleEle.id = cssFontClass;
    }
    var storyFont = (localStorage[customFontTag] == "true" ) ? localStorage[storyFontTag] : defaultFont;
    var commentFont = (localStorage[customFontTag] == "true" ) ? localStorage[commentFontTag] : defaultFont;
    tmpStyleEle.textContent = tmpStyleEle.textContent + 'li.com-block { font-family: ' + commentFont + '; } ' +
        'div.cancomment { font-family: ' + commentFont + '; } ' +
        'p.disclaimer { font-family: ' + commentFont + '; } ';
    tmpStyleEle.textContent = tmpStyleEle.textContent + 'div.postcontent { font-family: ' + storyFont + '; } ' +
        'header.mainheading { font-family: ' + storyFont + '; } footer.bio { font-family: ' + storyFont + '; } ' +
        'h2.title  { font-family: ' + storyFont + '; } ';
    tmpStyleEle.textContent = tmpStyleEle.textContent + '';
    if ( isNew == 1 ) {
        document.head.appendChild(tmpStyleEle);
    }
}

function makeShowHide() {
    // *** Add buttons to show/hide threads

    var comments = document.getElementById('comments').querySelectorAll('.com-block');

    var lastReplyNum = 0;
    var parentStack = [];
    if (document.getElementById('user_login_control').childNodes.length > 0 && document.getElementsByClassName('logged_in_as')[0].getElementsByClassName('handle').length > 0) {
        myName = document.getElementsByClassName('logged_in_as')[0].getElementsByClassName('handle')[0].innerHTML;
        console.log("My Name is " + myName);
    }
    for (var i = 0; i < comments.length; ++i) {
        myReplyId = comments[i].id;
        myReplyNum = parseInt(comments[i].classList[1].replace("reply", ""));
        parentStack[myReplyNum] = myReplyId;
        var commenter;
        if (comments[i].getElementsByClassName('meta')[0].getElementsByTagName('strong')[0].getElementsByTagName('a').length > 0) {
            commenter = comments[i].getElementsByClassName('meta')[0].getElementsByTagName('strong')[0].getElementsByTagName('a')[0].innerHTML;
        }
        else {
            commenter = comments[i].getElementsByClassName('meta')[0].getElementsByTagName('strong')[0].innerHTML;
        }

        if (commenter == myName) {
            comments[i].classList.add("myPost");
            myComments.push(myReplyId);
        }
        // a little hackish, but otherwise would get lots of false hits on the lowest threading
        /*
         if ( typeof(comments[i-1]) == "object"  && myReplyNum < 5 && comments[i-1].classList.contains('myPost')) {
         comments[i].classList.add("replyToMe");
         }
         */
        if (myComments.indexOf(parentStack[myReplyNum - 1]) > -1) {
            myReplies.push(myReplyId);
        }
        for (k = myReplyNum - 1; k >= 0; k--) {
            comments[i].classList.add("parent-" + parentStack[k]);
        }
    }

    for (var i = 0; i < comments.length; ++i) {

        var hideLink = document.createElement('a');
        hideLink.className = 'comment-reply-link';
        hideLink.style.textDecoration = 'underline';
        hideLink.textContent = unhidden;

        hideLink.addEventListener('click', commentToggle, false);

        var divs = comments[i].children;
        var replyEle = divs[divs.length - 1];

        replyEle.appendChild(hideLink);

        var reply = comments[i].getElementsByClassName('comment_reply')[0];

        if (reply) {

            reply.id = "reply-" + comments[i].id;
            var newReply = document.createElement('button');
            newReply.id = "newReply-" + comments[i].id;
            newReply.onclick = function () {
                setFormId(this);
            };

            newReply.innerHTML = '&nbsp; &nbsp; async reply';
            //reply.style.display='none';
            comments[i].getElementsByClassName('commentactions')[0].appendChild(newReply);
            //reply.onclick = function() { setFormId(this); }
            //    }
        }
    }
}

function setFormId(that) {
    var li=that.parentElement.parentElement;
    var reply = document.getElementById("reply-" + li.id);
    var form=li.getElementsByTagName('form')[0];
    if (typeof(form) == "undefined" ) {
      reply.click();
      form=li.getElementsByTagName('form')[0];
    }
    if (getSelection().toString().length > 0 && li.getElementsByClassName('content')[0].innerHTML.match(getSelection().toString())) {
      form.getElementsByTagName('textarea')[0].value="<cite>" + li.getElementsByClassName('meta')[0].getElementsByTagName('strong')[0].innerHTML + " said: </cite><blockquote><P>" + getSelection().toString() + "</P></blockquote>";
    }
    if (document.getElementById('span-form-controls') == null ) {
        var sfc = document.createElement('span');
        sfc.id='span-form-controls';
        form.getElementsByTagName('label')[0].appendChild(sfc);
    }
    if ( document.getElementById('preview_content') != null ) {
       document.getElementById('preview_content').remove();
    }
    var sfc = document.getElementById('span-form-controls');
    sfc.innerHTML='';

    var clearDoc=document.createElement('button');
    clearDoc.id="clear-" + li.id;
    clearDoc.onclick = function() { form.getElementsByTagName('textarea')[0].value=''; };
    clearDoc.innerHTML='clear';
    sfc.appendChild(clearDoc);
    var resetDoc=document.createElement('button');
    resetDoc.id="reset-" + li.id;
    resetDoc.onclick = function() { form.getElementsByTagName('textarea')[0].value=""; form.parentElement.style.display='none'; };
    resetDoc.innerHTML='reset';
    sfc.appendChild(resetDoc);

    form.parentElement.style.display='';
    var id = li.id;
    
    form.id="form-" + id;
    $('#form-' + id).submit(function() {
        $.ajax({
            type: $(this).attr('method'),
            url: $(this).attr('action'),
            data: $('#form-' + id).serializeArray(),
            timeout: 3000,
            success: function() {
                console.log($('#form-' + id));
                var newid=li.id + globnum++;
                ///$(this).parentElement.style.display='none';
                // fwiw, duplicate post bug not in pseudo posting code
                var newli=document.createElement('li');
                newli.className=li.className.concat(" parent-" + li.id);
                var oldReplyClass = li.className.match(/reply[0-9]/)[0];
                if (oldReplyClass != 'reply5' ) {
                    newReplyClass="reply" + (parseInt(oldReplyClass.replace("reply","")) + 1);
                    newli.className=newli.className.replace(oldReplyClass,newReplyClass);
                }
                newli.id=newid;
                console.log(newli.id);
                var newmeta=document.createElement('p');
                newmeta.className='meta';
                newmeta.innerHTML="you, of course | @now | #";
                var newtextspan = document.createElement('span');
                newtextspan.className='new-text';
                newtextspan.innerHTML='~new~ ~async~';
                newmeta.appendChild(newtextspan);
                newli.appendChild(newmeta);
                var newcontent=document.createElement('div');
                newcontent.className='content';
                newcontent.innerHTML=$('#form-' + id)[0].getElementsByTagName('textarea')[0].value;
                newli.appendChild(newcontent);
                li.parentNode.insertBefore(newli, li.nextSibling);
                $('#form-' + id)[0].getElementsByTagName('textarea')[0].value="";
                if ( document.getElementById('preview_content') != null ) {
                  document.getElementById('preview_content').remove();
                }
                $('#form-' + id)[0].parentElement.style.display='none';
                // Whatever you want here, like close dialog box, etc. 
            }
        });
        return false;
    });
    /*
        success: function() {
            $(this).getElementsByTagName('textarea')[0].value="";
            $(this).parentElement.style.display='none';
            // Whatever you want here, like close dialog box, etc. 
        }
        });
    return false;
*/
}


function returnFormattedDateString(tx) {
    var datestring = tx.getFullYear() + "/";
    datestring = datestring + (tx.getMonth()<=8 ? "0" + (tx.getMonth()+1) : (tx.getMonth()+1)) + "/";
    datestring = datestring + (tx.getDate()<=9 ? "0" + tx.getDate() : tx.getDate()) + " ";
    datestring = datestring + (tx.getHours()<=9 ? "0" + tx.getHours() : tx.getHours()) + ":";
    datestring = datestring + (tx.getMinutes()<=9 ? "0" + tx.getMinutes() : tx.getMinutes()) + ":";
    datestring = datestring + (tx.getSeconds()<=9 ? "0" + tx.getSeconds() : tx.getSeconds());
    return datestring;
}

function returnFormattedDateString2(tx2,txstring) {
    var datestring;
    if ( localStorage[localTzTag] == "true" ) {
        var tx=new Date(tx2);
        datestring = tx.getFullYear() + "/";
        datestring = datestring + (tx.getMonth()<=8 ? "0" + (tx.getMonth()+1) : (tx.getMonth()+1)) + "/";
        datestring = datestring + (tx.getDate()<=9 ? "0" + tx.getDate() : tx.getDate()) + " ";
        datestring = datestring + (tx.getHours()<=9 ? "0" + tx.getHours() : tx.getHours()) + ":";
        datestring = datestring + (tx.getMinutes()<=9 ? "0" + tx.getMinutes() : tx.getMinutes()) + ":";
        datestring = datestring + (tx.getSeconds()<=9 ? "0" + tx.getSeconds() : tx.getSeconds());
    }
    else {
    }
    return datestring;
}

function makeNewText() {
    // *** Add ~new~ to new comments
    
    var comments = document.getElementById('comments').querySelectorAll('.com-block');
    //fake out last-child css
    var tzLi = document.createElement('li');
    tzLi.id='comments-in-tz';
    var hrs=new Date().getTimezoneOffset()/60*-1;
    tzLi.innerHTML="Times shown in GMT" + ( hrs < 0 ? hrs : "+" + hrs);
    document.getElementById('comments').getElementsByTagName('ul')[0].appendChild(tzLi);
    
    var storyTime=document.getElementsByClassName('mainheading')[0].getElementsByTagName('time')[0];
    if ( typeof(storyTime) != 'undefined' && localStorage[localTzTag] == 'true' ) {
        storyTime.innerHTML=returnFormattedDateString(new Date(storyTime.getAttributeNode('datetime').value));
        // storyTime.innerHTML=returnFormattedDateString2(storyTime.getAttributeNode('datetime').value, storyTime.innerHTML);
    }
    
    for(var i=0; i<comments.length; ++i) {
        var myReplyNum=parseInt(comments[i].classList[1].replace("reply",""));
        var badMatch = document.createElement('p');
        badMatch.className = 'bad-match';
        badMatch.style.display = 'none';
        var commentAct = comments[i].getElementsByClassName('commentactions')[0];
        commentAct.appendChild(badMatch);
        
        var newText = document.createElement('span');
        newText.className = 'new-text';
        if (myReplies.indexOf(comments[i].id) > -1) {
            //if ( typeof(comments[i-1]) == "object"  && myReplyNum < 5 && comments[i-1].classList.contains('myPost')) {
            // if (comments[i].classList.contains('replyToMe')) {
            newText.textContent = '~new~ ~toMe~';
        }
        else {
            newText.textContent = '~new~';
        }
        var commentId = document.createElement('span');
        commentId.className = 'commentId';
        commentId.textContent = comments[i].id.split("_")[1];
        
        var meta = comments[i].querySelector('p.meta');
        t=meta.getElementsByTagName('time')[0];
        tx=new Date(t.getAttributeNode('datetime').value);
        var datestring = returnFormattedDateString(tx);
        if ( localStorage[localTzTag] == 'true' ) {
            t.innerHTML=datestring;
        }
        meta.appendChild(commentId);
        meta.appendChild(newText);
        var youtube=localStorage[inlineYoutubeTag];
        var myBody = comments[i].querySelector('div.content');
        var myBodyLinks = myBody.getElementsByTagName('a');
        for (j=0; j < myBodyLinks.length; j++ ) {
            var myBodyLink = myBodyLinks[j].href;
            if ( myBodyLink.search("youtube") > -1 || myBodyLink.search("youtu.be") > -1 ) {
                var newFrame = document.createElement('iframe');
                var movId;
                if ( myBodyLink.search("youtube") > -1 ) {
                    movId = myBodyLink.split("/")[3].split("=")[1];
                    newFrame.src=myBodyLink.replace("watch?v=", "v/");
                }
                else {
                    movId = myBodyLink.split("/")[3];
                    newFrame.src=myBodyLink.replace("youtu.be/", "www.youtube.com/v/");
                }
                newFrame.id = "player";
                var tag = document.createElement('script');
                
                if (ytLoaded === 0 ) {
                    tag.src = "https://www.youtube.com/iframe_api";
                    var firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    ytLoaded=1;
                }
                
                var player;
                var done = false;
                newFrame.className="youtube-player";
                newFrame.title="YouTube video player";
                newFrame.width=640;
                newFrame.height=360;
                newFrame.style.enabled = ( youtube == "true" ) ? '' : 'none';
                myBody.appendChild(newFrame);
            }
        }
    }
}

function hideYouTube() {
    console.log('shuttin em down');
    yts=document.getElementsByClassName('youtube-player');
    for(var y=0;y<yts.length;y++ ) {
        yts[y].style.display="none";
    }
}
function showYouTube() {
    console.log('light em up');
    yts=document.getElementsByClassName('youtube-player');
    for(var y=0;y<yts.length;y++ ) {
        yts[y].style.display="";
    }
}

var divs = [];
var parent;
function hideBastards() {
    var filter = localStorage[filterTag];
    var comments = document.getElementById('comments').querySelectorAll('.com-block');
    userIgnoreListText = localStorage[userIgnoreList].toLowerCase();
    commentIgnoreListText = localStorage[commentIgnoreList].toLowerCase();
    if ( userIgnoreListText.length > 0 || commentIgnoreListText.length > 0 ) {
        for(var i=0; i<comments.length; i++) {
            if ( filter == "true" && userIgnoreListText.length > 0 && comments[i].getElementsByClassName('comment-reply-link')[0].innerHTML == unhidden && comments[i].getElementsByClassName('meta')[0].innerHTML.toLowerCase().search(userIgnoreListText) > -1 )  {
                var match = comments[i].getElementsByClassName('meta')[0].innerHTML.toLowerCase().match(userIgnoreListText);
                var badMatch=comments[i].getElementsByClassName('bad-match')[0];
                badMatch.style.display='';
                badMatch.innerHTML = (badMatch.length > 0) ? badMatch.innerHTML + match + " ": "Hide reasons (user): " + match + " ";
                comments[i].getElementsByClassName('comment-reply-link')[0].click();
            }
            else if ( filter == "true" && commentIgnoreListText.length > 0 && comments[i].getElementsByClassName('comment-reply-link')[0].innerHTML == unhidden && comments[i].getElementsByClassName('content')[0].innerHTML.toLowerCase().search(commentIgnoreListText) > -1 )  {
                var match = comments[i].getElementsByClassName('content')[0].innerHTML.toLowerCase().match(commentIgnoreListText);
                var badMatch=comments[i].getElementsByClassName('bad-match')[0];
                badMatch.style.display='';
                badMatch.innerHTML = (badMatch.length > 0) ? badMatch.innerHTML + match + " ": "Hide reasons (content): " + match + " ";
                comments[i].getElementsByClassName('comment-reply-link')[0].click();
            }
            else if (comments[i].getElementsByClassName('comment-reply-link')[0].textContent == hidden) {
                var badMatch=comments[i].getElementsByClassName('bad-match')[0];
                badMatch.style.display='none';
                badMatch.innerHTML = '';
                comments[i].getElementsByClassName('comment-reply-link')[0].click();
            }
        }
    }
}

function formatPostImageText() {
    post=document.getElementsByClassName('postcontent');
    for(var h=0; h<post.length;h++ ) {
        postImgs=post[h].getElementsByClassName('addcaption');
        for(var i=0; i<postImgs.length; i++) {
            imgCap=postImgs[i].getElementsByClassName('caption')[0];
            imgAlt=postImgs[i].getElementsByTagName('img')[0].alt;
            imgTitle=postImgs[i].getElementsByTagName('img')[0].title;
            if (imgAlt.length > 0 && imgAlt != imgCap.innerHTML ) {
                if (imgTitle.length > 0 && imgTitle != imgCap.innerHTML && imgTitle != imgAlt) {
                    imgCap.innerHTML = imgAlt + ((imgCap.innerHTML.length > 0 ) ? (" - " + imgCap.innerHTML) : "");
                    imgCap.innerHTML = imgTitle + ((imgCap.innerHTML.length > 0 ) ? (" - " + imgCap.innerHTML) : "");
                }
                else {
                    imgCap.innerHTML = imgAlt + ((imgCap.innerHTML.length > 0 ) ? (" - " + imgCap.innerHTML) : "");
                }
            }
            else if (imgTitle.length > 0 && imgTitle != imgCap.innerHTML && imgTitle != imgAlt) {
                imgCap.innerHTML = imgTitle + ((imgCap.innerHTML.length > 0 ) ? (" - " + imgCap.innerHTML) : "");
            }
        }
    }
}

function getMyName() {
    if ( document.getElementsByClassName('logged_in_as')[0].getElementsByClassName('handle').length > 0 ) {
        myName=document.getElementsByClassName('logged_in_as')[0].getElementsByClassName('handle')[0].innerHTML;
        console.log("My Name is " + myName);
        localStorage[myNameTag]=myName;
    }
}

// Run iff we're on a page which looks like a post
if(((location.pathname.substring(0, 3) == '/ar') || (location.pathname.substring(0, 8) == '/blog/20') || (location.pathname.substring(0, 10) == '/reasontv/')) && ! inIframe() ) {
    if ( ! inIframe() ) {
        console.log("says NOT in iframe");
    }
    else{
        console.log("says in iframe");
    }
    
    
    console.log("time to make the donuts");
    formatPostImageText();
    makeHighlight();
    makeOptionsForm();
    makeShowHide();
    makeNewText();
    hideBastards();
    for(var m=0;m<10;m++ ) {
        setTimeout(getMyName,5000);
    }
    
    if (document.baseURI.match("#comment_") ) {
        var gotoComment=document.baseURI.split("#")[1];
        setTimeout(document.getElementById(gotoComment).scrollIntoView(true),2000);
    }
    else if (document.baseURI.match("#comment") ) {
        setTimeout(document.getElementById('comments').scrollIntoView(true),2000);
    }
        
}
else if (location.pathname.substring(0,7).match(/\/blog\/?$/) && ! inIframe()) {
    console.log("I've done a little collage work myself");
    formatPostImageText();
    makeMainCss();
    makeOptionsForm();
    fontOverride();
    var storyTimes=document.getElementsByClassName('mainheading');
    for (var e=0; e<storyTimes.length;e++) {
        storyTime=storyTimes[e].getElementsByTagName('time')[0];
        if ( typeof(storyTime) != 'undefined' && localStorage[localTzTag] == 'true' ) {
            storyTime.innerHTML=returnFormattedDateString(new Date(storyTime.getAttributeNode('datetime').value));
            // storyTime.innerHTML=returnFormattedDateString2(storyTime.getAttributeNode('datetime').value, storyTime.innerHTML);
        }
    }
}
    
