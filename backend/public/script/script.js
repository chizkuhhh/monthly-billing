document.addEventListener("DOMContentLoaded", async function () {
  const userRole = window.userRole;
  const loggedIn = window.userId;
  const buildingNum = window.buildingNum;
  const floorNum = window.floorNum;

  console.log("User Role:", userRole);
  console.log("Logged In User:", loggedIn);
  console.log("Building Number:", buildingNum);
  console.log("Floor Number:", floorNum);

  const accountDetailsButton = document.getElementById('accountDetails');
  accountDetailsButton.addEventListener("click", async function () {
    try {
      const response = await fetch(`/api/tenants/${loggedIn}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch account details");
      }
    } catch (error) {
      console.error("Error adding user:", error.message);
    }
  });
  
  async function fetchBillings(page) {
    window.location.href = `/api/billings/${loggedIn}?page=${page}&limit=${itemsPerPage}`;
  }

  function previousPage() {
    if (currentPage > 1) {
      currentPage--;
      fetchBillings(currentPage);
    }
  }

  function nextPage() {
    currentPage++;
    fetchBillings(currentPage);
  }
});


const addUserButton = document.getElementById("addUserButton");
  addUserButton.addEventListener("click", function () {
    const modal = document.getElementById("addUserModal");
    modal.style.display = "block";
  });

  // close when user clicks on x or outside the modal
  const closeModal = document.querySelector(".close");
  closeModal.addEventListener("click", function () {
    const modal = document.getElementById("addUserModal");
    modal.style.display = "none";
  });

  window.onclick = function (event) {
    const modal = document.getElementById("addUserModal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

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
    requestData.address = document.getElementById("address").value;
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

      location.reload();
    } catch (error) {
      console.error("Error adding user:", error.message);
    }
  });

  // for editing user
  
  const modalCloseButton = document.querySelector("#editUserModal .close");
  modalCloseButton.addEventListener("click", function() {
      const editModal = document.getElementById("editUserModal");
      editModal.style.display = "none";
  });
  
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
              document.getElementById("editPassword").value = userData.password;
              document.getElementById("editRole").value = userData.role;
  
              document.getElementById("editBldgNum").value = userData.building_num;
              document.getElementById("editFlrNum").value = userData.floor_num;
              document.getElementById("editAddress").value = userData.address;
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
      const password = document.getElementById("editPassword").value;
      const role = document.getElementById("editRole").value;
  
      const requestData = { firstname, lastname, username, password, role };

      requestData.building_num = Number(document.getElementById("editBldgNum").value);
      requestData.floor_num = document.getElementById("editFlrNum").value;
      requestData.address = document.getElementById("editAddress").value;
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
          location.reload();
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

            } catch (error) {
                console.error("Error deleting user:", error.message);
            }
        }
    });
});

// for generating a billing for user
const billingButtons = document.querySelectorAll(".billing-button");
billingButtons.forEach(button => {
    button.addEventListener("click", async function () {
        const userId = button.getAttribute("data-id");

        const modal = document.getElementById('billingModal');
        modal.style.display = 'block';
    })
});

// Function to close the billing modal
function closeBillingModal() {
  const modal = document.getElementById('billingModal');
  modal.style.display = 'none';
}

window.onclick = function(event) {
  const modal = document.getElementById('billingModal');
  if (event.target == modal) {
      modal.style.display = "none";
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

document.getElementById('togglePasswordEdit').addEventListener('click', function() {
  const passwordField = document.getElementById('editPassword');
  const toggleIcon = document.getElementById('togglePasswordEdit');
  
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

function toLoginPage() {
  window.location.href = "/login";
}

async function endSession() {
  try {
      const response = await fetch('/logout', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          }
      });

      if (response.ok) {
          // Handle successful logout
          console.log('Session ended successfully');
          window.location.href = '/'; // Redirect to login or homepage
      } else {
          // Handle error
          const result = await response.json();
          console.error(result.message);
      }
  } catch (error) {
      console.error('Error:', error);
  }
}

function calculateCharge() {
      const prevReading = parseFloat(document.getElementById('prevReading').value);
      const presentReading = parseFloat(document.getElementById('presentReading').value);
      const systemLossCharge = parseFloat(document.getElementById('system-loss-charge').value);
      const waterMaintenanceFund = parseFloat(document.getElementById('water-maintenance-fund').value);
      const monthlyDues = parseFloat(document.getElementById('monthly-dues').value);
      const stp = parseFloat(document.getElementById('stp').value);
      const prevUnpaidWater = parseFloat(document.getElementById('prev-unpaid-water').value);
      const prevUnpaidMonthly = parseFloat(document.getElementById('prev-unpaid-monthly').value);
      const prevUnpaidStp = parseFloat(document.getElementById('prev-unpaid-stp').value);
      const otherCharges = parseFloat(document.getElementById('other-charges').value);

      // Calculate total consumption
      const consumption = presentReading - prevReading;

      // Define the rates and thresholds
      const rates = [
          { limit: 10, rate: 23.00 },
          { limit: 10, rate: 28.00 },
          { limit: 20, rate: 52.00 },
          { limit: 20, rate: 69.00 },
          { limit: 20, rate: 80.00 }
      ];

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
      let totalDue = waterCurrent  + monthlyDues + stp + prevUnpaidWater + prevUnpaidMonthly + prevUnpaidStp + otherCharges;

      document.getElementById('cu-m').value = consumption.toFixed(2);
      document.getElementById('basic-charge').value = totalCharge.toFixed(2);
      document.getElementById('water').value = waterCurrent.toFixed(2);
      document.getElementById('result').innerText = `Total Due: Php ${totalDue.toFixed(2)}`;
      document.getElementById('totalDue').value = totalDue.toFixed(2);
}