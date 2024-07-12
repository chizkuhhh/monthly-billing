document.body.addEventListener("click", function (event) {
    console.log("Announcement.js loaded");
    if (event.target.id === "createAnnouncementButton") {
      const addAnnouncementModal = document.getElementById("announcementModal");
      addAnnouncementModal.style.display = "block";
    }
  
    // Close modal when the close button or outside the modal is clicked
    if (
      event.target.classList.contains("close") ||
      event.target.classList.contains("modal")
    ) {
      const addAnnouncementModal = document.getElementById("announcementModal");
      addAnnouncementModal.style.display = "none";
    }
  });

  const announcementForm = document.getElementById("announcementForm");
  announcementForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const title = document.getElementById("announcementTitle").value;
      const message = document.getElementById("announcementMessage").value;
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
        console.log("New user added:", newAnnouncement);
  
        const modal = document.getElementById("announcementModal");
        modal.style.display = "none";
  
        location.reload();
      } catch (error) {
        console.error("Error adding announcement:", error.message);
      }
    });

// read more handler
const modal = document.getElementById("fullAnnouncement");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");

// Handle clicks on "Read more" links
document.querySelectorAll('.read-more').forEach(link => {
    link.addEventListener('click', async function(e) {
      console.log("read more clicked");
        e.preventDefault();
        const announcementId = this.getAttribute('data-id');
        
        try {
          const response = await fetch(`/api/announcements/${announcementId}`);
          if (!response.ok) {
              throw new Error("Failed to fetch announcement data");
          }
          const announcementData = await response.json();
          
          modalTitle.textContent = announcementData.title;
          modalMessage.textContent = announcementData.message;
          modal.style.display = 'block';
      } catch (error) {
          console.error("Error fetching user data:", error.message);
      }
    });
});

// Close the modal when the close button (×) is clicked
modal.querySelector('.close').addEventListener('click', function() {
    modal.style.display = 'none';
});

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
const editModal = document.getElementById('editAnnouncement');

// Function to close the edit modal
function closeEditModal() {
  editModal.style.display = 'none';
}

// close when user clicks on x or outside the modal
const closeModal = document.querySelector(".close");
closeModal.addEventListener("click", function () {
  closeEditModal();
});

window.onclick = function(event) {
  const modal = document.getElementById('editAnnouncement');
  if (event.target == modal) {
      modal.style.display = "none";
  }
}

const editButtons = document.querySelectorAll(".edit-button");
editButtons.forEach(button => {
    button.addEventListener("click", async function () {
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

        editModal.style.display = "block";
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