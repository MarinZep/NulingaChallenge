const currentAlignment = { isAlignedRight: true};
const flagFoNotePOST = { isFlagUp: false};
const COORDINATE_THRESHOLD = 770;
const blockItems = document.querySelectorAll(".document-block-item");
const localStorage = window.localStorage;

loadNotesFromLocalStorage();
addHoverLogicForAllBlockItems();

function addHoverLogicForAllBlockItems() {
    let documentBlockList = document.querySelectorAll(".document-block-list")[0];
    for (let i = 0; i < blockItems.length; i++) {
        if (blockItems[i].parentNode == documentBlockList) {
            blockItems[i].addEventListener("mouseover", function(e) {
                                                            removeDuplicatesOfGivenType(blockItems, "plus-symbol")
                                                            showPlusSymbolElement(e)} );
        }
    }
}

function reCreateNote(srcNote) {
    let noteToBeCreated = null;
    let mapBlockItemUuidToNode = buildBlockItemUuidToNodeMap(blockItems);
    if(mapBlockItemUuidToNode.has(srcNote.elementId)) {
        noteToBeCreated = buildNote(srcNote);
        mapBlockItemUuidToNode.get(srcNote.elementId).appendChild(noteToBeCreated);
    }
    return noteToBeCreated;
}

function buildBlockItemUuidToNodeMap(blockItems) {
    let uuidToNodeMap = new Map();
    blockItems.forEach( item => uuidToNodeMap.set(item, item.uuid));
    return uuidToNodeMap;
}



function loadNotesFromLocalStorage() {
    if (localStorage.length) {
        for (let i = 0; i < localStorage.length; i++) {
            console.log(localStorage.getItem(localStorage.key(i)));
            let newNote = reCreateNote(localStorage.getItem(localStorage.key(i)));
            console.log(newNote);
        }
    }
}

function removeDuplicatesOfGivenType(blockItems, classType) {
    blockItems.forEach(blockItem => {
        blockItem.childNodes.forEach( childDiv => {
            childDiv.className == classType ? blockItem.removeChild(childDiv)
                                            : null;
        })
    });
}

function showPlusSymbolElement(event) {
    let blockItem = event.currentTarget;
    mouseXCoordinate = event.clientX;
    if (!isUniqueChildOfCollection(blockItem.childNodes, "plus-symbol")) {
        return;
    }
    let plusSymbolElement = buildPlusSymbol();
    blockItem.appendChild(plusSymbolElement);
    blockItem.addEventListener("click", function(e) {attachNote(e);} );
}

function buildPlusSymbol() {
    let plusSymbolElement = document.createElement("div");
    plusSymbolElement.setAttribute("class", "plus-symbol");
    currentAlignment.isAlignedRight = mouseXCoordinate >= COORDINATE_THRESHOLD;
    currentAlignment.isAlignedRight ? plusSymbolElement.style.marginLeft = "40em"
                 : plusSymbolElement.style.marginRight = "40em";
    let plusSymbolImage = document.createElement("img");
    plusSymbolImage.setAttribute("src", "./img-resources/plus.png");
    plusSymbolElement.appendChild(plusSymbolImage);
    return plusSymbolElement;
}

function attachNote(event) {
    let newNote = buildNote(null);
    let parentNode = event.srcElement.parentNode;
    if (!parentNode || !isUniqueChildOfCollection(parentNode.childNodes, "note")) {
        return;
    } else {
        let leftoverNotes = document.querySelectorAll(".note");
        leftoverNotes.forEach( note => { note.innerHTML == "" ? (note.parentNode.style.backgroundColor = null, note.parentNode.removeChild(note)) : null});
        parentNode.style.backgroundColor = "#FFFFA0";
        parentNode.appendChild(newNote);
        newNote.focus();
        addEventListenersToNewNote(newNote);
    }
}

function buildNote(srcNote) {
    let newNote = document.createElement("div");
    newNote.setAttribute("class", "note");
    newNote.setAttribute("contenteditable", "true");
    if (srcNote) {
        newNote.innerHTML = srcNote.text;
        setNodeAlignment(srcNote.isAlignedRight, newNote);
    } else {
        setNodeAlignment(currentAlignment.isAlignedRight, newNote);
    }

    return newNote;
}

function setNodeAlignment(isAlignedRight, newNote) {
    isAlignedRight ? (newNote.style.marginLeft = "55em")
                 : (newNote.style.left = "3em",
                    newNote.style.marginRight = "10em");
}


function addEventListenersToNewNote(newNote) {
    newNote.addEventListener("keydown", function(e){ 
        finalizeNote(e);
        newNote.parentNode.style.backgroundColor = null;});
    
}


function finalizeNote(event) {
    let currentNote = event.currentTarget;
    if (event.keyCode == 13) {
        event.preventDefault();
        currentNote.blur();
        saveNoteToLocalStorage(currentNote);
    } else if(event.keyCode == 27) {
        currentNote.parentNode.removeChild(currentNote);
    }

}

function saveNoteToLocalStorage(note){
    console.log(note);
    localStorage.setItem(note.parentNode.uuid, note.outerHTML)
    console.log(localStorage.getItem(note.parentNode.uuid));
}

function removeNoteFromLocalStorage(uuid){
    localStorage.removeItem(uuid);
}

function generateRandomId(){
    return Math.floor(Math.random() * 1000000);
}

function isUniqueChildOfCollection(childCollection, childType) {
    let isUnique = true;
    for (let i = 0; i < childCollection.length; i++) {
        if (childCollection.item(i).className == childType) {
            isUnique = false;
        }
    }
    return isUnique;
}


//GET/POST methods

function getNotes() {
    let getEndpoint = "";
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState != 4) { 
            return;
        }
        if (this.status == 200) {
            let userNotes = JSON.parse(this.responseText);
            userNotes.forEach( note => reCreateNote(note))
        }
    };
    xhr.open("GET", getEndpoint, true);
    xhr.send();
    return null;
}

function saveNoteState(){
    let xhr = new XMLHttpRequest();
    let postEndpoint = ""
    xhr.open("POST", postEndpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
        //note values per model specifications.
    }));
}
