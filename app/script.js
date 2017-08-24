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
            fadeOut("mid-main-time-draw");
            fadeOut("mid-main-greeting");
            $("#mid-main-time-draw").html(
                "<p>" + time.hours + ":" + time.minutes + "<p>"
            );
            user.drawGreeting();
            focus.drawFocus();
            fadeIn("mid-main-time-draw", 1500);
            fadeIn("mid-main-greeting", 1800);
            this.firstTimeDraw = false;
        } else {
            $("#mid-main-time-draw").html(
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
            $("#mid-main-username").html(`
                <form id="mid-main-username-form">
                    <input type="text" name="username" id="mid-main-username-input" placeholder="Enter Username">
                </form>`);
        } else {
            $("#mid-main-username").html("");
        }
        let greetings = {
            phrasesArray: [],
            phrases: {
                standard: {
                    phrase: "Good " + time.timeOfDay + ", <span id='editname' contenteditable>" + user.name + "</span>!",
                    chance: 70
                },
                variation1: {
                    phrase: "Welcome back, <span id='editname' contenteditable>" + user.name + "</span>!",
                    chance: 15
                },
                variation2: {
                    phrase: "Good to see you this " + time.timeOfDay + "!",
                    chance: 10
                },
                variation3: {
                    phrase: "How's it going <span id='editname' contenteditable>" + user.name + "</span>?",
                    chance: 5
                }
            }
        }
        $("#mid-main-greeting").html(returnRandomPhrase);
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
        };
        user.getName();
        user.editName();
    },
    getName: function() {
        $("#mid-main-username-form").on('submit', function(e) {
            e.preventDefault();
            localStorage.removeItem("username");
            if (!localStorage.getItem("username")) {
                localStorage.setItem("username", $("#mid-main-username-input").val());
                user.name = localStorage.getItem("username");
            };
            user.drawGreeting();
            focus.drawFocus();
        });
    },
    editName: function() {
        $("#editname").keypress(function(e) {
            if (e.which === 13) {
                e.preventDefault();
                localStorage.removeItem("username");
                if (!localStorage.getItem("username")) {
                    localStorage.setItem("username", $("#editname").text());
                    user.name = localStorage.getItem("username");
                };
                user.drawGreeting();
            }
        });
    }
}

var backgroundImage = {
    url: "https://cors-anywhere.herokuapp.com/" + "https://api.unsplash.com//photos/random?client_id=3e66d58c720b2e9697e94445cb461e9032b946068102f18f4f3203783b412e70&collections=140375&orientation=landscape",
    setImage: function(json = null) {
        if (json === null) {
            setImageCssLocationOwner(
                localStorage.getItem("imageUrl"),
                localStorage.getItem("imageLocation"),
                localStorage.getItem("imageUser")
            );
        } else {
            if (json.location == undefined) {
                setImageCssLocationOwner(
                    json.urls.full,
                    "Unknown",
                    json.user.name
                );
            } else {
                setImageCssLocationOwner(
                    json.urls.full,
                    json.location.name + ", " + json.location.country,
                    json.user.name
                );
            }
        }
        function setImageCssLocationOwner(url, location, owner) {
            $("body").css("background-image", "url(" + url + ")");
            $("#left-settings-location").text(location);
            $("#left-settings-owner").text("By: " + owner);
        }
    },
    getImage: function() {
        $.getJSON(this.url, function(json) {
            if (json.location == undefined) {
                localStorage.setItem("imageLocation", "Unknown");
            } else {
                localStorage.setItem("imageLocation", json.location.name + ", " + json.location.country);
            }
            localStorage.setItem("imageUrl", json.urls.full);
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
    author: "",
    quote: "",
    setQuote: function(json) {
        if (json === null) {
            drawQuote(
                localStorage.getItem("quote"),
                localStorage.getItem("quoteAuthor")
            );
        } else {
            if (json.quoteAuthor.length === 0) {
                drawQuote(
                    json.quoteText,
                    "Unknown"
                );
            } else {
                drawQuote(
                    json.quoteText,
                    json.quoteAuthor
                );
            }
        }
        function drawQuote(quote, author) {
            $("#mid-quote-draw").html(`
                <p id="mid-quote-draw-quote">${quote}</p>
                <span id="mid-quote-draw-author">${"- " + author}</span>`);
            $("#mid-quote-draw").css("bottom", "20px");
        }
    },
    getQuote: function() {
        (function requestQuote() {
            $.getJSON(this.url, function(json) {
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

let focus = {
    taskChecked: localStorage.getItem("mid-main-focus-check"),
    task: localStorage.getItem("mid-main-focus"),
    drawFocus: function() {
        if (localStorage.getItem("username") !== null) {
            if (focus.task == null || focus.task == '') {
                $("#mid-main-focus").html(`
                <form id="mid-main-focus-form">
                    <label>What is your main focus today?</label>
                    <input type="text" name="focus" id="mid-main-focus-value" placeholder="eg: cooking">
                </form>`);
            } else {
                $("#mid-main-focus").html(`<input type="checkbox" id='my-focus' value=" ` + focus.task + `">
                <label id='focusCheck'></label>
                <span id='editfocus' contenteditable >` + focus.task + `</span><span id='mid-main-focus-delete'><img id="mid-main-focus-icon" src="img/delete-icon.png"/></span>`);
            };
            if (localStorage.getItem("mid-main-focus-check") == 'true') {
                $('#my-focus').prop('checked', true);
            } else {
                $('#my-focus').prop('checked', false);
            };
        };
        $('#focusCheck').click(function(e) {
            focus.taskChecked = !focus.taskChecked;
            localStorage.setItem("mid-main-focus-check", focus.taskChecked);
            focus.drawFocus();
        });

        $('#mid-main-focus-delete').click(function(e) {
            localStorage.removeItem("mid-main-focus");
            localStorage.setItem("mid-main-focus-check", 'false');
            focus.task = '';
            focus.drawFocus();
        });

        $("#mid-main-focus-form").on("submit", function(e) {
            e.preventDefault();
            localStorage.removeItem("mid-main-focus");
            if (!localStorage.getItem("mid-main-focus")) {
                localStorage.setItem("mid-main-focus", $("#mid-main-focus-value").val());
                focus.task = localStorage.getItem("mid-main-focus");
            };
            focus.drawFocus();
        });

        $("#editfocus").keypress(function(e) {
            if (e.which === 13) {
                localStorage.removeItem("mid-main-focus");
                if (!localStorage.getItem("mid-main-focus")) {
                    localStorage.setItem("mid-main-focus", $("#editfocus").text());
                    focus.task = localStorage.getItem("mid-main-focus");
                };
                focus.drawFocus();
            }
        });
    }
}

var todo = {
    dropupActive: false,
    dropupListener: function() {
        document.getElementById("right-todo-icon").addEventListener("click",
        function triggerDropup() {
            if (!todo.dropupActive) {
                chrome.storage.local.get(function(storage) {
                    todo.drawDropup(storage);
                });
            } else {
                $("#right-todo-dropup").removeClass("unhideTodoDropup");
                $("#right-todo-dropup").addClass("hideTodoDropup");
                $("#right-todo-arrow").css("display", "none");

                $("#right-todo-dropup-todo").html("");

                todo.dropupActive = false;
            }
        });
    },
    drawDropup: function(storage) {
        let dropupId = "right-todo-dropup",
            todos = storage.todos;
        $("#right-todo-dropup-todo").html("");
        
        $("#" + dropupId).removeClass("hideTodoDropup");
        $("#" + dropupId).addClass("unhideTodoDropup");
        $("#right-todo-arrow").css("display", "block");
        if (todos.length > 27) {
            // Activate scrollbar
        } else if (todos.length < 7) { // Min height
            $("#" + dropupId).css("height", (40 + 7 * 22) + "px");
        } else { // Dynamic Height
            $("#" + dropupId).css("height", (40 + todos.length * 22) + "px");
        }

        for (let i = 0; i < todos.length; i++) {
            if (storage.checked[i]) {
                writeTodo("<s>" + todos[i] + "</s>", i, storage);
            } else {
                writeTodo(todos[i], i);
            }
            (function addCheckboxListener(i) {
                $("#" + dropupId + "-checkbox-" + i + "[type=checkbox]").on("click", function() {
                    if ($("#" + dropupId + "-checkbox-" + i + ":checked").length === 1) {
                        chrome.storage.local.get(function(storage) {
                            storage.checked[i] = true;
                            chrome.storage.local.set(storage);
                            todo.drawDropup(storage, i);
                        });
                    } else {
                        chrome.storage.local.get(function(storage) {
                            storage.checked[i] = false;
                            chrome.storage.local.set(storage);
                            todo.drawDropup(storage, i);
                        });
                    }
                });
            })(i);
        }
        $("#right-todo-dropup-todo").append(`
            <form id="${dropupId}-todo-form">
                <input type="text" name="todo" id="${dropupId}-todo-input" placeholder="Enter Todo">
            </form>
        `);

        todo.dropupActive = true;
        todo.addTodoListener();

        function writeTodo(content, i) {
            let checked = "";
            if (arguments.length === 3) {
                if (arguments[2].checked[i]) {
                    checked = "checked";
                }
            }
            $("#right-todo-dropup-todo").append(`
                <div class="todo-wrappers">
                    <input id="${dropupId}-checkbox-${i}" type="checkbox" class="todo-checkboxes" ${checked}>
                    <p id="${dropupId}-todo-${i}" class="todos">
                        ${content}
                    </p>
                </div>
            `);
        }
    },
    addTodoListener: function() {
        $("#right-todo-dropup-todo-form").submit(function(e) {
            e.preventDefault();
            chrome.storage.local.get(function(storage) {
                storage.todos.push($("#right-todo-dropup-todo-input").val());
                storage.checked.push(false);
                todo.drawDropup(storage);
                chrome.storage.local.set(storage); 
            });
        });
    }
}
//chrome.storage.local.set({ todos: ["Test Todo 1", "Test Todo 2" , "Test Todo 3"], checked: [false, false, false]}); // Reset storage

var searchBox = document.getElementById("mid-search-box");

document.getElementById("mid-search-icon").addEventListener("click", function() {
    if (searchBox.style.display == "block") {
        searchBox.style.display = "none";
    } else {
        searchBox.style.display = "block";
    }
});

$("document").ready(function() {
    time.setTime();
    time.updateTime();
    backgroundImage.setupImage();
    quote.setupQuote();
    todo.dropupListener();
    weather.getWeatherData();

    document.getElementById("mid-main-time-draw").addEventListener("dblclick",
    function toogleTwelveHourDisplay() {
        if (time.AMPMToggled) { //Clear
            $(".mid-main-time-twelvehours").html("");
            time.AMPMToggled = false;
        } else { //Draw
            $(".mid-main-time-twelvehours").html(
                "<p>" + time.AMPM + "</p>"
            );
            time.AMPMToggled = true;
        }
    });

    $("#left-settings-info").hover(
    function hideOtherDivs() {
        hide("mid");
        hide("right");
        hide("left-logo");
        hide("right-todo");
        hide("mid-quote");

        function hide(id) {
            $("#" + id).addClass("hideDivs");
            $("#" + id).removeClass("unhideDivs");
            if (id === "mid-quote") {
                $("#" + id).css("transition-delay", "3.5s");
                $("#" + id).css("transition-duration", "0.75s");
                $("#" + id).css("transition-property", "all");
                $("#" + id).css("transition-timing-function", "linear");
            }
        }
    }, function unhideOtherDivs() {
        unhide("mid");
        unhide("right");
        unhide("left-logo");
        unhide("right-todo");
        unhide("mid-quote");

        function unhide(id) {
            $("#" + id).addClass("unhideDivs");
            $("#" + id).removeClass("hideDivs");
            if (id === "mid-quote") {
                $("#" + id).css("visibility", "visible");
                $("#" + id).css("transition-delay", "0.25s");
                $("#" + id).css("transition-duration", "0.75s");
                $("#" + id).css("transition-property", "all");
                $("#" + id).css("transition-timing-function", "linear");
            }
        }
    });
});
