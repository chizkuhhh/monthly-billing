document.addEventListener('DOMContentLoaded', function() {
    const tenants = [
        // Example data; replace with actual data
        { refNo: '001', accountName: 'John Doe', cuM: 10, basicCharge: 50, systemLossCharge: 5, waterMaintenanceFund: 2, currentCharges: 57, previousUnpaidAccount: 20, otherCharges: 10, totalAmountDue: 87, remarks: 'Paid', billingPeriod: 'January', building: 'Building 1', floor: '1' },
        // Add more tenant data here
    ];

    const tenantTable = document.getElementById('tenantTable');
    const billingTemplate = document.getElementById('billing-template').innerHTML;
    const compiledTemplate = Handlebars.compile(billingTemplate);
    tenantTable.innerHTML = compiledTemplate({ tenants });

    const billingPeriodFilter = document.getElementById('billingPeriodFilter');
    const buildingFilter = document.getElementById('buildingFilter');
    const floorFilter = document.getElementById('floorFilter');

    populateSelect(billingPeriodFilter, ['January', 'February']); // Replace with actual billing periods
    populateSelect(buildingFilter, ['Building 1', 'Building 2']); // Replace with actual buildings
    populateSelect(floorFilter, ['1', '2', '3']); // Replace with actual floors

    function populateSelect(selectElement, options) {
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.innerHTML = option;
            selectElement.appendChild(opt);
        });
    }
});

function filterByBillingPeriod() {
    const billingPeriod = document.getElementById('billingPeriodFilter').value.toLowerCase();
    filterTable('billing-period', billingPeriod);
}

function filterByFloor() {
    const floor = document.getElementById('floorFilter').value.toLowerCase();
    filterTable('floor', floor);
}

function filterTenants() {
    const tenantName = document.getElementById('searchTenant').value.toLowerCase();
    filterTable('tenant-name', tenantName);
}

function filterTable(dataAttribute, filterValue) {
    const rows = document.querySelectorAll('.tenant-row');
    rows.forEach(row => {
        const cellValue = row.dataset[dataAttribute].toLowerCase();
        if (cellValue.includes(filterValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function openModal(refNo) {
    const modal = document.getElementById('accountModal');
    const modalContent = document.getElementById('modalContent');
    modal.style.display = 'block';
    modalContent.innerHTML = 'Loading...';

    // Replace with your logic to fetch account details and old billings
    setTimeout(() => {
        modalContent.innerHTML = `<p>Details for REF no: ${refNo}</p><p>Account details and old billings...</p>`;
    }, 500);
}

function closeModal() {
    const modal = document.getElementById('accountModal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('accountModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
