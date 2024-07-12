document.body.addEventListener("click", function (event) {
    if (event.target.id === "addUserButton") {
      const addUserModal = document.getElementById("addUserModal");
      addUserModal.style.display = "block";
    }
  
    // Close modal when the close button or outside the modal is clicked
    if (
      event.target.classList.contains("close") ||
      event.target.classList.contains("modal")
    ) {
      const addUserModal = document.getElementById("addUserModal");
      addUserModal.style.display = "none";
    }
  
    if (event.target.id === "addUserForm") {
      event.preventDefault();
      console.log("Form submitted");
      const addUserModal = document.getElementById("addUserModal");
      addUserModal.style.display = "none";
      //adding frontend script here.
      //showContent(currentSection);
    }
  
    function addUserToTable(user) {
      const tbody = document.querySelector("tbody");
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${user.name}</td>
        <td>${user.username}</td>
        <td>${user.role}</td>
        <td>
          <button class="edit-button" data-id="${user.id}">Edit</button>
          <button class="delete-button" data-id="${user.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(newRow);
    }
  });