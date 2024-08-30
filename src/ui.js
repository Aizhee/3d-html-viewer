//Description: This file contains the javascript code for the main UI of the extension. 
//It handles the settings menu, the iframe, and the communication between the two.

//------------------- Constants/Var -------------------------
var iframe = document.getElementById("hostedContent");
let frame = iframe.contentWindow;
let animation = false;
let zIndexMode = false;
let bothMode = false;
//---------------------- Post Message -----------------------
window.addEventListener('message', function(event) {
    const { action, data } = event.data;
    switch(action) {
        case 'getState':
            getState(data);
            break;
        case 'closeSubMenu':
            closeSubMenu();
            break;
        case 'changeZoom':
            document.getElementById("zoom").value = data;
            break;       
    }
});
//------------------- Event Listeners -----------------------
document.querySelector(".settings").addEventListener("click", function(event) {
    var extrasMenu = document.getElementById("extras-menu-pane");
    event.stopPropagation();
    extrasMenu.hidden = !extrasMenu.hidden;
});

document.addEventListener("click", function(event) {
    var extrasMenu = document.getElementById("extras-menu-pane");
    var settingsButton = document.querySelector(".settings");
    if (!extrasMenu.hidden && 
        !extrasMenu.contains(event.target) && 
        !settingsButton.contains(event.target)) {
        extrasMenu.hidden = true;
    }
});

document.getElementById("extras-menu-pane").addEventListener("click", function(event) {
    event.stopPropagation();
});


document.getElementById("hostedContent").contentWindow.addEventListener("focus", function() {
    closeSubMenu()
});

function closeSubMenu() {
    var extrasMenu = document.getElementById("extras-menu-pane");
    if (extrasMenu.hidden == false) { extrasMenu.hidden = true; }
}

document.getElementById("center").addEventListener("click", function() {
    frame.postMessage({ t: 'callFnct', c: 'recenter' }, '*');
});

document.getElementById("refresh").addEventListener("click", function() {
    animation = false;
    refreshFrame();
});

iframe.addEventListener("load", function() {
    iframe.style.opacity = 0;
});
//------------------- Onload Functions -------------------

let reloadTimeOut = false;
iframe.onload = function() {
    iframe.style.opacity = 0;
    frame.postMessage({ t: 'ijS', c: loadSettings() }, '*');
    frame.postMessage({ t: 'ijS', c: getStateStr() }, '*');
    animation = true;
    frame.postMessage({ t: 'ijS', c: addDOM3D }, '*');
    if (reloadTimeOut === false) {
        reloadTimeOut = true;
        setTimeout(function() {
            frame.postMessage({ t: 'callFnct', c: 'updateState' }, '*');
            iframe.style.opacity = 1;
            reloadTimeOut = false;
        }, 10);
    }
};
//------------------------- Settings -------------------------
const state = {
    rotationX: 0,
    rotationY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    startRotationX: 0,
    startRotationY: 0,
    translateX: 10000,
    translateY: 10000,
    translateYscrl: 0,
    startTranslateX: 0,
    startTranslateY: 0,
    maxTranslateZ: 0,
    prevSrlHght: 0,
    maxScrollValue: null,
};

function getState(updates) {
    Object.assign(state, updates);
}

function getStateStr(){
    return `
        const state = {
            rotationX: ${state.rotationX},
            rotationY: ${state.rotationY},
            zoomLevel: ZOOMLEVEL,
            isDragging: ${state.isDragging},
            startX: ${state.startX},
            startY: ${state.startY},
            startRotationX: ${state.startRotationX},
            startRotationY: ${state.startRotationY},
            translateX: ${state.translateX},
            translateY: ${state.translateY},
            translateYscrl: ${state.translateYscrl},
            startTranslateX: ${state.startTranslateX},
            startTranslateY: ${state.startTranslateY},
            maxTranslateZ: ${state.maxTranslateZ},
            prevSrlHght: ${state.prevSrlHght},
            maxScrollValue: ${state.maxScrollValue},
            animationInit: INITALANIMATION,
        };`;
}


function loadSettings() {
    var color_surface = document.getElementById("color_surface");
    var color_random = document.getElementById("color_random");
    var hue = document.getElementById("hue");
    var gap = document.getElementById("gap");
    var zoom = document.getElementById("zoom");
    var dropdown = document.getElementById("viewtype");
    
    color_surface.title = "Add colors to the layers\nvalue: " + color_surface.checked;
    color_random.title = "Color the layers randomly\nvalue: " + color_random.checked;
    hue.title = "The hue of the layers\nvalue: " + hue.value;
    gap.title = "The length of the gap between layers\nvalue: " + gap.value;
    zoom.title = "The zoom constant of the camera\nvalue: " + zoom.value;

    if (dropdown.value === "DOM") {
        zIndexMode = false;
        bothMode = false;
    } else if (dropdown.value === "Z-INDEX") {
        zIndexMode = true;
        bothMode = false;
    } else if (dropdown.value === "BOTH") {
        zIndexMode = false;
        bothMode = true;
    }

    color_surface.addEventListener("change", function() {
        color_surface.title = "Add colors to the layers\nvalue: " + color_surface.checked;
        refreshFrame()
    });

    color_random.addEventListener("change", function() {
        color_random.title = "Color the layers randomly\nvalue: " + color_random.checked;
        refreshFrame()
    });

    hue.addEventListener("change", function() {
        hue.title += "The hue of the layers\nvalue: " + hue.value;
        refreshFrame()
    });

    gap.addEventListener("change", function() {
        gap.title = "The length of the gap between layers\nvalue: " + gap.value;
        refreshFrame()
    });

    zoom.addEventListener("change", function() {
        zoom.title = "The zoom constant of the camera\nvalue: " + zoom.value;
        refreshFrame()
    });

    dropdown.addEventListener("change", function() {
        if (dropdown.value === "DOM") {
            zIndexMode = false;
            bothMode = false;
        } else if (dropdown.value === "Z-INDEX") {
            zIndexMode = true;
            bothMode = false;
        } else if (dropdown.value === "BOTH") {
            zIndexMode = false;
            bothMode = true;
        }
        refreshFrame()
    });
        
    return `let COLOR_SURFACE = ${color_surface.checked}, COLOR_RANDOM = ${color_random.checked}, DEFAULT_HUE = ${hue.value}, THICKNESS = ${gap.value}, ZOOMLEVEL = ${zoom.value}, STACK_BOTH_ZINDEX_AND_DOM = ${bothMode}, STACK_BY_ZINDEX = ${zIndexMode}, INITALANIMATION = ${animation};`;
}
//------------------- Helper Functions -------------------
let timeout = false;
function refreshFrame() {
    if (timeout === false) {
        timeout = true;
        iframe.style.opacity = 0;
    setTimeout(function() {
        frame.postMessage({ t: 'callFnct', c: 'reload' }, '*');
        timeout = false;
    }, 300);}
}

//-----------------------------------------------------------