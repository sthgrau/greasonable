// ==UserScript==
// @name         Full Reason
// @namespace    http://github.com/sthgrau/greasonable
// @version      0.7.1
// @description  does something useful
// @author       Me
// @match        http://reason.com/*
// @grant        none
// ==/UserScript==

// run to reset:
// localStorage.removeItem('visited-' + location.pathname);


// Global variables are fun!
var lastGivenDate, commentCountText, commentsList, divDiv, dateInput, commentsScroller;

var maxDatesPerPost=6;
var myIndex=0; // keep track of what the current date viewed is. List is sorted in reverse to latest is first (ie element 0)
var pathString = 'visited-' + location.pathname; //made this global because it is now used when manually entering a date
var ignoreList = 'reason-ignore-list';
var ytLoaded=0;
var unhidden="Hide thread";
var hidden="Unhide thread";
if ( typeof(localStorage[ignoreList]) == 'undefined' ) {
  localStorage[ignoreList] = "buttplug|shrike|gambol|tony";
}

//damn autoplay ads
ht=document.body.getElementsByTagName('iframe')
for (i=0;i<ht.length;i++) {
    ht[i].style.display='none';
}


// *** Sets up borders and populates comments list

function border(since, updateTitle) {
  lastGivenDate = since;
  var commentList = document.getElementById('comments').querySelectorAll('.com-block');
  var mostRecent = since;
  var newComments = [];
  
  // Walk comments, setting borders as appropriate and saving new comments in a list
  for(var i = 0; i < commentList.length; i++) {
    var postTime = Date.parse(commentList[i].querySelector('time').getAttribute('datetime'));
    if (postTime > since) {
      commentList[i].classList.add('new-comment');
      newComments.push({time: postTime, ele: commentList[i]});
      if (postTime > mostRecent) {
        mostRecent = postTime;
      }
    }
    else {
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
      newLi.innerHTML = '<span class="comments-commenter">' + ele.querySelector('strong').innerHTML  + '</span>' + ' <span class="comments-date">' + returnFormattedDateString(new Date(newComments[i].time)) + '</span>';
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

function makeHighlight() {
  // *** Inject some css used by the floating list

  var styleEle = document.createElement('style');
  styleEle.type = 'text/css';
  styleEle.textContent = 'li.new-comment { border: 1px solid #f37221; }' +
  '.new-text { color: #C5C5C5; display: none; }' +
  '.new-comment .new-text { display: inline; }' +
  '.comments-floater { position: fixed; right: 4px; top: 4px; padding: 2px 5px; width: 250px;font-size: 14px; border-radius: 5px; background: rgba(250, 250, 250, 0.90); }' +
  '.show-filter-floater { position: fixed; right: 4px; bottom: 0px; margin-bottom:0px; padding: 2px 5px; }' +
  '.filter-floater { position: fixed; right: 4px; bottom: 0px; margin-bottom:0px; padding: 2px 5px; height: 250px; width: 250px;font-size: 14px; border-radius: 5px; background: rgba(250, 250, 250, 0.90); }' +
  '.filters { width: 250px; height: 220px; }' +
  '.comments-scroller { word-wrap: break-word; max-height: 500px; max-height: 80vh; overflow-y:scroll; }' +
  '.comments-date { font-size: 11px; }' +
  'a.comment-reply-link { font-size: 13px; }' +
  '.semantic-cell { display: table-cell; }' +
  '.cct-span { white-space: nowrap; }' +
  '.date-input { width: 100%; box-sizing: border-box; }' +
  '.input-span { width: 100%; padding-left: 5px; }' +
  '.hider { position: absolute; left: -22px; top: 6px;}' +
  '.next { position: absolute; left: -44px; top: 6px;}' +
  '.prev { position: absolute; left: -66px; top: 6px;}' +
  '';
  document.head.appendChild(styleEle);

  var showFilterBox = document.createElement('div');
  showFilterBox.className = 'show-filter-floater';
  var filterBox = document.createElement('div');
  filterBox.className = 'filter-floater';
  filterBox.style.display='none';

  text=document.createElement('textarea');
  text.className='filters';
  filterBox.appendChild(text);
  var filtHider = document.createElement('span');
  filtHider.textContent = '[filters]';
  filtHider.className = 'filtHider';
  filtHider.addEventListener('click', function(){
      text.value=localStorage[ignoreList].split('|').join("\n");
      filterBox.style.display = '';
      subHider.style.display='';
      filtHider.style.display='none';
  }, false);
  var subHider = document.createElement('span');
  subHider.textContent = '[submit]';
  subHider.className = 'subHider';
  subHider.style.display='none';
  subHider.addEventListener('click', function(){
      localStorage[ignoreList] = text.value.split("\n").join("|");
      filterBox.style.display = 'none';
      subHider.style.display='none';
      filtHider.style.display='';
  }, false);
  filterBox.appendChild(subHider);
  showFilterBox.appendChild(filterBox);
  showFilterBox.appendChild(filtHider);

  document.body.appendChild(showFilterBox);



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
      dateInput.value = returnFormattedDateString(new Date(lastGivenDate));
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
  dateInput.value = returnFormattedDateString(new Date(lastVisit));
  var mostRecent = border(lastVisit, false);
  lastVisits.push(mostRecent);
  if ( ( lastVisits.length == 1 ) || ( mostRecent != lastVisits[0] ) ) {
    localStorage[pathString] = lastVisits.sort(function(a,b){return b-a}).slice(0,maxDatesPerPost).join(); //save last maxDatesPerPost dates
  }
}



function makeShowHide() {
  // *** Add buttons to show/hide threads

  var comments = document.getElementById('comments').querySelectorAll('.com-block');

  var lastReplyNum=0;
  var parentStack=[];
  for(var i=0; i<comments.length; ++i) {
    myReplyId=comments[i].id;
    myReplyNum=parseInt(comments[i].classList[1].replace("reply",""));
    parentStack[myReplyNum]=myReplyId;
    for (k=myReplyNum-1; k>= 0; k--) {
      comments[i].classList.add("parent-" + parentStack[k]);
    }
  }
  for(var i=0; i<comments.length; ++i) {
    var hideLink = document.createElement('a');
    hideLink.className = 'comment-reply-link';
    hideLink.style.textDecoration = 'underline';
    hideLink.textContent = unhidden;

    hideLink.addEventListener('click', commentToggle, false);

    var divs = comments[i].children;
    var replyEle = divs[divs.length-1];

    replyEle.appendChild(hideLink);
//    }
  }
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

function makeNewText() {
  // *** Add ~new~ to new comments
    
  var comments = document.getElementById('comments').querySelectorAll('.com-block');
  //fake out last-child css
  var li = document.createElement('li');
  var hrs=new Date().getTimezoneOffset()/60*-1;
  li.innerHTML="Times shown in GMT" + ( hrs < 0 ? hrs : "+" + hrs);
  document.getElementById('comments').getElementsByTagName('ul')[0].appendChild(li);
   
  console.log("start formatting story time")
  
  var storyTime=document.getElementsByClassName('mainheading')[0].getElementsByTagName('time')[0];
  if ( typeof(storyTime) != 'undefined' ) {
    storyTime.innerHTML=returnFormattedDateString(new Date(storyTime.getAttributeNode('datetime').value));
  }
  
  for(var i=0; i<comments.length; ++i) {
    var newText = document.createElement('span');
    newText.className = 'new-text';
    newText.textContent = '~new~';

    var meta = comments[i].querySelector('p.meta');
    t=meta.getElementsByTagName('time')[0];
    tx=new Date(t.getAttributeNode('datetime').value);
    var datestring = returnFormattedDateString(tx);
    t.innerHTML=datestring;
    meta.appendChild(newText);
    var myBody = comments[i].querySelector('div.content');
    var myBodyLinks = myBody.getElementsByTagName('a');
    for (j=0; j < myBodyLinks.length; j++ ) {

      var myBodyLink = myBodyLinks[j].href;
      if ( myBodyLink.search("youtube") > -1 ) {
      var movId = myBodyLink.split("/")[3].split("=")[1];
      var newFrame = document.createElement('iframe');
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
      newFrame.class="youtube-player";
      newFrame.title="YouTube video player";
      newFrame.src=myBodyLink.replace("watch?v=", "v/");
      newFrame.width=640;
      newFrame.height=360;
      myBody.appendChild(newFrame);
     }
    }
  }
}

var divs = [];
var parent;
function hideBastards() {
  var comments = document.getElementById('comments').querySelectorAll('.com-block');
  ignoreListText = localStorage[ignoreList].toLowerCase();
  if ( ignoreListText.length > 0 ) {
    for(var i=0; i<comments.length; i++) {
      if ( comments[i].getElementsByClassName('comment-reply-link')[0].innerHTML == unhidden && comments[i].innerHTML.toLowerCase().search(ignoreListText) > -1 )  {
        comments[i].getElementsByClassName('comment-reply-link')[0].click();
      }
    }
  }
}

function formatPostImageText() {
    post=document.getElementsByClassName('postcontent')[0];
    postImgs=post.getElementsByClassName('addcaption');
    for(var i=0; i<postImgs.length; i++) {
        imgCap=postImgs[i].getElementsByClassName('caption')[0];
        imgAlt=postImgs[i].getElementsByTagName('img')[0].alt;
        if (imgAlt.length > 0 && imgAlt != imgCap.innerHTML ) {
            imgCap.innerHTML = imgAlt + ((imgCap.innerHTML.length > 0 ) ? (" - " + imgCap.innerHTML) : "");
        }
        imgTitle=postImgs[i].getElementsByTagName('img')[0].title;
        if (imgTitle.length > 0 && imgTitle != imgCap.innerHTML && imgTitle != imgAlt) {
            imgCap.innerHTML = imgTitle + ((imgCap.innerHTML.length > 0 ) ? (" - " + imgCap.innerHTML) : "");
        }
    }
}

// Run iff we're on a page which looks like a post
if((location.pathname.substring(0, 3) == '/ar') || (location.pathname.substring(0, 8) == '/blog/20') ) {
  formatPostImageText();
  makeHighlight();
  makeShowHide();
  makeNewText();
  hideBastards();
}

