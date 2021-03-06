/* Modified from http://stackoverflow.com/a/26296759 */
function makeDoubleClick(doubleClickCallback, singleClickCallback) {
  var clicks = 0, timeout;
  return function() {
    clicks++;
    if (clicks == 1) {
      timeout = setTimeout(function() { 
        if (clicks == 1) {
          singleClickCallback && singleClickCallback.apply(this, arguments);
        }
        clicks = 0; 
      }, 400);
    } else {
      timeout && clearTimeout(timeout);
      doubleClickCallback && doubleClickCallback.apply(this, arguments);
      clicks = 0;
    }
  };
}

//var TIME = 25, SHORT_PAUSE = 5, LONG_PAUSE = 25, LONG_EACH = 2;
var TIME = 25 * 60, SHORT_PAUSE = 5 * 60, LONG_PAUSE = 25 * 60, LONG_EACH = 4;
var ctime = TIME, time = TIME, paused = false, timer, pomodoros = 0;

function update_timer () {
  var minutes = Math.floor(time / 60), seconds = time % 60;
  document.querySelector("#minutes-tens").src = "img/" + Math.floor(minutes / 10) + ".png";
  document.querySelector("#minutes").src = "img/" + minutes % 10 + ".png";
  document.querySelector("#seconds-tens").src = "img/" + Math.floor(seconds / 10) + ".png";
  document.querySelector("#seconds").src = "img/" + seconds % 10 + ".png";
  var pomodoro = document.querySelector("#pomodoro");
  var filter = "hue-rotate(" + Math.floor(paused ? (time / ctime) * 120 : (1 - time / ctime) * 120) + "deg)";
  pomodoro.style["-webkit-filter"] = filter;
  pomodoro.style["filter"] = filter;
}

function tick () {
  update_timer();
  if (time-- == 0) {
    clearInterval(timer);
    timer = null;
    if (Notification && Notification.permission === "granted") {
      var notification = new Notification("Pixel pomodoro - Time's up", {
        body: paused ? "It's time to go back to work." : "You did a pomodoro. Good job! Now take a short rest."
      });
    }
    if (!paused) {
      pomodoros++;
      paused = true;
      if (pomodoros % LONG_EACH === 0) {
        ctime = LONG_PAUSE;
        time = LONG_PAUSE;
      } else {
        ctime = SHORT_PAUSE;
        time = SHORT_PAUSE;
      }
    } else {
      paused = false;
      ctime = TIME;
      time = TIME;
    }
    update_timer();
  }
}

Notification && Notification.requestPermission();

document.querySelector("#help-button").addEventListener("click", function (event) {
  document.querySelector("#help-text").style.display = "";
  document.querySelector("#help-button").style.display = "none";
});

document.querySelector("#help-text").addEventListener("click", function (event) {
  document.querySelector("#help-button").style.display = "";
  document.querySelector("#help-text").style.display = "none";
});

document.querySelector("#pomodoro").addEventListener("click",
  makeDoubleClick(
    function double_click (event) {
      //On a double click, reset the timer, whether it's running or not
      time = TIME;
      paused = false;
      update_timer();
    },
    function single_click (event) {
      //On a single click, start or stop the timer
      if (timer) {
        clearInterval(timer);
        timer = null;
      } else {
        timer = setInterval(tick, 1000);
      }
    }
));