"use strict";

let time = {
    setTime: function() {
        this.refreshTime();
        $("#main-time").html("<p>" + this.hours + ":" + this.minutes + "<p>");
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
    }
}

$("document").ready(function() {
    time.setTime();
    time.updateTime();
});