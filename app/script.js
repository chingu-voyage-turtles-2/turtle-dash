"use strict";

/* globals chrome returnRandomPhrase fadeIn */

const time = {
    firstTimeDraw: true,
    AMPMToggled  : true,
    setTime() {
        this.hours = new Date().getHours();
        this.minutes = new Date().getMinutes();
        this.date = new Date().getDate();

        ( function setTimeOfDay() {
            switch ( this.hours ) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                    this.timeOfDay = "Morning";
                    break;
                case 11:
                case 12:
                case 13:
                    this.timeOfDay = "Noon";
                    break;
                case 14:
                case 15:
                case 16:
                case 17:
                    this.timeOfDay = "Afternoon";
                    break;
                case 18:
                case 19:
                case 20:
                case 21:
                case 22:
                    this.timeOfDay = "Evening";
                    break;
                case 23:
                case 24:
                case 1:
                case 2:
                case 3:
                    this.timeOfDay = "Night";
                    break;
                default:
                    this.timeOfDay = "Day";
            }
        } ).call( this );

        ( function setAMPM() {
            if ( this.hours >= 12 ) {
                this.hours -= 12;
                this.AMPM = "PM";
            } else {
                this.AMPM = "AM";
            }
        } ).call( this );
        $( ".mid-main-time-twelvehours" ).html(
            `<p>${time.AMPM}</p>`
        );
        ( function setAMPMListener() {
            document.getElementById( "mid-main-time-draw" ).addEventListener( "dblclick",
                function toogleTwelveHourDisplay() {
                    if ( time.AMPMToggled ) {
                        $( ".mid-main-time-twelvehours" ).html( "" );
                        time.AMPMToggled = false;
                    } else {
                        $( ".mid-main-time-twelvehours" ).html(
                            `<p>${time.AMPM}</p>`
                        );
                        time.AMPMToggled = true;
                    }
                }
            );
        } )();

        addMissingZero.call( this, this.hours );
        addMissingZero.call( this, this.minutes );
        function addMissingZero( unit ) {
            if ( String( unit ).length === 1 ) {
                switch ( unit ) {
                    case this.hours: // Assigning unit doesn't work
                        this.hours = `0${unit}`;
                        break;
                    case this.minutes:
                        this.minutes = `0${unit}`;
                }
            }
        }

        if ( this.firstTimeDraw ) {
            $( "#mid-main-time-draw" ).html(
                `<p>${time.hours}:${time.minutes}<p>`
            );
            user.drawGreeting();
            focus.drawFocus();
            this.firstTimeDraw = false;
        } else {
            $( "#mid-main-time-draw" ).html(
                `<p>${time.hours}:${time.minutes}<p>`
            );
        }

        // Update background image every day
        if ( this.date != localStorage.getItem( "imageDate" ) ) {
            backgroundImage.updateImage = true;
            localStorage.setItem( "imageDate", this.date );
        } else {
            backgroundImage.updateImage = false;
        }
        // Update quote every hour
        if ( this.hours != localStorage.getItem( "quoteHour" ) ) {
            quote.updateQuote = true;
            localStorage.setItem( "quoteHour", this.hours );
        } else {
            quote.updateQuote = false;
        }
    },
    updateTime() {
        setTimeout( function updateTimeTimeout() {
            time.setTime();
            time.updateTime();
        }, ( ( 60 - new Date().getSeconds() ) * 1000 ) + 1 );
    },
},
user = {
    name: localStorage.getItem( "username" ),
    drawGreeting() {
        if ( this.name === null ) {
            this.name = "User";
            $( "#mid-main-username" ).html( `
                <form id="mid-main-username-form">
                    <input type="text" name="username" id="mid-main-username-input" placeholder="Enter Username">
                </form>`
            );
        } else {
            $( "#mid-main-username" ).html( "" );
        }

        const greetings = {
            phrasesArray: [],
            phrases     : {
                standard: {
                    phrase: `Good ${time.timeOfDay}, <span id='editname' contenteditable>${user.name}</span>!`,
                    chance: 70,
                },
                variation1: {
                    phrase: `Welcome back, <span id='editname' contenteditable>${user.name}</span>!`,
                    chance: 15,
                },
                variation2: {
                    phrase: `Good to see you this ${time.timeOfDay}!`,
                    chance: 10,
                },
                variation3: {
                    phrase: `How's it going <span id='editname' contenteditable>${user.name}</span>?`,
                    chance: 5,
                },
            },
        };
        $( "#mid-main-greeting" ).html( returnRandomPhrase( greetings.phrases, greetings.phrasesArray ) );

        ( function getName() {
            $( "#mid-main-username-form" ).on( "submit", ( e ) => {
                e.preventDefault();
                localStorage.removeItem( "username" );
                if ( !localStorage.getItem( "username" ) ) {
                    localStorage.setItem( "username", $( "#mid-main-username-input" ).val() );
                    user.name = localStorage.getItem( "username" );
                }
                user.drawGreeting();
                focus.drawFocus();
            } );
        } )();
        ( function editName() {
            $( "#editname" ).keypress( ( e ) => {
                if ( e.which === 13 ) {
                    e.preventDefault();
                    localStorage.removeItem( "username" );
                    if ( !localStorage.getItem( "username" ) ) {
                        localStorage.setItem( "username", $( "#editname" ).text() );
                        user.name = localStorage.getItem( "username" );
                    }
                    user.drawGreeting();
                }
            } );
        } )();
    },
},
backgroundImage = {
    setupImage() {
        if ( this.updateImage ) { // Was set during the time setup
            this.getImage();
        } else {
            this.setImage( null );
        }
    },
    url: "https://cors-anywhere.herokuapp.com/https://api.unsplash.com//photos/random?client_id=3e66d58c720b2e9697e94445cb461e9032b946068102f18f4f3203783b412e70&collections=1128206&orientation=landscape",
    getImage() {
        $.getJSON( this.url, function getData( json ) {
            if ( json.location === undefined ) {
                localStorage.setItem( "imageLocation", "Unknown" );
            } else {
                localStorage.setItem( "imageLocation", `${json.location.name}, ${json.location.country}` );
            }
            localStorage.setItem( "imageUrl", json.urls.full );
            localStorage.setItem( "imageUser", json.user.name );

            backgroundImage.setImage( json );
        } )
        .always( ( error, status ) => {
            if ( status != "success" ) {
                switch ( error.status ) {
                    case 403 :
                        alert( "You have exceded the limit for loading new background pictures." );
                        break;
                    case 500 :
                        alert( "The picture server is momentraily not available, please retry refreshing the background image later." );
                        break;
                    default:
                        backgroundImage.getImage();
                }
            }
        } );
    },
    setImage( json = null ) {
        if ( json === null ) {
            setImageCssLocationOwner(
                localStorage.getItem( "imageUrl" ),
                localStorage.getItem( "imageLocation" ),
                localStorage.getItem( "imageUser" )
            );
        } else if ( json.location === undefined ) {
            setImageCssLocationOwner(
                json.urls.full,
                "Unknown",
                json.user.name
            );
        } else {
            setImageCssLocationOwner(
                json.urls.full,
                `${json.location.name}, ${json.location.country}`,
                json.user.name
            );
        }
        function setImageCssLocationOwner( url, location, owner ) {
            $( "body" ).css( "background-image", `url(${url})` );
            $( "#left-settings-location" ).text( location );
            $( "#left-settings-owner" ).text( `By: ${owner}` );
        }
    },
},
quote = {
    setupQuote() {
        if ( this.updateQuote ) { // Was set during the time setup
            this.getQuote();
        } else {
            this.setQuote( null );
        }
    },
    url: "https://cors-anywhere.herokuapp.com/https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json",
    getQuote() {
        ( function requestQuote() {
            $.getJSON( quote.url, ( json ) => {
                if ( json.quoteText > 120 ) {
                    quote.getQuote();
                } else {
                    localStorage.setItem( "quote", json.quoteText );
                    if ( json.quoteAuthor.length === 0 ) {
                        localStorage.setItem( "quoteAuthor", "Unknown" );
                    } else {
                        localStorage.setItem( "quoteAuthor", json.quoteAuthor );
                    }
                    quote.setQuote( json );
                }
            } )
            .fail( function requestQuoteFailed() {
                quote.getQuote();
            } );
        } ).call( this );
    },
    setQuote( json ) {
        if ( json === null ) {
            drawQuote(
                localStorage.getItem( "quote" ),
                localStorage.getItem( "quoteAuthor" )
            );
        } else if ( json.quoteAuthor.length === 0 ) {
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
        function drawQuote( quote, author ) {
            $( "#mid-quote-draw" ).html( `
                <p id="mid-quote-draw-quote">&#8220;${quote}&#8221;</p>
                <span id="mid-quote-draw-author">- ${author}</span>` );
            $( "#mid-quote-draw" ).css( "bottom", "20px" );
        }
    },
},
focus = {
    task: localStorage.getItem( "mid-main-focus" ),
    drawFocus() {
        let focusChecked;
        if ( localStorage.getItem( "focusChecked" ) === "true" ) {
            focusChecked = true;
        } else {
            focusChecked = false;
        }

        if ( localStorage.getItem( "username" ) !== null ) {
            if ( focus.task === null || focus.task === "" ) {
                $( "#mid-main-focus" ).html( `
                    <form id="mid-main-focus-form">
                        <label>What is your main focus today?</label>
                        <input type="text" name="focus" id="mid-main-focus-value" 
                            placeholder="Type focus here">
                    </form>`
                );
            } else if ( focusChecked ) {
                    drawHtml( `<s>${focus.task}</s>`, "plus" );
            } else {
                drawHtml( focus.task );
            }

            if ( focusChecked ) {
                $( "#mid-main-focus-check" ).css( "background-color", "rgba(255,255,255,0.3)" );
            } else {
                $( "#mid-main-focus-check" ).css( "background-color", "none" );
            }
        }
        function drawHtml( task, plusOrDelete = "delete" ) {
            $( "#mid-main-focus" ).html( `
                <div id="mid-main-focus-wrapper">
                    <img id="mid-main-focus-check" src="img/focus-check.png" class="focus-icons"/>
                    <span id="editfocus" contenteditable>${task}</span>
                    <img id="mid-main-focus-deleteplus" src="img/focus-${plusOrDelete}.png" class="focus-icons"/>
                </div>`
            );
        }

        $( "#mid-main-focus-check" ).click( () => {
            if ( localStorage.getItem( "focusChecked" ) === "true" ) {
                localStorage.setItem( "focusChecked", "false" );
                focus.drawFocus();
            } else {
                localStorage.setItem( "focusChecked", "true" );
                focus.drawFocus();
            }
        } );

        $( "#mid-main-focus-deleteplus" ).click( () => {
            localStorage.removeItem( "mid-main-focus" );
            localStorage.setItem( "focusChecked", "false" );
            focus.task = "";
            fadeIn( "mid-main-focus", 500 );
            focus.drawFocus();
        } );

        $( "#mid-main-focus-form" ).on( "submit", ( e ) => {
            e.preventDefault();
            resetFocus( $( "#mid-main-focus-value" ).val() );
        } );

        $( "#editfocus" ).keypress( ( e ) => {
            if ( e.which === 13 ) {
                resetFocus( $( "#editfocus" ).text() );
            }
        } );
        function resetFocus( value ) {
            localStorage.removeItem( "mid-main-focus" );
            if ( !localStorage.getItem( "mid-main-focus" ) ) {
                localStorage.setItem( "mid-main-focus", value );
                focus.task = localStorage.getItem( "mid-main-focus" );
            }
            focus.drawFocus();
        }
    },
},
todo = {
    dropupActive: false,
    dropupListener() {
        ( function setupTodoStorage() {
            chrome.storage.local.get( "todos", ( items ) => {
                if ( items.todos === undefined ) {
                    chrome.storage.local.set( { todos: [], checked: [] } );
                }
            } );
        } )();

        document.getElementById( "right-todo-icon" ).addEventListener( "click",
            function triggerDropup() {
                if ( !todo.dropupActive ) {
                    chrome.storage.local.get( ( storage ) => {
                        todo.drawDropup( storage );
                    } );
                } else {
                    $( "#right-todo-dropup" ).removeClass( "unhideTodoDropup" );
                    $( "#right-todo-dropup" ).addClass( "hideTodoDropup" );
                    $( "#right-todo-arrow" ).css( "display", "none" );
                    $( "#right-todo-dropup" ).html( "" );
                    todo.dropupActive = false;
                }
            }
        );
    },
    drawDropup( storage ) {
        let lineBreakCounter = 0,
            noTodoMessage = false;
        const todos = storage.todos,
            dropupId = "right-todo-dropup",
            windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;

        $( `#${dropupId}` ).html( `<div id='${dropupId}-todo'></div>` );
        $( `#${dropupId}` ).removeClass( "hideTodoDropup" );
        $( `#${dropupId}` ).addClass( "unhideTodoDropup" );
        $( "#right-todo-arrow" ).css( "display", "block" );

        if ( todos.length === 0 ) {
            noTodoMessage = true;
        } else {
            for ( let i = 0; i < todos.length; i++ ) {
                if ( storage.checked[i] ) {
                    writeTodo( todos[i], i, storage );
                } else {
                    writeTodo( todos[i], i );
                }
                addTodoListener( i );
                addCheckboxListener( i );
                $( `#todo-wrapper-${i}` ).hover( function onHover() {
                    $( `#${dropupId}-todo-${i}-delete` ).css( "opacity", "1" );
                }, function offHover() {
                    $( `#${dropupId}-todo-${i}-delete` ).css( "opacity", "0" );
                } );
            }
        }
        function writeTodo( content, i, ...rest ) {
            let checked = "",
                contentFinal;

            // 25 is the number of big letters ("D") that fit one row at most
            if ( content.length > 25 ) {
                lineBreakCounter += Math.floor( content.length / 25 );
            }

            if ( rest.length > 0 ) {
                if ( rest[0].checked[i] ) {
                    checked = "checked";
                    contentFinal = `<s>${content}</s>`;
                }
            } else {
                contentFinal = content;
            }

            $( `#${dropupId}-todo` ).append( `
                <div id="todo-wrapper-${i}" class="todo-wrappers">
                    <input id="${dropupId}-checkbox-${i}" type="checkbox" class="todo-checkboxes" ${checked}>
                    <p id="${dropupId}-todo-${i}" class="todos" contenteditable>
                        ${contentFinal}
                    </p>
                    <img src="img/todo-delete.png" id="${dropupId}-todo-${i}-delete" class="todo-delete">
                </div>`
            );
        }
        function addTodoListener( i ) {
            document.getElementById( `${dropupId}-todo-${i}-delete` ).addEventListener( "click", function onDelete() {
                ( function removeTodo( i ) {
                    chrome.storage.local.get( ( storage ) => {
                        storage.checked.splice( i, 1 );
                        storage.todos.splice( i, 1 );
                        todo.drawDropup( storage );
                        chrome.storage.local.set( storage );
                    } );
                } )( i );
            } );
            $( `#${dropupId}-todo-${i}` ).keypress( ( e ) => {
                if ( e.which === 13 ) {
                    chrome.storage.local.get( ( storage ) => {
                        storage.todos[i] = $( `#${dropupId}-todo-${i}` ).text().trim();
                        todo.drawDropup( storage );
                        chrome.storage.local.set( storage );
                    } );
                }
            } );
        }
        function addCheckboxListener( i ) {
            $( `#${dropupId}-checkbox-${i}[type=checkbox]` ).on( "click", function onClick() {
                if ( $( `#${dropupId}-checkbox-${i}:checked` ).length === 1 ) {
                    chrome.storage.local.get( ( storage ) => {
                        storage.checked[i] = true;
                        chrome.storage.local.set( storage );
                        todo.drawDropup( storage, i );
                    } );
                } else {
                    chrome.storage.local.get( ( storage ) => {
                        storage.checked[i] = false;
                        chrome.storage.local.set( storage );
                        todo.drawDropup( storage, i );
                    } );
                }
            } );
        }

        $( `#${dropupId}` ).append( `
            <form id="${dropupId}-form">
                <input type="text" name="todo" id="${dropupId}-input" placeholder="Enter Todo">
            </form>`
        );

        if ( ( todos.length * 22 ) + ( lineBreakCounter * 19.1 ) > ( windowHeight * 0.7 ) - 42 ) {
            $( `#${dropupId}` ).css( "height", `${( windowHeight * 0.7 ) - 42}px` ); // Scrollbar
            $( `#${dropupId}-todo` ).css( "overflow-y", "scroll" );
            $( `#${dropupId}-todo` ).css( "overflow-x", "hidden" );
        } else { // Dynamic Height
            $( `#${dropupId}` ).css( "height", `${50 + ( todos.length * 22 ) + ( lineBreakCounter * 19.1 )}px` );
            $( `#${dropupId}-todo` ).css( "overflow", "hidden" );
            $( `#${dropupId}-todo` ).css( "height", "inherit" );
        }

        if ( noTodoMessage ) { // If drawn directly if would be overwritten
            $( `#${dropupId}-todo` ).append( `
                <div id="${dropupId}-todo-notodo">
                    <img src="img/wave.png" class="emoji"/>
                    <img src="img/smile.png" class="emoji"/>
                    <p>Hey there ${user.name}!<br>
                        You can add new todos below:</p>
                </div>`
            );
            $( `#${dropupId}` ).css( "height", "170px" );
        }
        todo.dropupActive = true;

        ( function addTodoInputListener() {
            $( `#${dropupId}-form` ).submit( function submit( e ) {
                e.preventDefault();
                chrome.storage.local.get( function getStorage( storage ) {
                    storage.todos.push( $( `#${dropupId}-input` ).val() );
                    storage.checked.push( false );
                    todo.drawDropup( storage );
                    chrome.storage.local.set( storage );
                } );
            } );
        } )();
    },
},
search = {
    setupSearch() {
        const searchBox = document.getElementById( "mid-search-box" );
        document.getElementById( "mid-search-icon" ).addEventListener( "click", () => {
            if ( searchBox.style.display === "block" ) {
                searchBox.style.display = "none";
            } else {
                searchBox.style.display = "block";
            }
        } );
        searchBox.addEventListener( "keydown", () => {
            if ( event.which === 13 ) {
                chrome.tabs.update( null, { url: `http://www.google.com/search?q=${searchBox.value}` } );
            }
        } );
    },
},
settings = {
    dropupActive: false,
    dropupListener() {
        chrome.storage.local.get( ( storage ) => {
            for ( const i in storage.parts ) {
                if ( !storage.settingsChecked[i] ) {
                    $( `#${storage.parts[i]}` ).toggleClass( "hideView" );
                }
            }
            if ( !storage.settings ) {
                chrome.storage.local.set( {
                    settings       : [ "Display Search", "Display Weather", "Display Focus", "Display Quote", "Display Todo List" ],
                    parts          : [ "mid-search", "right-weather", "mid-main-focus", "mid-quote", "right-todo" ],
                    settingsChecked: [ "checked", "checked", "checked", "checked", "checked", "checked" ],
                } );
            }
            document.getElementById( "left-settings-icon" ).addEventListener( "click",
                function triggerDropup() {
                    if ( !settings.dropupActive ) {
                        chrome.storage.local.get( ( storage ) => {
                            setTabOpacities( "toogle" );
                            settings.drawFeatures( storage );
                        } );
                    } else {
                        $( "#left-settings-dropup" ).removeClass( "unhideSettingsDropup" );
                        $( "#left-settings-dropup" ).addClass( "hideSettingsDropup" );
                        $( "#left-settings-arrow" ).css( "display", "none" );
                        $( `#left-settings-tabs` ).css( "display", "none" );
                        $( "#main-settings-view" ).html( "" );
                        settings.dropupActive = false;
                    }
                }
            );
            document.getElementById( "left-settings-tabs-toogle" ).addEventListener( "click",
                function triggerDropup() {
                    $( "#main-settings-view" ).html( "" );
                    setTabOpacities( "toogle" );
                    chrome.storage.local.get( ( storage ) => {
                        settings.drawFeatures( storage );
                    } );
                }
            );
            document.getElementById( "left-settings-tabs-creators" ).addEventListener( "click",
                function triggerDropup() {
                    $( "#main-settings-view" ).html( "" );
                    setTabOpacities( "creators" );
                    ( function drawCreators() {
                        const names = [ "Dahra", "Dansteve", "Jneidel (Project Manager)", "Timh1203" ],
                            githubs = [ "https://github.com/DaraAsaolu", "https://github.com/Dansteve", "https://github.com/jneidel", "https://github.com/timh1203" ];
                        $( "#main-settings-view" ).html( `
                            <div id="left-settings-creators" class="left-settings-tab-divs">
                                <p class="settings-tabs-header">Brought to you by</p>
                            </div>`
                        );
                        for ( const i in names ) {
                            $( "#left-settings-creators" ).append( `
                                <div class="settings-creators-pair">
                                    <a href="${githubs[i]}" target="_blank"><img class="settings-creators-github" src="img/settings/github.png"></a>
                                    <span class="settings-creators-names">@${names[i]}</span>
                                </div>`
                            );
                        }
                        $( "#left-settings-creators" ).append( `
                            <div id="settings-attributions">
                                <p>Icons by <a href="https://www.flaticon.com/">Flaticon</a>. 
                                    Weather by <a href="https://darksky.net/">Darksky</a>. 
                                    Quotes by <a href="http://forismatic.com/en/">Forismatic</a>. 
                                    Background Images by <a href="https://unsplash.com/">Unsplash</a>.</p>
                            </div>`
                        );
                    } )();
                }
            );
            document.getElementById( "left-settings-tabs-refresh" ).addEventListener( "click",
                function triggerDropup() {
                    $( "#main-settings-view" ).html( "" );
                    setTabOpacities( "refresh" );
                    ( function drawRefresh() {
                        const content = [
                            [ "Refresh background image", "Refresh", "img" ],
                            [ "Refresh quote", "Refresh", "quote" ],
                            [ "Reset todos", "Reset", "todo" ],
                        ];
                        $( "#main-settings-view" ).html( `
                            <div id="left-settings-refresh" class="left-settings-tab-divs">
                                <p class="settings-tabs-header">Refresh</p>
                            </div>`
                        );
                        for ( const i of content ) {
                            $( "#left-settings-refresh" ).append( `
                                <div class="settings-refresh-wrapper">
                                    <span class="settings-refresh-text">
                                        ${i[0]}</span>
                                    <span id="settings-refresh-button-${i[2]}" class="settings-refresh-button">${i[1]}</span>
                                </div>`
                            );
                        }
                        document.getElementById( "settings-refresh-button-img" ).addEventListener( "click", () => {
                            backgroundImage.getImage();
                        } );
                        document.getElementById( "settings-refresh-button-quote" ).addEventListener( "click", () => {
                            quote.getQuote();
                        } );
                        document.getElementById( "settings-refresh-button-todo" ).addEventListener( "click", () => {
                            chrome.storage.local.get( ( storage ) => {
                                chrome.storage.local.set( { todos: [], checked: [] } );
                                if ( todo.dropupActive ) {
                                    todo.drawDropup( storage );
                                }
                            } );
                            if ( todo.dropupActive ) {
                                // Instant call won't update the screen if todo active
                                setTimeout( () => {
                                    chrome.storage.local.get( ( storage ) => {
                                        todo.drawDropup( storage );
                                    } );
                                }, 1000 );
                            }
                        } );
                    } )();
                }
            );
            function setTabOpacities( tab ) {
                const others = [];
                switch ( tab ) {
                    case "toogle" :
                        others.push( "creators", "refresh" );
                        break;
                    case "creators" :
                        others.push( "toogle", "refresh" );
                        break;
                    case "refresh" :
                        others.push( "creators", "toogle" );
                }

                $( `#left-settings-tabs-${tab}` ).css( "opacity", "1" );
                $( `#left-settings-tabs-${others[0]}` ).css( "opacity", "0.6" );
                $( `#left-settings-tabs-${others[1]}` ).css( "opacity", "0.6" );
            }
        } );
    },
    drawFeatures( storage ) {
        const dropupId = "left-settings-dropup",
            setttings = storage.settings;
        $( "#main-settings-view" ).html( `
            <p id="setting-header">
                Toggle Features</p>`
        );
        for ( const i in setttings ) {
            $( "#main-settings-view" ).append( `
                <div>
                    <div class="features">
                        ${setttings[i]}
                    </div>
                    <div class="switch">
                        <input id="settings-toggle-${i}" class="settings-toggle settings-toggle-round" type="checkbox" ${storage.settingsChecked[i]}>
                        <label for="settings-toggle-${i}"></label>
                    </div>
                </div>`
            );
            ( function addToggleboxListener( i ) {
                $( `#settings-toggle-${i}[type=checkbox]` ).on( "click", () => {
                    if ( storage.settingsChecked[i] ) {
                        chrome.storage.local.get( ( storage ) => {
                            storage.settingsChecked[i] = false;
                            chrome.storage.local.set( storage );
                            settings.drawFeatures( storage );
                        } );
                    } else {
                        chrome.storage.local.get( ( storage ) => {
                            storage.settingsChecked[i] = "checked";
                            chrome.storage.local.set( storage );
                            settings.drawFeatures( storage );
                        } );
                    }
                    $( `#${storage.parts[i]}` ).toggleClass( "hideView" );
                } );
            } )( i );
        }
        $( `#${dropupId}` ).removeClass( "hideSettingsDropup" );
        $( `#${dropupId}` ).addClass( "unhideSettingsDropup" );
        $( "#left-settings-arrow" ).css( "display", "block" );
        $( `#left-settings-tabs` ).css( "display", "block" );
        settings.dropupActive = true;
    },
    setImageLocationHover() {
        $( "#left-settings-info" ).hover(
            function hideOtherDivs() {
                hide( "mid" );
                hide( "right" );
                hide( "left-logo" );
                hide( "right-todo" );
                hide( "mid-quote" );

                function hide( id ) {
                    $( `#${id}` ).addClass( "hideDivs" );
                    $( `#${id}` ).removeClass( "unhideDivs" );
                    if ( id === "mid-quote" ) {
                        $( `#${id}` ).css( "transition-delay", "3.5s" );
                        $( `#${id}` ).css( "transition-duration", "0.75s" );
                        $( `#${id}` ).css( "transition-property", "all" );
                        $( `#${id}` ).css( "transition-timing-function", "linear" );
                    }
                }
            },
            function unhideOtherDivs() {
                unhide( "mid" );
                unhide( "right" );
                unhide( "left-logo" );
                unhide( "right-todo" );
                unhide( "mid-quote" );

                function unhide( id ) {
                    $( `#${id}` ).addClass( "unhideDivs" );
                    $( `#${id}` ).removeClass( "hideDivs" );
                    if ( id === "mid-quote" ) {
                        $( `#${id}` ).css( "visibility", "visible" );
                        $( `#${id}` ).css( "transition-delay", "0.25s" );
                        $( `#${id}` ).css( "transition-duration", "0.75s" );
                        $( `#${id}` ).css( "transition-property", "all" );
                        $( `#${id}` ).css( "transition-timing-function", "linear" );
                    }
                }
            } );
    },
},
weather = {
    toggle_fahrenheit: false,
    getWeatherData() {
        if ( !( localStorage.getItem( "weather" ) === null ) ) {
            writeWeather( localStorage.getItem( "weather" ), localStorage.getItem( "weatherIcon" ), localStorage.getItem( "weatherLocation" ) );
        }
        if ( navigator.geolocation ) {
            navigator.geolocation.getCurrentPosition( ( position ) => {
                const url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/fdb696c0c21ab91c3e5ea397229e3e80/${position.coords.latitude},${position.coords.longitude}`;
                $.getJSON( url, ( json ) => {
                    drawWeather();
                    function drawWeather( ...rest ) {
                        let temp;
                        if ( weather.toggle_fahrenheit ) { // °F
                            temp = `${Math.round( json.currently.temperature )}&#8457`;
                        } else { // °C
                            temp = `${Math.round( ( json.currently.temperature - 32 ) / ( 9 / 5 ) )}&#8451`;
                        }

                        if ( rest.length !== 0 ) { // Only update temperature
                            $( "#right-weather-temperature" ).html( `${temp}` );
                        } else if ( json.currently.icon || ~[ "clear-day", "clear-night", "cloudy", "partly-cloudy-day", "partly-cloudy-night", "rain", "snow", "weather windy" ].indexOf() ) {
                            setStorage( temp, json.currently.icon, json.timezone );
                            writeWeather( temp, json.currently.icon, json.timezone );
                        } else {
                            setStorage( temp, "cloudy", json.timezone );
                            writeWeather( temp, "cloudy", json.timezone );
                        }
                        function setStorage( weather, icon, location ) {
                            localStorage.setItem( "weather", weather );
                            localStorage.setItem( "weatherIcon", icon );
                            localStorage.setItem( "weatherLocation", location );
                        }
                    }

                    document.getElementById( "right-weather-temperature" ).addEventListener( "dblclick", () => {
                        weather.toggle_fahrenheit = !weather.toggle_fahrenheit;
                        drawWeather( true );
                    } );
                } );
            } );
        }
        function writeWeather( weather, icon, location ) {
            $( "#right-weather" ).html( `
                <div id="weather-wrapper">
                    <p id="right-weather-temperature">${weather}</p>
                    <img id="right-weather-icon" src="img/weather/weather ${icon}.png">
                </div>
                <p id="right-weather-location">${location}</p>`
            );
        }
    },
};

$( "document" ).ready( () => {
    time.setTime();
    time.updateTime();
    backgroundImage.setupImage();
    quote.setupQuote();
    todo.dropupListener();
    settings.dropupListener();
    settings.setImageLocationHover();
    search.setupSearch();
    weather.getWeatherData();
    initalFadeIn();
} );


function initalFadeIn() {
    for ( const id of [
        "right",
        "left",
        "mid-main-greeting",
        "mid-main-username",
        "mid-main-focus",
        "mid-search",
    ] ) {
        fadeIn( id );
    }
    fadeIn( "mid-main-time-draw", 1500 );
}
