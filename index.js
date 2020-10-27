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
                                                            removeDuplicatesOfGivenType("plus-symbol")
                                                            showPlusSymbolElement(e)} );
        }
    }
}

function reCreateNote(srcNote) {
    let srcNoteElementId = returnElementIdFromOuterHTML(srcNote);
    let mapBlockItemUuidToNode = buildBlockItemUuidToNodeMap(blockItems);
    if(mapBlockItemUuidToNode.has(srcNoteElementId)) {
        let noteToBeCreated = buildNote(srcNote);
        mapBlockItemUuidToNode.get(srcNoteElementId).appendChild(noteToBeCreated);
        noteToBeCreated.outerHTML = srcNote;
        return noteToBeCreated;
    } else {
        return null;
    }
}


function returnElementIdFromOuterHTML(outerHTML){
    let elementIdString = null;
    elementIdString = outerHTML.substring(outerHTML.indexOf("elementid"),
                                          outerHTML.indexOf("\">"))
                                                .slice(11);
    return elementIdString;
}

function buildBlockItemUuidToNodeMap(blockItems) {
    let uuidToNodeMap = new Map();
    blockItems.forEach( item => uuidToNodeMap.set(item.getAttribute("data-uuid"), item));
    return uuidToNodeMap;
}

function loadNotesFromLocalStorage() {
    if (localStorage.length) {
        for (let i = 0; i < localStorage.length; i++) {
            let newNote = reCreateNote(localStorage.getItem(localStorage.key(i)));
            console.log(newNote);
        }
    }
}

function removeDuplicatesOfGivenType(classType) {
    let elementList = document.querySelectorAll("." + classType);
    elementList.forEach( element => element.parentNode.removeChild(element));
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
    let parentNode = event.currentTarget;
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
    if (!srcNote) {
        setNodeAlignment(currentAlignment.isAlignedRight, newNote);
    }

    return newNote;
}

function setNodeAlignment(isAlignedRight, newNote) {
    isAlignedRight ? (newNote.style.marginLeft = "55em", 
                      newNote.setAttribute("isAlignedRight", true))
                 : (newNote.style.left = "3em",
                    newNote.style.marginRight = "10em", 
                    newNote.setAttribute("isAlignedRight", false));
}


function addEventListenersToNewNote(newNote) {
    newNote.addEventListener("keydown", function(e){ 
        finalizeNote(e);
        newNote.parentNode.style.backgroundColor = null;});
    
}


function finalizeNote(event) {
    let currentNote = event.target;
    if (event.keyCode == 13) {
        event.preventDefault();
        currentNote.blur();
        saveNoteToLocalStorage(currentNote);
    } else if(event.keyCode == 27) {
        currentNote.parentNode.removeChild(currentNote);
    }

}

function saveNoteToLocalStorage(note){
    let uuid = note.parentNode.getAttribute("data-uuid");
    note.setAttribute("elementId", uuid);
    localStorage.setItem(uuid, note.outerHTML)
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
