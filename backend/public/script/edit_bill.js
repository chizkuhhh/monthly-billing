function validateSection() {
    let sections = document.querySelectorAll(".section div, .section li");
    for (let section of sections) {
        let value = section.innerText.trim();
        if (section.getAttribute("data-type") === "number") {
            if (isNaN(value) || Number(value) < 0) {
                alert("Please enter a valid non-negative number.");
                return false;
            }
        } else if (section.getAttribute("data-type") === "date") {
            let date = new Date(value);
            if (isNaN(date.getTime())) {
                alert("Please enter a valid date.");
                return false;
            }
        }
    }
    return true;
}

function confirmEdits() {
    if (validateSection()) {
        alert("Changes confirmed.");
        // perform the save operation
    }
}

function cancelEdits() {
    if (confirm("Are you sure you want to cancel the edits?")) {
        location.reload();  // reload the page to discard changes
    }
}
