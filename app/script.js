"use strict";

var time = {
    firstTimeDraw: true,
    AMPMToggled: false,
    setTime: function() {
        this.hours = new Date().getHours();
        this.minutes = new Date().getMinutes();
        this.seconds = new Date().getSeconds();

        this.setTimeOfDay(); //Morning, etc.
        setAMPM.call(this);
        addMissingZero.call(this, this.hours);
        addMissingZero.call(this, this.minutes);

        if (this.firstTimeDraw) {
            fadeOut("main-time-draw");
            fadeOut("main-greeting");
            $("#main-time-draw").html(
                "<p>" + time.hours + ":" + time.minutes + "<p>"
            );
            user.drawGreeting();
            fadeIn("main-time-draw", 1500);
            fadeIn("main-greeting", 1800);
            this.firstTimeDraw = false;
        } else {
            $("#main-time-draw").html(
                "<p>" + time.hours + ":" + time.minutes + "<p>"
            );
        }

        // Update background image every day
        this.date = new Date().getDate();
        if (this.date != localStorage.getItem("imageDate")) {
            backgroundImage.updateImage = true;
            localStorage.setItem("imageDate", this.date);
        } else {
            backgroundImage.updateImage = false;
        }
        // Update quote every hour
        if (this.hours != localStorage.getItem("quoteHour")) {
            quote.updateQuote = true;
            localStorage.setItem("quoteHour", this.hours);
        } else {
            quote.updateQuote = false;
        }
        
        function fadeOut(name) {
            $("#" + name).fadeOut(0);
        }
        function fadeIn(name, timeToOpaque) {
            $("#" + name).fadeIn(timeToOpaque);
        }
        function setAMPM() {
            if (this.hours >= 12) {
                this.hours -= 12;
                this.AMPM = "PM";
            } else {
                this.AMPM = "AM";
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
            time.setTime();
            time.updateTime();
        }, (60 - this.seconds) * 1000 + 1) //+1 to secure catching the updated time
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
    name: localStorage.getItem("username"),
    drawGreeting: function() {
        if (user.name == null) {
            user.name = "User"
            $("#main-username").html(`
                <form id="main-username-form">
                    <input type="text" name="username" id="main-username-input" placeholder="Enter Username">
                </form>`
            );
        } else {
            $("#main-username").html("");
        }
        let greetings = {
            phrasesArray: [],
            phrases: {
                standard: {
                    phrase: "Good " + time.timeOfDay + ", " + user.name + "!",
                    chance: 70
                }, variation1: {
                    phrase: "Welcome back, " + user.name + "!",
                    chance: 15
                }, variation2: {
                    phrase: "Good to see you this " + time.timeOfDay + "!",
                    chance: 10
                }, variation3: {
                    phrase: "How's it going " + user.name + "?",
                    chance: 5
                }
            }
        }
        $("#main-greeting").html(returnRandomPhrase);

        function returnRandomPhrase() {
            //Bulding a array out of the phrases keys and picking a random one
            for (let i in greetings.phrases) {
                for (let c = 0; c < greetings.phrases[i].chance; c++) {
                    greetings.phrasesArray.push(i);
                }
            }
            let index = greetings.phrasesArray[
                Math.round(Math.random() * (greetings.phrasesArray.length - 1))
            ];
            return greetings.phrases[index].phrase
        }
    },
    getName: function() {
        $("form").submit(function(e) {
            e.preventDefault();
            $.ajax({
                type: "POST",
                data: $("#main-username-input").val(),
                context: $("#main-greeting"),
                success: function () {
                    localStorage.clear();
                    if (!localStorage.getItem("username")) {
                        localStorage.setItem("username", $("#main-username-input").val());
                        user.name = localStorage.getItem("username");
                    };
                    user.drawGreeting();
                }
            });
        });
    }
}

var backgroundImage = {
    url : "https://cors-anywhere.herokuapp.com/" + "https://api.unsplash.com//photos/random?client_id=3e66d58c720b2e9697e94445cb461e9032b946068102f18f4f3203783b412e70&collections=140375&orientation=landscape",
    setImage: function(json) {
        if (json === null) {
            $("body").css("background-image", "url(" + localStorage.getItem("imageUrl") + ")");
            $("#bottom-settings-location").text( localStorage.getItem("imageLocation") );
            $("#bottom-settings-owner").text( localStorage.getItem("imageUser") );
        } else {
            $("body").css("background-image", "url(" + json.urls.full + ")");
            $("#bottom-settings-location").text(json.user.location);
            $("#bottom-settings-owner").text(json.user.name);
        }
    },
    getImage: function(){
        $.getJSON(this.url,function(json){
            localStorage.setItem("imageUrl", json.urls.full);
            localStorage.setItem("imageLocation", json.user.location);
            localStorage.setItem("imageUser", json.user.name);
            backgroundImage.setImage(json);
        });
    },
    setupImage: function() {
        if (this.updateImage) {
            this.getImage();
        } else {
            this.setImage(null);
        }
    }
}

let quote = {
    url: "https://cors-anywhere.herokuapp.com/" + "https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json",
    author: "", quote: "",
    setQuote: function(json) {
        if (json === null) {
            $("#bottom-quote-draw").html(`
                <p id="bottom-quote-draw-quote">${localStorage.getItem("quote")}</p>
                <span id="bottom-quote-draw-author">${"- " + localStorage.getItem("quoteAuthor")}</span>`
            );
            $("#bottom-quote-draw").css("bottom", "70px");
        } else {
            if (json.quoteAuthor.length === 0) {
                this.author = "Unknown";
            } else {
                this.author = json.quoteAuthor;
            }
            $("#bottom-quote-draw").html(`
                <p id="bottom-quote-draw-quote">${json.quoteText}</p>
                <span id="bottom-quote-draw-author">${"- " + this.author}</span>`
            );
            $("#bottom-quote-draw").css("bottom", "70px");
        }
    },
    getQuote: function() {
        (function requestQuote() {
            $.getJSON(this.url, function(json){
                if (json.quoteText > 140) { // Limiting the length of the quote
                    quote.getQuote();
                } else {
                    localStorage.setItem("quote", json.quoteText);
                    if (json.quoteAuthor.length === 0) {
                        localStorage.setItem("quoteAuthor", "Unknown");
                    } else {
                        localStorage.setItem("quoteAuthor", json.quoteAuthor);
                    }
                    quote.setQuote(json);
                }
            }).fail(function requestQuoteFailed() {
                quote.getQuote();
            });
        }).call(this);
    },
    setupQuote() {
        if (quote.updateQuote) {
            this.getQuote();
        } else {
            this.setQuote(null);
        }
    }
}

$("document").ready(function() {
    time.setTime();
    time.updateTime();
    backgroundImage.setupImage();
    user.getName();
    quote.setupQuote();

    document.getElementById("main-time-draw").addEventListener("dblclick", function toogleTwelveHourDisplay() {
        if (time.AMPMToggled) { //Clear
            $(".main-time-twelvehours").html("");
            time.AMPMToggled = false;
        } else { //Draw
            $(".main-time-twelvehours").html(
                "<p>" + time.AMPM + "</p>"
            );
            time.AMPMToggled = true;
        }
    });
});
