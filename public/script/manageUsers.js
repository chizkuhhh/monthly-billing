// Get the modal elements
const addUserModal = document.getElementById('addUserModal');
const editUserModal = document.getElementById('editUserModal');
const billingModal = document.getElementById('billingModal');
const passwordModal = document.getElementById('changePasswordModal');

// Get the button that opens the modal
const addUserButton = document.getElementById('addUserButton');

// Get the <span> element that closes the modal
const closeAddUserModal = document.querySelector('#addUserModal .close');
const closeEditUserModal = document.querySelector('#editUserModal .close');
const closeChangePassModal = document.querySelector('#changePasswordModal .close');

// When the user clicks the button, open the modal
addUserButton.addEventListener('click', function() {
    addUserModal.style.display = 'block';
});

// When the user clicks on <span> (x), close the modal
closeAddUserModal.addEventListener('click', function() {
    addUserModal.style.display = 'none';
});

closeEditUserModal.addEventListener('click', function() {
    editUserModal.style.display = 'none';
});

closeChangePassModal.addEventListener('click', function() {
    passwordModal.style.display = 'none';
});

// When the user clicks anywhere outside of the modal, close it
window.addEventListener('click', function(event) {
    if (event.target == addUserModal) {
        addUserModal.style.display = 'none';
    }
    if (event.target == editUserModal) {
        editUserModal.style.display = 'none';
    }
    if (event.target == passwordModal) {
        passwordModal.style.display = 'none';
    }
});

// change a user's password
let passUserId = '';

document.querySelectorAll(".change-pass-button").forEach(button => {
    button.addEventListener("click", async function () {
        passUserId = button.getAttribute("data-id");
        document.getElementById('pass-user').innerHTML = button.getAttribute("data-name");

        passwordModal.style.display = 'block';
    })
});

document.getElementById('changePasswordForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const userId = passUserId;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        alert('Passwords do not match.');
        return;
    }

    try {
        const response = await fetch(`/api/tenants/change-password/by-admin/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPW: newPassword }),
        });

        if (!response.ok) {
            throw new Error('Failed to change password');
        }

        const result = await response.json();
        console.log('Password changed:', result);

        passwordModal.style.display = 'none';
        showSuccessModal(`Successfully changed password for user.`);
    } catch (error) {
        console.error('Error changing password:', error.message);
    }
});

// add a user
const addUserForm = document.getElementById("addUserForm");
  addUserForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const requestData = { firstname, lastname, username, password, role };

    requestData.building_num = Number(document.getElementById("bldg_num").value);
    requestData.floor_num = document.getElementById("flr_num").value;
    requestData.unit = Number(document.getElementById("unit").value);
    requestData.meter_num = document.getElementById("meter_num").value;

    console.log(requestData);

    try {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      const newUser = await response.json();
      console.log("New user added:", newUser);

      const modal = document.getElementById("addUserModal");
      modal.style.display = "none";

      showSuccessModal(`Successfully added user: ${newUser.firstname} ${newUser.lastname}`);
    } catch (error) {
      console.error("Error adding user:", error.message);
    }
  });

// editing user
document.querySelectorAll(".edit-button").forEach(button => {
    button.addEventListener("click", async function () {
        const userId = button.getAttribute("data-id");

        try {
            const response = await fetch(`/api/tenants/${userId}?format=json`);
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const userData = await response.json();
            console.log("User data for editing:", userData);

            document.getElementById("editFirstname").value = userData.firstname;
            document.getElementById("editLastname").value = userData.lastname;
            document.getElementById("editUserId").value = userData._id;
            document.getElementById("editUsername").value = userData.username;
            document.getElementById("editRole").value = userData.role;

            document.getElementById("editBldgNum").value = userData.building_num;
            document.getElementById("editFlrNum").value = userData.floor_num;
            document.getElementById("editUnit").value = userData.unit;
            document.getElementById("editMeterNum").value = userData.meter_num;

            const editModal = document.getElementById("editUserModal");
            editModal.style.display = "block";
        } catch (error) {
            console.error("Error fetching user data:", error.message);
        }
    });
});

// Handle form submission for updating user data
document.getElementById("editUserForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const firstname = document.getElementById("editFirstname").value;
    const lastname = document.getElementById("editLastname").value;
    const userId = document.getElementById("editUserId").value;
    const username = document.getElementById("editUsername").value;
    const role = document.getElementById("editRole").value;

    const requestData = { firstname, lastname, username, role };

    requestData.building_num = Number(document.getElementById("editBldgNum").value);
    requestData.floor_num = document.getElementById("editFlrNum").value;
    requestData.unit = Number(document.getElementById("editUnit").value);
    requestData.meter_num = document.getElementById("editMeterNum").value;

    try {
        const response = await fetch(`/api/tenants/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            throw new Error("Failed to update user");
        }

        const updatedUser = await response.json();
        console.log("User updated:", updatedUser);

        const editModal = document.getElementById("editUserModal");
        editModal.style.display = "none";
        
        showSuccessModal(`Successfully edited account details for: ${updatedUser.firstname} ${updatedUser.lastname}`);
    } catch (error) {
        console.error("Error updating user:", error.message);
    }
});  

//for deleting user

const deleteButtons = document.querySelectorAll(".delete-button");
deleteButtons.forEach(button => {
  button.addEventListener("click", async function () {
      const userId = button.getAttribute("data-id");

      // confirmation
      if (confirm("Are you sure you want to delete this user?")) {
          try {
              const response = await fetch(`/api/tenants/${userId}`, {
                  method: "DELETE"
              });

              if (!response.ok) {
                  throw new Error("Failed to delete user");
              }

              const result = await response.json();
              console.log(result.message);

              button.parentElement.parentElement.remove();

            showSuccessModal(`Successfully deleted user: ${result.username}`);
          } catch (error) {
              console.error("Error deleting user:", error.message);
          }
      }
  });
});

function closeBillingModal() {
    const modal = document.getElementById('billingModal');
    modal.style.display = 'none';
    
    // Reset the form inside the modal
    const form = document.getElementById('billingForm');
    if (form) {
        form.reset();
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('billingModal');
    if (event.target == modal) {
        modal.style.display = "none";
        
        // Reset the form inside the modal
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}
  
  // for option to show password in add and edit user
  document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
  });
  
//   document.getElementById('togglePasswordEdit').addEventListener('click', function() {
//     const passwordField = document.getElementById('editPassword');
//     const toggleIcon = document.getElementById('togglePasswordEdit');
    
//     if (passwordField.type === 'password') {
//         passwordField.type = 'text';
//         toggleIcon.classList.remove('fa-eye');
//         toggleIcon.classList.add('fa-eye-slash');
//     } else {
//         passwordField.type = 'password';
//         toggleIcon.classList.remove('fa-eye-slash');
//         toggleIcon.classList.add('fa-eye');
//     }
//   });

function updateRate(index, newRate) {
    rates[index].rate = parseFloat(newRate);
    console.log(`Rate at index ${index} updated to ${newRate}`);
}

// Define the rates and thresholds
const rates = [
    { limit: 10, rate: 23.00 },
    { limit: 10, rate: 28.00 },
    { limit: 20, rate: 52.00 },
    { limit: 20, rate: 69.00 },
    { limit: 20, rate: 80.00 }
];

const rateInputs = document.querySelectorAll('.rate-input');
rateInputs.forEach((input, index) => {
    input.addEventListener('input', function() {
        updateRate(index, this.value, rates);
    });
});

  function calculateCharge() {
    const prevReading = parseFloat(document.getElementById('prevReading').value);
    const presentReading = parseFloat(document.getElementById('presentReading').value);
    const systemLossCharge = parseFloat(document.getElementById('system-loss-charge').value);
    const waterMaintenanceFund = parseFloat(document.getElementById('water-maintenance-fund').value);
    const monthlyDues = parseFloat(document.getElementById('monthly-dues').value);
    const stp = parseFloat(document.getElementById('stp').value);
    const otherCharges = parseFloat(document.getElementById('other-charges').value);

    // Calculate total consumption
    const consumption = presentReading - prevReading;

    let remainingConsumption = consumption;
    let totalCharge = 0;

    // Calculate the charge based on the tiered structure
    for (let i = 0; i < rates.length; i++) {
        if (remainingConsumption <= 0) break;
        const tier = rates[i];
        const units = Math.min(remainingConsumption, tier.limit);
        totalCharge += units * tier.rate;
        remainingConsumption -= units;
    }

    let waterCurrent = totalCharge + systemLossCharge + waterMaintenanceFund;
    let totalDue = waterCurrent  + monthlyDues + stp + otherCharges;

    document.getElementById('cu-m').value = consumption.toFixed(2);
    document.getElementById('basic-charge').value = totalCharge.toFixed(2);
    document.getElementById('water').value = waterCurrent.toFixed(2);
    document.getElementById('result').innerText = `Total Due: Php ${totalDue.toFixed(2)}`;
    document.getElementById('totalDue').value = totalDue.toFixed(2);
}

// then apply datatables to conssoa and ta, check out excel and pdf extensions
$(document).ready(function() {
    // determine columns for SearchPanes based on user role
    // don't show panes when role is floor leader
    var searchPaneColumns = [];
    var showPanes = false;
    if (window.userRole == 'admin' || window.userRole == 'finance') {
        searchPaneColumns = [3, 4, 6];
        showPanes = true;
    } else if (window.userRole == 'building leader') {
        searchPaneColumns = [4, 6]; 
        showPanes = true;
    }

    // datatables config for user table
    var table;
    if (showPanes) {
        table = $('#itemContainer').DataTable({
            layout: {
                top: 'searchPanes' // Position SearchPanes on the top
            },
            searchPanes: {
                initCollapsed: true,
                columns: searchPaneColumns,
                orderable: false
            },
            lengthMenu: [10, 25, 50],
            pageLength: 10,
            ordering: false,
            autoWidth: false
        });
    } else {
        table = $('#itemContainer').DataTable({
            lengthMenu: [10, 25, 50],
            pageLength: 10,
            ordering: false,
            autoWidth: false
        });
    }
});

// success modal/pop-up
function showSuccessModal(message) {
    document.getElementById('successMessage').innerText = message;
    document.getElementById('successModal').style.display = 'block';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    location.reload();
}
