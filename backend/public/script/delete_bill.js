// scripts.js

let billToDelete = null;

function showModal(id) {
  billToDelete = id;
  document.getElementById('deleteModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('deleteModal').style.display = 'none';
  billToDelete = null;
}

function deleteBill() {
  if (billToDelete !== null) {
    alert("Deleting bill " + billToDelete);
    // Add your deletion logic here

    closeModal();
  }
}

// Close the modal if the user clicks anywhere outside of the modal
window.onclick = function(event) {
  const modal = document.getElementById('deleteModal');
  if (event.target === modal) {
    closeModal();
  }
}
