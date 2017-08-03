"use strict";

let time = {
    firstCall: true,
    twelveHourFormatToggled: false,
    setTime: function() {
        this.refreshTime();
        fadeInOnOpen.call(this);
        
        function drawTime() {
            $("#main-time-draw").html(
                "<p>" + this.hours + ":" + this.minutes + "<p>"
            );
        }
        function fadeInOnOpen() {
            if (this.firstCall) {
                fadeOut("main-time-draw");
                fadeOut("main-greeting");
                drawTime.call(this);
                user.drawGreeting();
                fadeIn("main-time-draw", 1500);
                fadeIn("main-greeting", 1800);
                this.firstCall = false;
            } else {
                drawTime.call(this);
            }
        }
        function fadeOut(name) {
            $("#" + name).fadeOut(0);
        }
        function fadeIn(name, timeToOpaque) {
            $("#" + name).fadeIn(timeToOpaque);
        }
    },
    refreshTime: function() {
        this.hours = new Date().getHours();
        this.minutes = new Date().getMinutes();
        this.seconds = new Date().getSeconds();

        this.setTimeOfDay();
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
            $(".main-time-twelvehours").html(
                "<p>" + time.twelveHourFormat + "</p>"
            );
            time.twelveHourFormatToggled = true;
        }
    },
    setTimeOfDay: function() {
        switch(this.hours) {
            case(4): case(5): case(6): case(7): case(8): case(9): case(10):
                this.timeOfDay = "Morning"; //4 - 10
                break;
            case(11): case(12): case(13):
                this.timeOfDay = "Noon"; //11 - 13
                break;
            case(14): case(15): case(16): case(17):
                this.timeOfDay = "Afternoon"; //14 - 17
                break;
            case(18): case(19): case(20): case(21): case(22):
                this.timeOfDay = "Evening"; //18 - 22
                break;
            case(23): case(24): case(1): case(2): case(3):
                this.timeOfDay = "Night"; //23 - 3
                break;
            default: //To avoid defaulting to undefined
                this.timeOfDay = "Day";
        }
    }
}

let user = {
    name: "",
    drawGreeting: function() {
        $("#main-greeting").html(
            "<p>Good " + time.timeOfDay + ", " + this.name + "!</p>"
        );
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
