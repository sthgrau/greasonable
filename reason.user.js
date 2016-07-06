// ==UserScript==
// @name         Full Reason
// @namespace    http://github.com/sthgrau/greasonable
// @version      0.9.4.8.2
// @description  does something useful
// @author       Me
// @match        http*://reason.com/*
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
var myCharTablePage=0;
var myCharTabNumRows=8;
var myCharTabNumCols=16;
var globalIsFlat=0;
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
var clearCommentTag = 'reason-show-clear-buttons';
var noThreadingTag = 'reason-no-threading';
var keyboardShowTag = 'reason-show-keyboard';
var gravatarShowTag = 'reason-show-gravatar';
var gravatarSize=20;
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
var maxCommentLength="1500";
//number to append to new async comments to make them unique
var globnum=0;
var loadCount=0;

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
if ( typeof(localStorage[clearCommentTag]) == 'undefined' ) {
    localStorage[clearCommentTag] = true;
}
if ( typeof(localStorage[noThreadingTag]) == 'undefined' ) {
    localStorage[noThreadingTag] = false;
}
if ( typeof(localStorage[keyboardShowTag]) == 'undefined' ) {
    localStorage[keyboardShowTag] = false;
}
if ( typeof(localStorage[gravatarShowTag]) == 'undefined' ) {
    localStorage[gravatarShowTag] = false;
}
if ( typeof(localStorage[localTzTag]) == 'undefined' ) {
    localStorage[localTzTag] = true;
}
//localStorage[localTzTag] = true;

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
    var comments = document.getElementById('comments').querySelectorAll('.com-block');
    var mostRecent = since;
    var newComments = [];
    var parentStack = [];
    // Walk comments, setting borders as appropriate and saving new comments in a list
    for(var i = 0; i < comments.length; i++) {
        myReplyId = comments[i].id;
        if ( localStorage[gravatarShowTag] == "true" ) {
            var myImg = document.createElement("img");
            myImg.src = "https://www.gravatar.com/avatar/" + comments[i].getAttribute("data-user-id") + "?d=identicon&s=" + gravatarSize;
            myImg.className = "gravatars";
            myImg.title = comments[i].getAttribute("data-user-id");
            comments[i].getElementsByClassName("meta")[0].insertBefore(myImg,comments[i].getElementsByClassName("meta")[0].children[0]);
        }
       // myReplyNum = parseInt(comments[i].classList[1].replace("reply", ""));
        myReplyNum = parseInt(comments[i].className.match(/reply[0-9]/)[0].replace("reply",""));
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
        if (myComments.indexOf(parentStack[myReplyNum - 1]) > -1) {
            myReplies.push(myReplyId);
        }
        var replyToMe=0;
      //  var myReplyNum=parseInt(comments[i].classList[1].replace("reply",""));
       // var postTime = Date.parse(comments[i].querySelector('time').getAttribute('datetime'));
        var postTime = parseInt(comments[i].getAttributeNode('data-comment-timestamp').value) * 1000;
        if (postTime > since) {
            comments[i].classList.add('new-comment');
            if (myReplies.indexOf(comments[i].id) > -1 ) {
           // if (myReplies.indexOf(comments[i].id) > -1  || ( i > 0 && comments[i-1].classList.contains('myPost'))) {
                //if ( typeof(comments[i-1]) == "object"  && myReplyNum < 5 && comments[i-1].classList.contains('myPost')) {
                comments[i].classList.add("areplyToMe");
                replyToMe=1;
            }
            newComments.push({time: postTime, ele: comments[i], toMe: replyToMe, visible: comments[i].style.display});
            if (postTime > mostRecent) {
                mostRecent = postTime;
            }
        }
        else {
            comments[i].classList.remove("areplyToMe");
            comments[i].classList.remove('new-comment');
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
            newLi.id = "ncl-" + ele.id;
            var dateString = ( localStorage[localTzTag] == "true" ) ? returnFormattedDateString(new Date(newComments[i].time)) : newComments[i].time;

            var commentSpan = document.createElement('span');
            commentSpan.innerHTML=ele.querySelector('strong').innerHTML;
            commentSpan.classList = 'comments-commenter';
            var dateSpan = document.createElement('span');
            dateSpan.innerHTML="&nbsp;" + dateString;
            if ( newComments[i].toMe == 1 ) {
                dateSpan.classList.add('comments-date-to-me');
                dateSpan.title = "Reply to your comment";
            }
            else {
                dateSpan.classList.add('comments-date');
            }
            if ( newComments[i].visible !== ''  || ele.classList.contains('hide-me') ) {
                dateSpan.classList.add('bad-match');
                dateSpan.title += "Hidden from view";
            }
            newLi.appendChild(commentSpan);
            newLi.appendChild(dateSpan);
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
        'li.areplyToMe { border: 2px solid #10DD1B; }' +
        'a { color: #f37221 !important; }' + 
        '.commentId { color: #C5C5C5; }' +
        '.bad-match { color: #C5C5C5; }' +
        '.errorDisplayDiv { color: #FF3535; }' +
        '.new-text { color: #C5C5C5; display: none; }' +
        '.new-comment .new-text { display: inline; }' +
        '.anchor-floater { position: fixed; top: 1; left: 1; bottom: 1; right: 1; margin: auto; width: 200px; height: 130px; padding: 2px 5px; background: rgba(250, 250, 250, 0.90);}' +
        '.comments-floater { position: fixed; right: 4px; top: 4px; padding: 2px 5px; width: 250px;font-size: 14px; border-radius: 5px; background: rgba(250, 250, 250, 0.90); }' +
        '.keyboardFloater { position: fixed; right: 180px; top: 244px; padding: 2px 5px; width: 200px;font-size: 12px; border-radius: 5px; background: rgba(250, 250, 250, 0.90); }' +
        '.show-filter-floater { position: fixed; right: 4px; bottom: 0px; margin-bottom:0px; padding: 2px 5px; }' +
        '.filter-floater { position: fixed; right: 4px; bottom: 0px; margin-bottom:0px; padding: 2px 5px; height: 25vh; width: 250px;font-size: 14px; border-radius: 5px; background: rgba(250, 250, 250, 0.90); }' +
        '.ufilters { width: 250px; height: 20vh; }' +
        '.cfilters { width: 250px; height: 20vh; }' +
        '.miscfilters { width: 250px; height: 19vh; }' +
        '.comments-scroller { word-wrap: break-word; max-height: 500px; max-height: 70vh; overflow-y:scroll; }' +
        '.comments-date { font-size: 11px; }' +
        '.comments-date-to-me { color: #109D1B; font-size: 11px !important; }' +
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
    floatBox.id = 'comments-floater';
    
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
    dateInput.disabled = true;
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
    hider.addEventListener('click', function(ele){
        if (commentsScroller.style.display != 'none') {
            commentsScroller.style.display = 'none';
            ele.target.textContent = '[+]';
        }
        else {
            commentsScroller.style.display = '';
            ele.target.textContent = '[-]';
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
    commentsScroller.id = 'comments-scroller';
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
 //   console.log("delta == " + delta);
 //   console.log("before myIndex == " + myIndex);
    delta = typeof delta != 'undefined' ? delta : 0; //default to show current index
    myIndex = myIndex + delta;
 //   console.log("myIndex == " + myIndex);
    var lastVisits = [];
    if ( typeof(localStorage[pathString]) != 'undefined' ) {
        lastVisits = localStorage[pathString].split(",");
 //   console.log("lastVisits == " + lastVisits);
    }
    loadCount = loadCount + 1;
    if ( loadCount == 2 ) {
        myIndex = myIndex + delta;
    }
    if ( myIndex < 0 ) {
        myIndex = 0; //keep it to a minimum of 0
    }
 //   console.log("myIndex == " + myIndex);
    var lastVisit=0;
    if ( myIndex > lastVisits.length ) {
        myIndex = lastVisits.length; //keep it to the earliest record
 //   console.log("myIndex == " + myIndex);
    }
    else {
        lastVisit = parseInt(lastVisits[myIndex]);
        if (isNaN(lastVisit)) {
            lastVisit = 0; // prehistory! Actually 1970, which predates all SSC comments, so we're good.
        }
    }
 //   console.log("lastVisit == " + lastVisit);
    dateInput.value = (localStorage[localTzTag] == 'true' ) ? returnFormattedDateString(new Date(lastVisit)) : lastVisit;
 //   console.log("dateInput.value == " + dateInput.value);
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
    userFiltTab.style.fontWeight=700;
    userFiltTab.title = 'Patterns to filter based on username';
    userFiltTab.className = 'userFiltTab';
    userFiltTab.addEventListener('click', function(){
        utext.style.display='';
        userFiltTab.style.fontWeight=700;
        commFiltTab.style.fontWeight=400;
        miscFiltTab.style.fontWeight=400;
        ctext.style.display='none';
        miscBox.style.display='none';
    }, false);
    filterBox.appendChild(userFiltTab);
    var commFiltTab = document.createElement('span');
    commFiltTab.textContent = '[comments]';
    commFiltTab.title = 'Patterns to filter based on comment text';
    commFiltTab.className = 'commFiltTab';
    commFiltTab.addEventListener('click', function(){
        ctext.style.display='';
        userFiltTab.style.fontWeight=400;
        commFiltTab.style.fontWeight=700;
        miscFiltTab.style.fontWeight=400;
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
        userFiltTab.style.fontWeight=400;
        commFiltTab.style.fontWeight=400;
        miscFiltTab.style.fontWeight=700;
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
    
    miscBox.appendChild(document.createElement('br'));
    var ltzcb=document.createElement('input');
    ltzcb.type='checkbox';
    ltzcb.className='localTzCb';
    ltzcb.value='1';
    ltzcb.checked =  ( localStorage[localTzTag] == "true" ) ? true : false;
    var labltz=document.createElement('label');
    labltz.innerHTML='Use your Time';
    miscBox.appendChild(ltzcb);
    miscBox.appendChild(labltz);
    
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

    var cc=document.createElement('input');
    cc.type='checkbox';
    cc.className='clearCommentsCb';
    cc.value='1';
    cc.checked =  ( localStorage[clearCommentTag] == "true"  ) ? true : false;
    var cclab=document.createElement('label');
    cclab.innerHTML='Show Clear/Reset buttons';
    miscBox.appendChild(document.createElement('br'));
    miscBox.appendChild(cc);
    miscBox.appendChild(cclab);

    var nt=document.createElement('input');
    nt.type='checkbox';
    nt.className='noThreadingCb';
    nt.value='0';
    nt.checked =  ( localStorage[noThreadingTag] == "true"  ) ? true : false;
    var ntlab=document.createElement('label');
    ntlab.innerHTML='Do Not Thread';
    miscBox.appendChild(document.createElement('br'));
    miscBox.appendChild(nt);
    miscBox.appendChild(ntlab);

    var kb=document.createElement('input');
    kb.type='checkbox';
    kb.className='keyboardShowCb';
    kb.value='0';
    kb.checked =  ( localStorage[keyboardShowTag] == "true"  ) ? true : false;
    var kblab=document.createElement('label');
    kblab.innerHTML='Show keyboard';
    miscBox.appendChild(document.createElement('br'));
    miscBox.appendChild(kb);
    miscBox.appendChild(kblab);

    var gt=document.createElement('input');
    gt.type='checkbox';
    gt.className='gravatarShowCb';
    gt.value='0';
    gt.checked =  ( localStorage[gravatarShowTag] == "true"  ) ? true : false;
    var gtlab=document.createElement('label');
    gtlab.innerHTML='Show gravatar';
    miscBox.appendChild(document.createElement('br'));
    miscBox.appendChild(gt);
    miscBox.appendChild(gtlab);

    filterBox.appendChild(miscBox);
    
    
    filterBox.appendChild(document.createElement('br'));
    var filtHider = document.createElement('span');
    filtHider.textContent = '[filters]';
    filtHider.className = 'filtHider';
    filtHider.addEventListener('click', function(){
// var userIgnoreList = 'reason-ignore-list'; var commentIgnoreList = 'reason-comment-ignore-list';
        utext.value=localStorage[userIgnoreList].split('|').join("\n");
        ctext.value=localStorage[commentIgnoreList].split('|').join("\n");
        cb.checked =  ( localStorage[inlineYoutubeTag] == "true"  ) ? true : false;
        cc.checked =  ( localStorage[clearCommentTag] == "true"  ) ? true : false;
        nt.checked =  ( localStorage[noThreadingTag] == "true"  ) ? true : false;
        kb.checked =  ( localStorage[keyboardShowTag] == "true"  ) ? true : false;
        gt.checked =  ( localStorage[gravatarShowTag] == "true"  ) ? true : false;
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
        localStorage[userIgnoreList] = utext.value.split("\n").join("|").replace(/ +\|/g,"|").replace(/\| +/g,"|").replace(/\|\|/g,"|").replace(/\|$/,"");
        localStorage[commentIgnoreList] = ctext.value.split("\n").join("|").replace(/ +\|/g,"|").replace(/\| +/g,"|").replace(/\|\|/g,"|").replace(/\|$/,"");
        
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
        if ( localStorage[keyboardShowTag] == "false" && kb.checked == true ) {
            document.getElementById("CharacterInputDiv").style.display="";
        }
        if ( localStorage[keyboardShowTag] == "true" && kb.checked == false ) {
            document.getElementById("CharacterInputDiv").style.display="none";
        }
        /*
        if ( localStorage[gravatarShowTag] == "false" && gt.checked == true ) {
            document.getElementById("gravatars").style.display="";
        }
        if ( localStorage[gravatarShowTag] == "true" && kb.checked == false ) {
            document.getElementById("gravatars").style.display="none";
        }
        */
        
        localStorage[inlineYoutubeTag] = cb.checked;
        localStorage[clearCommentTag] = cc.checked;
        localStorage[noThreadingTag] = nt.checked;
        localStorage[keyboardShowTag] = kb.checked;
        localStorage[gravatarShowTag] = gt.checked;
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
       // myReplyNum = parseInt(comments[i].classList[1].replace("reply", ""));
        myReplyNum = parseInt(comments[i].className.match(/reply[0-9]/)[0].replace("reply",""));
        parentStack[myReplyNum] = myReplyId;
/*
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
    var id = li.id;
    var reply = document.getElementById("reply-" + id);
    var form=li.getElementsByTagName('form')[0];
    if (typeof(form) == "undefined" ) {
      reply.click();
      form=li.getElementsByTagName('form')[0];
    }
    form.getElementsByTagName('textarea')[0].value="";
    form.id="form-" + id;

    createFormattingDiv();

    form.parentElement.style.display='';
    
    $('#form-' + id).unbind("submit");
    $('#form-' + id).submit(function() {
        $.ajax({
            type: $(this).attr('method'),
            url: $(this).attr('action'),
            data: $('#form-' + id).serializeArray(),
            timeout: 3000,
            success: function(resp, textStatus, request) {
                console.log($('#form-' + id));
                var newid=li.id + globnum++;

                var testErr = $(resp).find('.error');
                ///$(this).parentElement.style.display='none';
                // fwiw, duplicate post bug not in pseudo posting code
                if ( testErr.length == 0 ) {
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
                  document.getElementsByClassName('errorDisplayDiv')[0].innerHTML="";
                  $('#form-' + id)[0].parentElement.style.display='none';
                }
                else {
                    document.getElementsByClassName('errorDisplayDiv')[0].innerHTML=testErr[0].getElementsByTagName('li')[0].innerHTML;
              //      alert("Submit failed with: " + testErr[0].getElementsByTagName('li')[0].innerHTML);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                console.log("Status: " + textStatus + "Error: " + errorThrown);
            // alert("Status: " + textStatus + "Error: " + errorThrown); 
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

function updateNumCharsInElement(text,limitElement,max) {
    limitElement.innerHTML=text.length + "/" + max;
}

function createFormattingDiv() {
    var ta=document.getElementsByTagName('textarea')[0];
    var id;
    if ( ta.parentElement.parentElement.classList.contains('reply') ) {
        id="comment_" + ta.parentElement.getElementsByClassName('comment_parentnumber')[0].value;
    }
    else {
        id="mainStory";
    }

    if ( ta.parentElement.getElementsByClassName('characterCount').length > 0 ) {
        ta.parentElement.getElementsByClassName('characterCount')[0].remove();
    }
    var ccdiv=document.createElement('div');
    ccdiv.id='characterCount' + id;
    ccdiv.className='characterCount';
    ccdiv.innerHTML="0/" + maxCommentLength;
    ta.parentElement.getElementsByTagName('textarea')[0].onkeyup=function(x) { 
        var cc=x.target.parentElement.getElementsByClassName('characterCount')[0]; 
        updateNumCharsInElement(x.target.value,cc,maxCommentLength);
    }
    ta.parentElement.appendChild(ccdiv);
    var errdiv=document.createElement('div');
    errdiv.id='error' + id;
    errdiv.className='errorDisplayDiv';
    errdiv.innerHTML="";
    ta.parentElement.appendChild(errdiv);
    
    
    var sfc;
    if (!ta.contains(document.getElementById('span-form-controls'))) {
        sfc = document.createElement('span');
        sfc.id='span-form-controls';
        ta.parentElement.getElementsByTagName('label')[0].appendChild(sfc);
    }
    if ( document.getElementById('preview_content') != null ) {
       document.getElementById('preview_content').remove();
    }
    sfc = document.getElementById('span-form-controls');
    sfc.innerHTML='';

    if ( localStorage[clearCommentTag] == "true" ) {
        var clearDoc=document.createElement('button');
        clearDoc.id="clear-" + id;
        clearDoc.setAttribute('title', 'Clear text');
        clearDoc.onclick = function(but) { 
            var form=but.target.parentElement.parentElement.parentElement;
            form.getElementsByTagName('textarea')[0].value="";  
            return false; 
        };
        clearDoc.innerHTML='clear';
        sfc.appendChild(clearDoc);
        var resetDoc=document.createElement('button');
        resetDoc.id="reset-" + id;
        resetDoc.setAttribute('title', 'Clear text and close form');
        resetDoc.onclick = function(but) { 
            var form=but.target.parentElement.parentElement.parentElement;
            console.log(form);
            form.getElementsByTagName('textarea')[0].value=""; 
            if ( but.target.id != 'reset-mainStory' ) {
                form.parentElement.style.display='none'; 
            }
            return false; 
        };
        resetDoc.innerHTML='reset';
        sfc.appendChild(resetDoc);
    }
 
    // trying to get some fancy element editing buttons going
    var anchorTag=document.createElement('button');
    anchorTag.id="anchor-" + id;
    anchorTag.setAttribute('title', 'Insert link');
    anchorTag.onclick = function(but){ 
        var form=but.target.parentElement.parentElement.parentElement;
        doAnchorDialog(form.getElementsByTagName('textarea')[0]); 
        return false; 
    };
    anchorTag.innerHTML="&lt;a>";
    sfc.appendChild(anchorTag);

    var boldTag=document.createElement('button');
    boldTag.id="bold-" + id;
    boldTag.setAttribute('title', 'Bold text');
    boldTag.onclick = function(but) { 
        var form=but.target.parentElement.parentElement.parentElement;
        myFormatText("b",form.getElementsByTagName('textarea')[0]); 
        return false; 
    };
    boldTag.innerHTML="&lt;b>";
    sfc.appendChild(boldTag);

    var bqTag=document.createElement('button');
    bqTag.id="bq-" + id;
    bqTag.setAttribute('title', 'Blockquote text');
    bqTag.onclick = function(but) { 
        var form=but.target.parentElement.parentElement.parentElement;
        myFormatText("blockquote",form.getElementsByTagName('textarea')[0]); 
        return false; 
    };
    bqTag.innerHTML="&lt;blockquote>";
    sfc.appendChild(bqTag);
    
    var citeTag=document.createElement('button');
    citeTag.id="cite-" + id;
    citeTag.setAttribute('title', 'Cite text');
    citeTag.onclick = function(but) { 
        var form=but.target.parentElement.parentElement.parentElement;
        console.log(form);
        console.log(but);
        myFormatText("cite",form.getElementsByTagName('textarea')[0]); 
        return false; 
    };
    citeTag.innerHTML="&lt;cite>";
    sfc.appendChild(citeTag);

    var italTag=document.createElement('button');
    italTag.id="ital-" + id;
    italTag.setAttribute('title', 'Italicize text');
    italTag.onclick = function(but) { 
        var form=but.target.parentElement.parentElement.parentElement;
        myFormatText("i",form.getElementsByTagName('textarea')[0]); 
        return false; 
    };
    italTag.innerHTML="&lt;i>";
    sfc.appendChild(italTag);
    
    var strTag=document.createElement('button');
    strTag.id="str-" + id;
    strTag.setAttribute('title', 'Strike text');
    strTag.onclick = function(but) { 
        var form=but.target.parentElement.parentElement.parentElement;
        myFormatText("s",form.getElementsByTagName('textarea')[0]); 
        return false; 
    };
    strTag.innerHTML="&lt;strike>";
    sfc.appendChild(strTag);

    /*
    //italics not supported
    var ulTag=document.createElement('button');
    ulTag.id="ul-" + id;
    ulTag.setAttribute('title', 'Underline text');
    ulTag.onclick = function(but) { 
        var form=but.target.parentElement.parentElement.parentElement;
        myFormatText("u",form.getElementsByTagName('textarea')[0]); 
        return false; 
    };
    ulTag.innerHTML="&lt;u>";
    sfc.appendChild(ulTag);
    */
}

function myFormatText(tag,ta) {
    var reptext="";
    var startPos = ta.selectionStart;
    var endPos = ta.selectionEnd;
    if ( tag == "a" ) {
        reptext="<a href=" + ta.value.substring(startPos, endPos) + ">" + ta.value.substring(startPos, endPos) + "</a>";
    }
    else if ( document.getSelection().anchorNode != null && ! document.getSelection().anchorNode.contains(ta) && document.getSelection().toString().length > 0 ) {
      console.log('select-o-matic charged!');
      var tmpdiv = document.createElement("div");
      var content=document.getElementById('content-col');
      var comment=document.getElementById('commentcontainer');
      var cite="Reason";
      var pre="";
      var post="";
      var citeTime="";
      if (comment.contains(document.getSelection().anchorNode)) {
          var li;
          var notli=document.getSelection().anchorNode;
          for (var a=0; a < 10; a++ ) {
              li=notli.parentElement;
              if (li.tagName == 'LI' || li.id == 'preview_content' ) {
                  break;
              }
              else {
                  notli=li;
              }
          }
          if ( li.id != 'comments-in-tz' ) {
              if ( li.id == 'preview_content' || li.classList.contains('myPost') ) {
                  //citeTime=returnFormattedDateString(new Date(li.getElementsByClassName('meta')[0].getElementsByTagName('time')[0].getAttributeNode('datetime').value)).split(" ")[1];
                  //citeTime=returnFormattedDateString(new Date(li.getElementsByClassName('meta')[0].getElementsByTagName('time')[0].getAttributeNode('datetime').value)).split(" ")[1];
                  citeTime=returnFormattedDateString(new Date(li.getAttributeNode('data-comment-timestamp').value * 1000)).split(" ")[1];
                  cite="I";
              }
              else if ( li.classList.contains('com-block') ) {
                  //citeTime=returnFormattedDateString(new Date(li.getElementsByClassName('meta')[0].getElementsByTagName('time')[0].getAttributeNode('datetime').value)).split(" ")[1];
                  citeTime=returnFormattedDateString(new Date(li.getAttributeNode('data-comment-timestamp').value * 1000)).split(" ")[1];
                  cite=li.getElementsByClassName('meta')[0].getElementsByTagName('strong')[0].innerHTML.replace(/<script(?:.|\s)*\/script>/m, "");
              }
          }
      }
      if ( tag == "cite" ) {
     //     console.log("A cite you say?");
          pre = "<cite>" + cite + " said";
          if ( citeTime.length > 0 ) {
              pre += " @" + citeTime;
          }
          pre += ": </cite><blockquote><P>";
          post = "</P></blockquote>";
      }
      else {
          pre="<" + tag + ">";
          post="</" + tag + ">";
      }
      var sel = window.getSelection();
    //  console.log("raw selection = " + sel.toString());
      for (var i = 0, len = sel.rangeCount; i < len; ++i) {
        tmpdiv.appendChild(sel.getRangeAt(i).cloneContents());
      }
      reptext = reptext.concat(tmpdiv.innerHTML).replace(/<!--[^>]*>/,"").replace(/<\/?div[^>]*>/,"").replace(/<span class="new-text">[^>]*>/,"").replace(/<\/?span[^>]*>/,"");
      reptext = pre + reptext + post;
     // console.log("selection text == " + reptext);
    }
    else {
        reptext="<" + tag + ">" + ta.value.substring(startPos, endPos) + "</" + tag + ">";
    }
    replaceWhereWithWhat(ta,startPos,endPos,reptext);
    //ta.value=ta.value.substring(0,startPos) + reptext + ta.value.substring(endPos,ta.value.length);
    var cc=ta.parentElement.getElementsByClassName('characterCount')[0]; 
    updateNumCharsInElement(ta.value,cc,maxCommentLength);
}

function replaceWhereWithWhat(ta,startPos,endPos,reptext) {
    ta.value=ta.value.substring(0,startPos) + reptext + ta.value.substring(endPos,ta.value.length);
}

function doAnchorDialog(ta) {
    ta=document.getElementsByTagName('textarea')[0];

    var startPos = ta.selectionStart;
    var endPos = ta.selectionEnd;
    
    mydiv=document.createElement('div');
    mydiv.setAttribute('role','dialog');
    mydiv.setAttribute('class','anchor-floater');
    mydiv.setAttribute('tabindex',0);
    mydiv.setAttribute('style','left: 480px; top: 324px;');
    mydiv.id='anchor-dialog';

    var mybut=document.createElement('button');
    mybut.id='anchor-closer';
    mybut.setAttribute('title', 'close it')
    mybut.onclick=function() { document.getElementById('anchor-dialog').remove(); return false; };
    mybut.innerHTML='X';
    mydiv.appendChild(mybut);

    var anchorName=document.createElement('input');
    anchorName.id='anchorName';
    anchorName.value=ta.value.substring(startPos, endPos);
    var anchorNameLab=document.createElement('label');
    anchorNameLab.innerHTML='Display Text';
    mydiv.appendChild(anchorNameLab);
    mydiv.appendChild(anchorName);

    var anchorUrl=document.createElement('input');
    anchorUrl.id='anchorUrl';
    anchorUrl.tabIndex=0;
    var tmpval=ta.value.substring(startPos, endPos);
    if ( tmpval.length > 0 && tmpval.substring(0,4) != "http" ) {
        tmpval="http://" + tmpval;
    }
    anchorUrl.value=tmpval;
    var anchorUrlLab = document.createElement('label');
    anchorUrlLab.innerHTML='Url';
    mydiv.appendChild(anchorUrlLab);
    mydiv.appendChild(anchorUrl);

    var mysubbut=document.createElement('button');
    mysubbut.id='anchor-submit';
    mysubbut.onclick=function() { 
        var tmpval2=anchorUrl.value;
        if ( tmpval2.length > 0 && tmpval2.substring(0,4) != "http" ) {
            tmpval2="http://" + tmpval2;
        }
        reptext='<a href="' + tmpval2 + '">' + anchorName.value + '</a>';
        replaceWhereWithWhat(ta,startPos,endPos,reptext);
        document.getElementById('anchor-dialog').remove(); 
        var cc=ta.parentElement.getElementsByClassName('characterCount')[0];
        updateNumCharsInElement(ta.value,cc,maxCommentLength);
        return false; 
    };
    mysubbut.innerHTML='submit';
    mydiv.appendChild(mysubbut);

    ta.parentElement.appendChild(mydiv);
    anchorName.focus();
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

function timeToSeconds(input) {
    var hrs= (input.match(/[0-9]h/i) ) ? parseInt(input.match(/([0-9]*)h/i)[1]) : 0;
    var mins= (input.match(/[0-9]m/i) ) ? parseInt(input.match(/([0-9]*)m/i)[1]) : 0;
    var secs= (input.match(/[0-9]s/i) ) ? parseInt(input.match(/([0-9]*)s/i)[1]) : 0;
    return hrs * 3600 + mins * 60 + secs;
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
        //also fine for now
        storyTime.innerHTML=returnFormattedDateString(new Date(storyTime.getAttributeNode('datetime').value));
        // storyTime.innerHTML=returnFormattedDateString2(storyTime.getAttributeNode('datetime').value, storyTime.innerHTML);
    }
    
    for(var i=0; i<comments.length; ++i) {
       // var myReplyNum=parseInt(comments[i].classList[1].replace("reply",""));
        var myReplyNum=parseInt(comments[i].className.match(/reply[0-9]/)[0].replace("reply",""));
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
        //tx=new Date(t.getAttributeNode('datetime').value);
        tx=new Date(comments[i].getAttributeNode('data-comment-timestamp').value * 1000)
        var datestring = returnFormattedDateString(tx);
        if ( localStorage[localTzTag] == 'true' ) {
            t.innerHTML=datestring;
        }
        meta.appendChild(commentId);
        
      //  if ( comments[i].classList.toString().match(/parent-comment_[0-9]*/) ) {
        if ( comments[i].className.match(/parent-comment_[0-9]*/) ) {
            var gotoComment = comments[i].className.match(/parent-comment_[0-9]*/)[0].split("-")[1];
            var parentBut = document.createElement('button');
            parentBut.id = 'jumpFrom' + comments[i].id;
            parentBut.className = 'parentButton';
            parentBut.innerHTML = '&uarr;';
            parentBut.title = 'goto parent (' + gotoComment.split('_')[1] + ')';
            parentBut.onclick=function(ele) { 
               var gotoComment = ele.target.parentElement.parentElement.className.match(/parent-comment_[0-9]*/)[0].split("-")[1];
               setTimeout(document.getElementById(gotoComment).scrollIntoView(true),2000);
            };
            meta.appendChild(parentBut);
        }
        
        meta.appendChild(newText);
        var youtube=localStorage[inlineYoutubeTag];
        var myBody = comments[i].querySelector('div.content');
        var myBodyLinks = myBody.getElementsByTagName('a');
        for (j=0; j < myBodyLinks.length; j++ ) {
            var myBodyLink = myBodyLinks[j].href;
            var tmpSrc="";
            if ( document.URL.split(":")[0] == 'https' ) {
                myBodyLink=myBodyLink.replace("http://","https://");
            }
            if ( myBodyLink.search("liveleak.com") > -1 ||  myBodyLink.search("vimeo.com") > -1 ) {
                var newFrame = document.createElement('iframe');
                if ( myBodyLink.search("vimeo.com") > -1 ) {
                    tmpSrc = myBodyLink.replace("/vimeo","/player.vimeo");
                    if ( tmpSrc.search("vimeo.com/m/") > -1 ) {
                        tmpSrc = tmpSrc.replace("vimeo.com/m","vimeo.com");
                    }
                    if ( tmpSrc.search("vimeo.com/video") == -1 ) {
                        tmpSrc = tmpSrc.replace("vimeo.com/","vimeo.com/video/");
                    }
                    newFrame.className="vimeo-player";
                    newFrame.title="Vimeo video player";
                }
                if ( myBodyLink.search("liveleak.com") > -1 ) {
                    tmpSrc = myBodyLink.replace("/view","/ll_embed");
                    tmpSrc = tmpSrc.replace("\?i","\?f");
                    newFrame.className="liveleak-player";
                    newFrame.title="Liveleak video player";
                }
                newFrame.src = tmpSrc;
                newFrame.frameBorder = 0;
                newFrame.width=640;
                newFrame.height=360;
                myBody.appendChild(newFrame);
            myBodyLinks[j].title=tmpSrc;
            }
            if ( ( myBodyLink.search("youtube.com") > -1 || myBodyLink.search("youtu.be") > -1 )) { // && ( myBodyLink.search("channel") == -1 )
                var newFrame = document.createElement('iframe');
                var movId;
                if ( myBodyLink.search("youtube.com") > -1 && myBodyLink.search("youtube.com/user") == -1 && myBodyLink.search("youtube.com/channel") == -1 ) {
                    var tmpSrc=myBodyLink.replace("#t","&start");
                    var args=tmpSrc.split("?")[1].split("&");
                    tmpSrc=tmpSrc.split("?")[0].replace("watch","").replace("m.youtube.com","www.youtube.com");
                    var otargs=[];
                    for ( yti=0; yti < args.length; yti++ ) {
                        if ( args[yti].search("v=") === 0 ) {
                          //  tmpSrc += "?" + args[yti];
                            movId=args[yti].split("=")[1];
                        }
                       // else if ( args[yti].startsWith("html5=") ) {
                       //     ;
                       // }
                        else if ( args[yti].startsWith("t=") ) {
                            var newtime = (args[yti].split("=")[1].match(/h|m|s/) ) ? timeToSeconds(args[yti].split("=")[1]) : args[yti].split("=")[1];
                            otargs.push("start=" + newtime);
                          //  otargs.push(args[yti].replace("t=","start="));
                        }
                        else if ( args[yti].startsWith("start=") || args[yti].startsWith("end=") ) {
                            var newtime = (args[yti].split("=")[1].match(/h|m|s/) ) ? timeToSeconds(args[yti].split("=")[1]) : args[yti].split("=")[1];
                            otargs.push(args[yti].split("=")[0] + "=" + newtime);
                        }
                        else {
                            //otargs.push(args[yti]);
                        }
                    }
                    otargs.push("rel=0");
                    otargs.push("autoplay=0");
                 /*   if ( otargs.length > 0 ) {
                        tmpSrc += "&" + otargs.join("&");
                    }*/
                  //  movId = myBodyLink.split("/")[3].split("=")[1];
                    tmpSrc=tmpSrc + "embed/" + movId + "?" + otargs.join("&");
                   // tmpSrc=tmpSrc.replace("watch?v=", "embed/");
                   // tmpSrc=tmpSrc.replace("&t=", "?t=");
                   // tmpSrc=tmpSrc.replace("&", "?");
                    newFrame.src=tmpSrc;
                }
                else {
                    movId = myBodyLink.split("/")[3];
                    newFrame.src=myBodyLink.replace("youtu.be/", "www.youtube.com/embed/").replace("?t","?start");
                    if ( newFrame.src.match(/start=[0-9hms]/) ) {
                        var newtime=timeToSeconds(newFrame.src.match(/start=([0-9hms]*)/)[1]);
                        newFrame.src=newFrame.src.replace(/start=[0-9hms]*/, "start=" + newtime);
                    }
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
                newFrame.frameborder=0;
                newFrame.allowFullscreen=true;
                newFrame.style.enabled = ( youtube == "true" ) ? '' : 'none';
                myBody.appendChild(newFrame);
            myBodyLinks[j].title=tmpSrc;
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
    var cs=document.getElementById('comments-scroller');
    // commentIgnoreList='reason-comment-ignore-list' ; userIgnoreList = 'reason-ignore-list';
    userIgnoreListText = localStorage[userIgnoreList];
    userIgnoreEmailText = userIgnoreListText.split("|").filter(function (s) { return s.indexOf("@") !== -1 ;}).join("|");
    userIgnoreEmailRegex = new RegExp(userIgnoreEmailText, "i");
    userIgnoreLinkText = userIgnoreListText.split("|").filter(function (s) { return s.indexOf("htt") == 0 ;}).join("|");
    userIgnoreLinkRegex = new RegExp(userIgnoreLinkText, "i");
    userIgnoreNameRegex = new RegExp(userIgnoreListText, "i");
    commentIgnoreListText = localStorage[commentIgnoreList];
    commentIgnoreListRegex = new RegExp(commentIgnoreListText, "i");
    masterListRegex = new RegExp(userIgnoreListText.concat("|" + commentIgnoreListText ), "i");
    if ( userIgnoreListText.length > 0 || commentIgnoreListText.length > 0 ) {
        for(var i=0; i<comments.length; i++) {
            var userBlock = comments[i].getElementsByClassName('meta')[0].childNodes[0];
            var userLink="";
            if ( userBlock.getElementsByTagName("a").length > 0 ) {
                userName = userBlock.getElementsByTagName("a")[0].innerHTML;
                userLink = userBlock.getElementsByTagName("a")[0].href;
            }
            else {
                userName = userBlock.innerHTML;
            }
            //if ( filter == "true" && userIgnoreListText.length > 0 && comments[i].getElementsByClassName('comment-reply-link')[0].innerHTML == unhidden && comments[i].getElementsByClassName('meta')[0].innerHTML.toLowerCase().search(userIgnoreListText) > -1 )  {
            if ( filter == "true" && comments[i].getElementsByClassName('comment-reply-link')[0].innerHTML == unhidden && 
                    ( ( userIgnoreListText.length > 0 && userName.search(userIgnoreNameRegex) > -1 )  || 
                     ( userIgnoreEmailText.length > 0 && userLink.search(userIgnoreEmailRegex) > -1 ) || 
                      ( userIgnoreLinkText.length > 0 && userLink.search(userIgnoreLinkRegex) > -1 )  ) )  {
                var whichList = userIgnoreNameRegex;
                var matchType = "user";
                var match = "unknown";
                if (  userIgnoreEmailText.length > 0 && userLink.search(userIgnoreEmailRegex) > -1 ) {
                    whichList = userIgnoreEmailRegex;
                    matchType = "user email";
                //    console.log("cnt = " + userIgnoreEmailText.length + " match = " +  userLink.search(userIgnoreEmailRegex) + " userLink = " + userLink);
                    match = userLink.match(whichList);
                }
                else if ( userIgnoreLinkText.length > 0 && userLink.search(userIgnoreLinkRegex) > -1 ) {
                    whichList = userIgnoreLinkRegex;
                    matchType = "user link";
                    match = userLink.match(whichList);
                }
                else {
                    match = userName.match(whichList);
                }
               // var match = comments[i].getElementsByClassName('meta')[0].innerHTML.match(whichList);
                var badMatch=comments[i].getElementsByClassName('bad-match')[0];
                badMatch.style.display='';
                        badMatch.innerHTML = (badMatch.length > 0) ? badMatch.innerHTML + match + " ": "Hide reasons (" + matchType +  "): " + match + " ";
                comments[i].classList.add('hide-me');
                comments[i].getElementsByClassName('comment-reply-link')[0].click();
            }
            else if ( filter == "true" && commentIgnoreListText.length > 0 && comments[i].getElementsByClassName('comment-reply-link')[0].innerHTML == unhidden 
                    && comments[i].getElementsByClassName('content')[0].innerHTML.search(commentIgnoreListRegex) > -1 )  {
                var match = comments[i].getElementsByClassName('content')[0].innerHTML.match(commentIgnoreListRegex);
                var badMatch=comments[i].getElementsByClassName('bad-match')[0];
                badMatch.style.display='';
                badMatch.innerHTML = (badMatch.length > 0) ? badMatch.innerHTML + match + " ": "Hide reasons (content): " + match + " ";
                comments[i].classList.add('hide-me');
                comments[i].getElementsByClassName('comment-reply-link')[0].click();
            }
            // unhide comments that no longer match
            else if (comments[i].getElementsByClassName('comment-reply-link')[0].textContent == hidden ) {
                if ( ( comments[i].getElementsByClassName('bad-match')[0].innerHTML.split("):")[0].search("user email") > -1 &&
                            comments[i].getElementsByClassName('bad-match')[0].innerHTML.split("):")[1].search(userIgnoreEmailRegex) == -1 ) ||
                         ( comments[i].getElementsByClassName('bad-match')[0].innerHTML.split("):")[0].search("user link") > -1 &&
                            comments[i].getElementsByClassName('bad-match')[0].innerHTML.split("):")[1].search(userIgnoreLinkRegex) == -1 ) ||
                         ( comments[i].getElementsByClassName('bad-match')[0].innerHTML.split("):")[0].search("content") > -1 &&
                            comments[i].getElementsByClassName('bad-match')[0].innerHTML.split("):")[1].search(commentIgnoreListRegex) == -1 ) ) {
                    var badMatch=comments[i].getElementsByClassName('bad-match')[0];
                    badMatch.style.display='none';
                    badMatch.innerHTML = '';
                    comments[i].getElementsByClassName('comment-reply-link')[0].click();
                }
            }


            if ( comments[i].getElementsByClassName('bad-match')[0].style.display == '' || comments[i].style.display != '' ) {
                if ( ele=document.getElementById('ncl-' + comments[i].id) ) {
                    ele.getElementsByClassName('comments-date')[0].classList.add('bad-match');
                    ele.getElementsByClassName('comments-date')[0].title += "Hidden from view";
                }
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
            var imgWidth = imgCap.parentNode.style["width"].replace("px","");
            imgAlt=postImgs[i].getElementsByTagName('img')[0].alt;
            imgTitle=postImgs[i].getElementsByTagName('img')[0].title;
            if ( postImgs[i].getElementsByTagName('img')[0].alt.search("|||") > -1 ) {
                cmpImgAlt=postImgs[i].getElementsByTagName('img')[0].alt.split(" |||")[0];
                othImgAlt=postImgs[i].getElementsByTagName('img')[0].alt.split(" ||| ")[1];
            }
            else {
                cmpImgAlt=imgAlt;
            }
            if ( postImgs[i].getElementsByTagName('img')[0].title.search("|||") > -1 ) {
                cmpImgTitle=postImgs[i].getElementsByTagName('img')[0].title.split(" |||")[0];
                othImgTitle=postImgs[i].getElementsByTagName('img')[0].title.split(" ||| ")[1];
            }
            else {
                cmpImgTitle=imgTitle;
            }
            if (imgAlt.length > 0 && cmpImgAlt.toLowerCase() != imgCap.innerHTML.toLowerCase() ) {
                if (imgTitle.length > 0 && imgTitle.toLowerCase() != imgCap.innerHTML.toLowerCase() && cmpImgTitle.toLowerCase() != cmpImgAlt.toLowerCase()) {
                    imgCap.innerHTML = imgAlt + ((imgCap.innerHTML.length > 0 ) ? (" -- " + imgCap.innerHTML) : "");
                    imgCap.innerHTML = imgTitle + ((imgCap.innerHTML.length > 0 ) ? (" - " + imgCap.innerHTML) : "");
                }
                else {
                    if ( imgCap.innerHTML == othImgAlt ) {
                        imgCap.innerHTML = imgAlt;
                    }
                    else {
                        imgCap.innerHTML = imgAlt + ((imgCap.innerHTML.length > 0 ) ? (" = " + imgCap.innerHTML) : "");
                    }
                }
            }
            
            else if (imgTitle.length > 0 && imgTitle.toLowerCase() != imgCap.innerHTML.toLowerCase() && imgTitle.toLowerCase() != imgAlt.toLowerCase()) {
                imgCap.innerHTML = imgTitle + ((imgCap.innerHTML.length > 0 ) ? (" == " + imgCap.innerHTML) : "");
            }
            var tab=document.createElement("table");
            var row=document.createElement("row");
            var td=document.createElement("td");
            td.innerHTML=imgCap.innerHTML;
            td.width=imgWidth;
            row.appendChild(td);
            tab.appendChild(row);
            imgCap.parentNode.appendChild(tab);
            imgCap.style.display="none";
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

function unthreadTest() {
    var comments = document.getElementById('comments').querySelectorAll('.com-block');
    var reorderlist = _(comments).pluck('id').sort();
    console.log("trying to unravel threads");
    for ( var i=0; i<comments.length; i++ ) {
        var thisComm = document.getElementById(reorderlist[i]);
        thisComm.className=toggleIndent(thisComm.classList).join(" ");
        if ( ! thisComm.classList.contains("reply0") ) {
            thisComm.classList.add("reply0");
        }
        thisComm.parentNode.appendChild(thisComm);
    }
}

function toggleIndent(array) {
    var newArray = [];
    for ( var j=0; j < array.length; j++ ) {
        element=array[j];
        if ( element.startsWith("reply") ) {
            newArray.push("no" + element);
        }
        else if (element.startsWith("noreply") ) {
            newArray.push(element.replace("no",""));
        }
        else {
            newArray.push(element);
        }
    }
    return newArray;
}

function makeCharacterThingy() {
        // myCharTablePage=0; function refreshCharTablePage() { var myTab=document.getElementById("CharacterInputTable"); var cells=myTab.getElementsByTagName('td'); for ( var i=0; i<cells.length;i++) {var r=cells[i].id.split("row-")[1].split("-")[0]; var c=cells[i].id.split("-column-")[1]; var myCharTabNumCols=16; var myCharTabNumRows=8; cells[i].innerHTML="&#" + (32+c+r*myCharTabNumCols+myCharTablePage*myCharTabNumCols*myCharTabNumRows) + ";";}}
        // myCharTablePage=0; var myCharTabNumRows=8; var myCharTabNumCols=16;
        var myDiv=document.createElement('div');
        if ( localStorage[keyboardShowTag] == "false" ) {
            myDiv.style.display="none";
        }
        myDiv.id="CharacterInputDiv";
        myDiv.className="keyboardFloater";
        var myTabDiv=document.createElement('div');
        myTabDiv.id="CharacterInputTableDiv";
        var myTab=document.createElement('table');
        myTab.id="CharacterInputTable";
        myTabDiv.appendChild(myTab);
        myDiv.appendChild(myTabDiv);
        document.body.appendChild(myDiv);

        var titleRow=document.createElement("tr");
        var titleHead=document.createElement("th");
        titleRow.appendChild(titleHead);
        myTab.appendChild(titleRow);

        var first = document.createElement('span');
        first.textContent = '|<< ';
        first.setAttribute('title', 'Go to beginning');
        first.className = 'firstChar';
        first.addEventListener('click', function(){
            myCharTablePage = 0;
            refreshCharTablePage();
        }, false);

        var prev = document.createElement('span');
        prev.textContent = '<<';
        prev.className = 'prevChar';
        prev.setAttribute('title', 'Go to prev page');
        prev.addEventListener('click', function(){
            myCharTablePage = (myCharTablePage == 0 ) ? 0 : myCharTablePage - 1;
            console.log("my index = " + myCharTablePage);
            refreshCharTablePage();
        }, false);

        var next = document.createElement('span');
        next.textContent = '>>';
        next.className = 'nextChar';
        next.setAttribute('title', 'Go to next page');
        next.addEventListener('click', function(){
            myCharTablePage = myCharTablePage + 1;
            console.log("my index = " + myCharTablePage);
            refreshCharTablePage();
        }, false);

        var hide = document.createElement('span');
        hide.textContent = '<Toggle Keyboard>';
        hide.className = 'toggleKeyboard';
        hide.addEventListener('click', function(){
            myTable = document.getElementById('CharacterInputTable');
            myTable.style.display = ( myTable.style.display == "none") ? "" : "none";
        }, false);
        titleHead.appendChild(first);
        titleHead.appendChild(prev);
        titleHead.appendChild(next);
        myTabDiv.parentNode.appendChild(hide);

        
        titleHead.colSpan=myCharTabNumCols;
        for ( var r=0; r < myCharTabNumRows; r++) {
            var myRow=document.createElement('tr');
            myTab.appendChild(myRow);
            for ( var c=0; c < myCharTabNumCols; c++ ) {
                var myCell=document.createElement('td');
                myRow.appendChild(myCell);
                myCell.id="CharTab-row-" + r + "-column-" + c;
                myCell.className="column-" + c;
                myCell.width=12;
                myCell.height=12;
                var cellBut=document.createElement('button');
                cellBut.id="charCell-" + (myCharTabNumCols*r+c);
                cellBut.onclick = function(but) { 
                    var cellId=parseInt(this.id.split("charCell-")[1]);
                    var form=document.getElementsByClassName('leave-comment')[0].getElementsByTagName('form')[0];
                    //var form=but.target.parentElement.parentElement.parentElement;
                    form.getElementsByTagName('textarea')[0].value += "&#" + (cellId+32+myCharTablePage*myCharTabNumCols*myCharTabNumRows) + ";"; 
                    return false; 
                };
               // cellBut.innerHTML="&lt;cite>";
                cellBut.innerHTML="&#" + (32+c+r*myCharTabNumCols+myCharTablePage*myCharTabNumCols*myCharTabNumRows) + ";";
                myCell.appendChild(cellBut);
            }
        }
        //mything=document.getElementsByTagName('textarea')[0]; mything.parentNode.appendChild(myDiv)
}

function refreshCharTablePage() {
    var myTab=document.getElementById("CharacterInputTable");
    var cells=myTab.getElementsByTagName('td');
    for ( var i=0; i<cells.length;i++) {
        var r=parseInt(cells[i].id.split("row-")[1].split("-")[0]);
        var c=parseInt(cells[i].id.split("-column-")[1]);
        var charNum=((32)+(c)+(r*myCharTabNumCols)+(myCharTablePage*myCharTabNumCols*myCharTabNumRows));
//        console.log("r=" + r + " c=" + c + " charNum = " + charNum);
        cells[i].getElementsByTagName('button')[0].innerHTML="&#" + charNum + ";";
    }
}

// Run iff we're on a page which looks like a post
if(((location.pathname.substring(0, 3) == '/ar') || (location.pathname.substring(0, 8) == '/blog/20') || (location.pathname.substring(0, 10) == '/reasontv/') || (location.pathname.substring(0,10) == '/brickbat/')) && ! inIframe() ) {
    if ( ! inIframe() ) {
        console.log("says NOT in iframe");
    }
    else{
        console.log("says in iframe");
    }
    
    
    console.log("time to make the donuts");
    makeCharacterThingy();
    formatPostImageText();
    makeHighlight();
    makeOptionsForm();
    makeShowHide();
    makeNewText();
    createFormattingDiv();
    hideBastards();

    for(var m=0;m<3;m++ ) {
        setTimeout(getMyName,5000);
    }
    
    if ( localStorage[noThreadingTag] == "true" ) {
        unthreadTest();        
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
        //this is fine for some reason
        storyTime=storyTimes[e].getElementsByTagName('time')[0];
        if ( typeof(storyTime) != 'undefined' && localStorage[localTzTag] == 'true' ) {
            storyTime.innerHTML=returnFormattedDateString(new Date(storyTime.getAttributeNode('datetime').value));
            // storyTime.innerHTML=returnFormattedDateString2(storyTime.getAttributeNode('datetime').value, storyTime.innerHTML);
        }
    }
}
else {
    console.log("Did I end up in an iframe?");
}    
