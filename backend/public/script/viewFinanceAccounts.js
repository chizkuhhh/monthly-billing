/*
function filterTenants() {
    const searchValue = document.getElementById('searchTenant').value.toLowerCase();
    const rows = document.querySelectorAll('.tenant-row');

    rows.forEach(row => {
        const tenantName = row.getAttribute('data-tenant-name').toLowerCase();
        if (tenantName.includes(searchValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterByBillingPeriod() {
    const selectedPeriod = document.getElementById('billingPeriodFilter').value;
    const rows = document.querySelectorAll('.tenant-row');

    rows.forEach(row => {
        const billingPeriod = row.getAttribute('data-billing-period');
        if (selectedPeriod === '' || billingPeriod === selectedPeriod) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
*/
function filterByBillingPeriod() {
    const billingPeriod = document.getElementById('billingPeriodFilter').value.toLowerCase();
    filterTable('billing-period', billingPeriod);
}

function filterByBuilding() {
    const building = document.getElementById('buildingFilter').value.toLowerCase();
    filterTable('building', building);
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
