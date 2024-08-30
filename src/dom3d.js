// Description: Modified version of the original dom3d.js script by @OrionReed
// link: github.com/OrionReed/dom3d
//--------------------- Post Message ----------------------
  window.onmessage=e=>{
  if(e.data.t==="callFnct")
    if (e.data.c === 'updateState') {
      updateState();
    } else if (e.data.c === 'recenter') {
      recenter();
    } else if (e.data.c === 'reload') {
      reload();
    }
  }
//---------------- Functions called by UI ------------------
  function updateState(){
    body.style.transform = getBodyTransform();
  }
  
  function recenter() {
    state.translateX = window.innerWidth / 2 - body.clientWidth / 2;
    state.translateY = window.innerHeight / 2 - body.clientHeight / 2;
    state.zoomLevel = ZOOMLEVEL;
    body.style.transform = getBodyTransform();
  }

  function reload(){
    location.reload();
  }
//------------------- Initialize Document ------------------ 
  const body = document.body;
  const html = document.documentElement;
  const wrapper = document.createElement("div");
  
  body.classList.add("dom3d-enabled");
  wrapper.classList.add("dom3d-wrapper");
  
  wrapper.appendChild(body);
  html.appendChild(wrapper);
  
  const domDepthCache = getDOMDepth(wrapper);
  
  applyBaseBodyStyles();
  addEventListeners();
  traverseDOM(wrapper, 0, 0, 0);
  if (STACK_BY_ZINDEX || STACK_BOTH_ZINDEX_AND_DOM){repositionZIndexElements();}

  // Initialize the animation
  if (!state.animationInit) {
    setTimeout(() => {
      initialAnimation();
      state.animationInit = true;
    }, 100);
  }
//-------------------- Functions ---------------------------  
  // Z-Index repositioning
  function repositionZIndexElements() {
    const elements = Array.from(document.querySelectorAll("*"));
    const positiveZIndexElements = [];
    const negativeZIndexElements = [];

    elements.forEach((element) => {
      const zIndex = parseInt(getComputedStyle(element).zIndex, 10) || 0;
      if (zIndex > 0) {
        positiveZIndexElements.push(element);
      } else if (zIndex < 0) {
        negativeZIndexElements.push(element);
      }
      //sort positive z-index elements in ascending order
      positiveZIndexElements.sort((a, b) => {
        return (
          parseInt(getComputedStyle(a).zIndex, 10) -
          parseInt(getComputedStyle(b).zIndex, 10)
        );
      });
    });
  
    //use the index of the array multiplied by the THICKNESS to set the translateZ value
    positiveZIndexElements.forEach((element, index) => {
      apply3DStyles(element, index + 1 + state.maxTranslateZ);
      element.style.transform = `translateZ(${
        (index + 2 + state.maxTranslateZ) * (THICKNESS/2)
      }px)`;
    });
    negativeZIndexElements.forEach((element, index) => {
      apply3DStyles(element, -1 * (index + 2));
      element.style.transform = `translateZ(${-1 * (index + 2) * THICKNESS}px)`;
    });
  }
  
  // Traverse the DOM
  function traverseDOM(parentNode, depthLevel, offsetX, offsetY) {
    let children = Array.from(parentNode.children);
    
    if (STACK_BY_ZINDEX && !STACK_BOTH_ZINDEX_AND_DOM) {
      // Group elements by z-index
      const zIndexGroups = {};
  
      children.forEach((child) => {
        const zIndex = parseInt(getComputedStyle(child).zIndex, 10) || 0;
        if (!zIndexGroups[zIndex]) {
          zIndexGroups[zIndex] = [];
        }
        zIndexGroups[zIndex].push(child);
      });
      const sortedZIndexes = Object.keys(zIndexGroups).sort((a, b) => a - b);
  
      sortedZIndexes.forEach((zIndex, zIndexOrder) => {
        const group = zIndexGroups[zIndex];
        group.forEach((node) => {
          if (depthLevel > state.maxTranslateZ) {
            state.maxTranslateZ = depthLevel;
          }
          apply3DStyles(node, zIndexOrder);
          traverseDOM(node, depthLevel + 1, offsetX, offsetY);
        });
      });

    } else {

        // Group elements by DOM
      children.forEach((node) => {
        if (depthLevel > state.maxTranslateZ) {
          state.maxTranslateZ = depthLevel;
        }
        apply3DStyles(node, depthLevel);
        traverseDOM(node, depthLevel + 1, offsetX, offsetY);
      });
    }
  }

  function firstLayer(zIndexOrder) {
    return zIndexOrder <= 0;
  }
  
  // Apply 3D styles to the element
  function apply3DStyles(node, zIndexOrder) {
    const hue = DEFAULT_HUE;
    const color = COLOR_RANDOM
      ? getRandomColor()
      : getColorByDepth(zIndexOrder, hue, -5);

    const textColor = firstLayer(zIndexOrder) ? "white" : "none";  
  
    Object.assign(node.style, {
      transform: `translateZ(${
        THICKNESS * (STACK_BY_ZINDEX ? zIndexOrder : 1)
      }px)`,
      color: textColor,
      overflow: "visible",
      transformStyle: "preserve-3d",
      backgroundColor: COLOR_SURFACE
        ? color
        : getComputedStyle(node).backgroundColor,
      willChange: "transform",
      isolation: "auto",
      transition: "outline 0.3s ease-in-out",
    });
  
    node.addEventListener("mouseenter", () => {
      node.style.outline = `2px solid white`;
      let className = node.className;
      if (className === "dom3d-enabled") {
        className = null;
      }
  
      const title = `layer: ${zIndexOrder}\n${node.tagName.toLowerCase()}${
        node.id ? `#${node.id}` : ""
      }${className ? `.${className.replace(/\s+/g, ".")}` : ""}\nz-index: ${
        getComputedStyle(node).zIndex
      }\nheight: ${getComputedStyle(node).height}\nwidth: ${
        getComputedStyle(node).width
      }`;
      node.setAttribute("title", title);
    });
  
    node.addEventListener("mouseleave", () => {
      node.style.outline = "none";
      node.removeAttribute("title");
    });
  }
  
  function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 40 + Math.floor(Math.random() * 30);
    const lightness = 30 + Math.floor(Math.random() * 30);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  
  function getBodyTransform() {
    return `rotateX(${state.rotationY}deg) rotateY(${state.rotationX}deg) scale(${state.zoomLevel}) translateX(${state.translateX}px) translateY(${state.translateY}px) translateZ(${THICKNESS}px)`;
  }
  
  function getDOMDepth(element) {
    return (
      [...element.children].reduce(
        (max, child) => Math.max(max, getDOMDepth(child)),
        0
      ) + 1
    );
  }
  
  function getColorByDepth(depth, hue = 0, lighten = 0) {
    return `hsl(${hue}, 75%, ${
      Math.min(10 + depth * (1 + 60 / domDepthCache), 90) + lighten
    }%)`;
  }
  
  function applyBaseBodyStyles() {
    const perspectiveOriginX = window.innerWidth / 2;
    const perspectiveOriginY = window.innerHeight / 2;
    html.style.overflow = "hidden";
    wrapper.style.position = "absolute";
    wrapper.style.top = "0";
    wrapper.style.left = "0";
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.overflow = "hidden";
    wrapper.style.transformStyle = "preserve-3d";
    wrapper.style.perspective = "1000px";
    body.style.height = "100%";
    body.style.width = "100%";
    body.style.overflow = "auto";
    body.style.position = "absolute";
    body.style.transformStyle = "preserve-3d";
    body.style.transition = "transform 0.2s ease-out";
    body.style.perspective = "1000px";
    body.style.perspectiveOrigin =
      body.style.transformOrigin = `${perspectiveOriginX}px ${perspectiveOriginY}px`;
  }
  
  function handlePointerDown(event) {
    event.preventDefault();
    state.isDragging = true;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.startRotationX = state.rotationX;
    state.startRotationY = state.rotationY;
    state.startTranslateX = state.translateX;
    state.startTranslateY = state.translateY;
  }
  
  function handleWheel(event) {
    if (event.altKey) {
      event.preventDefault();
      state.zoomLevel = Math.max(
        0.1,
        Math.min(state.zoomLevel + event.deltaY * 0.001, 2)
      );
      let posx = window.innerWidth / 2;
      let posy = window.innerHeight / 2;
      body.style.transformOrigin = `${posx}px ${posy}px`;
      body.style.transform = getBodyTransform();
      window.parent.postMessage({ action: 'changeZoom', data: state.zoomLevel }, '*');
    } else {
      event.stopPropagation();
      event.preventDefault();
  
      if (body.scrollHeight - 40 > window.innerHeight) {
        state.maxScrollValue = state.translateYscrl += event.deltaY;
      }
  
      state.translateYscrl += event.deltaY;
  
      state.translateYscrl = limitNumberWithinRange(state.translateYscrl,state.maxScrollValue,0);
      const elements = Array.from(body.children).filter(
        (element) => getComputedStyle(element).position !== "fixed"
      );
  
      elements.forEach((element) => {
        
        let style = getComputedStyle(element).transform;
        if (style.startsWith("matrix3d")) {
          let values = style.match(/matrix3d\((.+)\)/)[1].split(", ").map(parseFloat);
          values[13] = state.translateYscrl;
          newStyle = `matrix3d(${values.join(", ")})`;
        } else if (style.startsWith("matrix")) {
          let values = style.match(/matrix\((.+)\)/)[1].split(", ").map(parseFloat);
          values[5] = state.translateYscrl;
          newStyle = `matrix(${values.join(", ")})`;
        } else {
          newStyle = `translateY(${state.translateYscrl}px)`;
        }
  
        element.style.transform = newStyle;
      });
  
      // Change the pivot point of the body to the center of the screen
      let posx = window.innerWidth / 2;
      let posy = window.innerHeight / 2;
      body.style.transformOrigin = `${posx}px ${posy}px`;
    }
    window.parent.postMessage({ action: 'getState', data: state }, '*');
    window.parent.postMessage({ action: 'closeSubMenu' }, '*');
  }
  
  function handlePointerMove(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!state.isDragging) return;
  // Left click drag to rotate
    if (event.buttons === 1) {
      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;
      state.rotationX = state.startRotationX + (180 * deltaX) / window.innerWidth;
      state.rotationY =
        state.startRotationY - (180 * deltaY) / window.innerHeight;
      state.rotationY = limitNumberWithinRange(state.rotationY, -89, 89);
      state.rotationX = limitNumberWithinRange(state.rotationX, -89, 89);
    }
  // Right click drag to translate
    if (event.buttons === 2) {
      let pntrX = state.startTranslateX - (state.startX - event.clientX);
      let pntrY = state.startTranslateY - (state.startY - event.clientY);
      state.translateX = pntrX;
      state.translateY = pntrY;
    }
    body.style.transform = getBodyTransform();
    window.parent.postMessage({ action: 'getState', data: state }, '*');
    window.parent.postMessage({ action: 'closeSubMenu' }, '*');
  }
//-------------------- Helper Functions --------------------
  function limitNumberWithinRange(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }
  
  function incrmntNumbByMilisec(endValue, incr, milisec, updateCallback) {
    let currentValue = 0;
  
    function increment() {
      if (
        (incr > 0 && currentValue < endValue) ||
        (incr < 0 && currentValue > endValue)
      ) {
        currentValue += incr;
        updateCallback(currentValue); 
        setTimeout(increment, milisec);
      } else {
        updateCallback(endValue); 
      }
    }
    increment();
    return endValue;
  }  
//-------------------- Event Listeners ----------------------
  function addEventListeners() {
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", () => (state.isDragging = false));
    document.addEventListener("pointerleave", () => (state.isDragging = false));
    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });
  }
//-------------------- Initial Animation --------------------
  function initialAnimation() {
    const milisec = 10;
    const incrY = -0.5;
    const incrX = 0.5;
  
    state.translateX = 0;
    state.translateY = 50;
    state.zoomLevel = (window.innerWidth / body.clientWidth) * state.zoomLevel;
  
    // Increment rotationY and rotationX slowly and update the transform
    state.rotationY = incrmntNumbByMilisec(-22, incrY, milisec, function (value) {
      state.rotationY = value;
      body.style.transform = getBodyTransform();
      window.parent.postMessage({ action: 'getState', data: state }, '*');
    });
  
    state.rotationX = incrmntNumbByMilisec(44, incrX, milisec, function (value) {
      state.rotationX = value;
      body.style.transform = getBodyTransform();
      window.parent.postMessage({ action: 'getState', data: state }, '*');
    });
  }
//------------------------------------------------------------  