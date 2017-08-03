"use strict";

let time = {
    firstCall: true,
    twelveHourFormatToggled: false,
    setTime: function() {
        this.refreshTime();
        fadeInOnOpen.call(this);
        
        function drawTime() {
            $("#main-time-draw").html("<p>" + this.hours + ":" + this.minutes + "<p>");
        }
        function fadeInOnOpen() {
            if (this.firstCall) {
                $("#main-time-draw").fadeOut(0);
                drawTime.call(this);
                $("#main-time-draw").fadeIn(1500);
                this.firstCall = false;
            } else {
                drawTime.call(this);
            }
        }
    },
    refreshTime: function() {
        this.hours = new Date().getHours();
        this.minutes = new Date().getMinutes();
        this.seconds = new Date().getSeconds();

        setTwelveHourFormat.call(this);
        addMissingZero.call(this, this.hours);
        addMissingZero.call(this, this.minutes);

        function setTwelveHourFormat() {
            if (this.hours >= 12) {
                this.hours -= 12;
                this.twelveHourFormat = "PM";
            } else {
                this.twelveHourFormat = "AM";
            }
        }
        function addMissingZero(unit) {
            if (String(unit).length === 1) {
                switch(unit) {
                    case(this.hours): //Assigning unit doesn't work
                        this.hours = "0" + unit;
                        break;
                    case(this.minutes):
                        this.minutes = "0" + unit;
                }
                
            }
        }
    },
    updateTime: function() {
        setTimeout(function updateTimeTimeout() {
            time.setTime()
            time.updateTime();
        }, (60 - this.seconds) * 1000 + 1) //+1 to secure catching the updated time
    },
    toogleTwelveHourDisplay: function() {
        if (time.twelveHourFormatToggled) {
            $(".main-time-twelvehours").html("");
            time.twelveHourFormatToggled = false;
        } else {
            $(".main-time-twelvehours").html("<p>" + time.twelveHourFormat + "</p>");
            time.twelveHourFormatToggled = true;
        }
    }
}

$("document").ready(function() {
    time.setTime();
    time.updateTime();

    addEventListener("dblclick", 
    function toogleTwelveHourDisplay() { // Calling it directly doesn't work,
        time.toogleTwelveHourDisplay();  // seems to need that anonymous function
    });
});