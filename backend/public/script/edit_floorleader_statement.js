let currentEditId;

function openEditModal(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        currentEditId = id;
        document.getElementById('editRefNo').value = row.cells[0].innerText;
        document.getElementById('editAccountName').value = row.cells[1].innerText;
        document.getElementById('editCuM').value = row.cells[2].innerText;
        document.getElementById('editBasicCharge').value = row.cells[3].innerText;
        document.getElementById('editSystemLossCharge').value = row.cells[4].innerText;
        document.getElementById('editWaterMaintenanceFund').value = row.cells[5].innerText;
        document.getElementById('editCurrentCharges').value = row.cells[6].innerText;
        document.getElementById('editPreviousUnpaidAccount').value = row.cells[7].innerText;
        document.getElementById('editOtherCharges').value = row.cells[8].innerText;
        document.getElementById('editTotalAmountDue').value = row.cells[9].innerText;
        document.getElementById('editRemarks').value = row.cells[10].innerText;

        document.getElementById('editModal').style.display = 'block';
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function saveEdits() {
    const row = document.querySelector(`tr[data-id="${currentEditId}"]`);
    if (row) {
        row.cells[1].innerText = document.getElementById('editAccountName').value;
        row.cells[2].innerText = document.getElementById('editCuM').value;
        row.cells[3].innerText = document.getElementById('editBasicCharge').value;
        row.cells[4].innerText = document.getElementById('editSystemLossCharge').value;
        row.cells[5].innerText = document.getElementById('editWaterMaintenanceFund').value;
        row.cells[6].innerText = document.getElementById('editCurrentCharges').value;
        row.cells[7].innerText = document.getElementById('editPreviousUnpaidAccount').value;
        row.cells[8].innerText = document.getElementById('editOtherCharges').value;
        row.cells[9].innerText = document.getElementById('editTotalAmountDue').value;
        row.cells[10].innerText = document.getElementById('editRemarks').value;

        closeEditModal();
    }
}

function confirmEdits() {
    alert("Changes confirmed.");
    // perform the save operation
}

function cancelEdits() {
    if (confirm("Are you sure you want to cancel the edits?")) {
        location.reload();  // reload the page to discard changes
    }
}
