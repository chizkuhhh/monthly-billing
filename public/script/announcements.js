// get modals
const announcementModal = document.getElementById('announcementModal');
const editAnnouncementModal = document.getElementById('editAnnouncement');
const fullAnnouncementModal = document.getElementById('fullAnnouncement');

// get buttons that show the modals
const createAnnouncementButton = document.getElementById('createAnnouncementButton');
const editButtons = document.querySelectorAll('.edit-button');
const readMoreLinks = document.querySelectorAll('.read-more');

// get the <span> elements that close the modals
const closeCreate = document.querySelector('.close-create');
const closeEdit = document.querySelector('.close-edit');
const closeFull = document.querySelector('.close-full');

// When the user clicks on <span> (x), close the modals
closeCreate.onclick = function() {
    announcementModal.style.display = 'none';
}
closeEdit.onclick = function() {
    editAnnouncementModal.style.display = 'none';
}
closeFull.onclick = function() {
    fullAnnouncementModal.style.display = 'none';
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == announcementModal) {
        announcementModal.style.display = 'none';
    }
    if (event.target == editAnnouncementModal) {
        editAnnouncementModal.style.display = 'none';
    }
    if (event.target == fullAnnouncementModal) {
        fullAnnouncementModal.style.display = 'none';
    }
}

// add an announcement
createAnnouncementButton.onclick = function() {
    announcementModal.style.display = 'block';
}

const announcementForm = document.getElementById("announcementForm");
announcementForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("announcementTitle").value;
    const message = document.getElementById('announcementMessage').value;
    const id = window.userId;

    const requestData = { title, message, id};

    try {
        const response = await fetch("/api/announcements", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            throw new Error("Failed to post announcement");
        }

        const newAnnouncement = await response.json();
        console.log("New announcement added:", newAnnouncement);

        const modal = document.getElementById("announcementModal");
        modal.style.display = "none";

        // Optionally provide feedback to the user
        alert("Announcement posted successfully!");

        location.reload();
    } catch (error) {
        console.error("Error adding announcement:", error.message);
        // Display the error message to the user
        const feedbackElement = document.getElementById("feedbackText");
        if (feedbackElement) {
            feedbackElement.innerText = `Error: ${error.message}`;
            feedbackElement.style.color = 'red'; // Optional: to make the error message stand out
        }
    }
});

// read more handler
readMoreLinks.forEach(link => {
    link.onclick = function() {
      const id = link.getAttribute('data-id');
      const title = link.getAttribute('data-title');
      const message = link.getAttribute('data-message');
      openModal(id, title, message);
    }
});

function openModal(id, title, message) {
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');

    modalTitle.textContent = title;
    modalMessage.innerHTML = message.replace(/(\r\n|\n|\r)/gm, '<br>');

    fullAnnouncementModal.style.display = 'block';
}

// deleting an announcement
const deleteButtons = document.querySelectorAll(".delete-button");
deleteButtons.forEach(button => {
    button.addEventListener("click", async function () {
        const announcementId = button.getAttribute("data-id");

        // confirmation
        if (confirm("Are you sure you want to delete this announcement?")) {
            try {
                const response = await fetch(`/api/announcements/${announcementId}`, {
                    method: "DELETE"
                });

                if (!response.ok) {
                    throw new Error("Failed to delete announcement");
                }

                const result = await response.json();
                console.log(result.message);

            } catch (error) {
                console.error("Error deleting announcement:", error.message);
            }

            location.reload();
        }
    });
});

// editing an announcement
editButtons.forEach(button => {
    button.addEventListener("click", async function () {
        console.log('edit button clicked');
        const announcementId = button.getAttribute("data-id");

        // get announcement details first
        const response = await fetch(`/api/announcements/${announcementId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch announcement data");
        }
        const announcementData = await response.json();
        console.log("Announcement data for editing:", announcementData);

        // place data in form for editing
        document.getElementById('editAnnTitle').value = announcementData.title;
        document.getElementById('editAnnMessage').value = announcementData.message;
        document.getElementById('user_id').value = announcementData.user_id;
        document.getElementById('announcement_id').value = announcementData._id;

        editAnnouncementModal.style.display = "block";
    });
});

const editForm = document.getElementById('editAnnForm');

editForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  // save any edits
  const title = document.getElementById('editAnnTitle').value;
  const message = document.getElementById('editAnnMessage').value;
  const user_id = document.getElementById('user_id').value;
  const announcementId = document.getElementById('announcement_id').value

  requestData = {title, message, user_id}

  try {
    const response = await fetch(`/api/announcements/${announcementId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
    });

    if (!response.ok) {
        throw new Error("Failed to update announcement");
    }

    const updatedUser = await response.json();
    console.log("User updated:", updatedUser);

    const editModal = document.getElementById("editAnnouncement");
    editModal.style.display = "none";

    location.reload();
  } catch (error) {
      console.error("Error updating announcement:", error.message);
  }
})

// datatables plugin
$(document).ready(function() {
    // datatables config for announcements table
    var table = $('#announcement-table').DataTable({
            lengthMenu: [10, 25, 50],
            pageLength: 10,
            ordering: false,
            autoWidth: false
        });
});