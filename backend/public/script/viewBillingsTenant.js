document.addEventListener('DOMContentLoaded', (event) => {
    filterByPeriod();  // Call filterByPeriod to show the current period bills by default
});

function filterByPeriod() {
    const selectedPeriod = document.getElementById('billingPeriod').value;
    const rows = document.querySelectorAll('.billing-row');

    rows.forEach(row => {
        const billingPeriod = row.getAttribute('data-billing-period');
        if (billingPeriod === selectedPeriod) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function showReportModal(refNo) {
    document.getElementById('reportRefNo').value = refNo;
    document.getElementById('reportModal').style.display = 'block';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
}

function submitReport() {
    const refNo = document.getElementById('reportRefNo').value;
    const issueDescription = document.getElementById('issueDescription').value;

    // Submit the report issue via an API call or form submission
    console.log(`Report submitted for REF no: ${refNo}, Issue: ${issueDescription}`);

    closeReportModal();
}
