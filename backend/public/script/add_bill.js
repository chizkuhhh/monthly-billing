function confirmChanges() {
    // Get values from the form
    const billNo = document.getElementById('bill-no').value;
    const refNo = document.getElementById('ref-no').value;
    const accountName = document.getElementById('account-name').value;
    const unitNo = document.getElementById('unit-no').value;
    const basicCharge = document.getElementById('basic-charge').value;
    const systemLossCharge = document.getElementById('system-loss-charge').value;
    const waterMaintenanceFund = document.getElementById('water-maintenance-fund').value;
    const cuM = document.getElementById('cu-m').value;
    const meterNo = document.getElementById('meter-no').value;
    const presentMeterReading = document.getElementById('present-meter-reading').value;
    const previousMeterReading = document.getElementById('previous-meter-reading').value;
    const currentCharges = document.getElementById('current-charges').value;
    const previousUnpaidAccount = document.getElementById('previous-unpaid-account').value;
    const otherCharges = document.getElementById('other-charges').value;
    const totalAmountDue = document.getElementById('total-amount-due').value;
    const crNumber = document.getElementById('cr-number').value;
    const remarks = document.getElementById('remarks').value;

    // Validate form data
    if (!validateForm()) {
        return;
    }

    // Create a new row
    const table = document.getElementById('billing-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    // Insert cells and their values
    newRow.insertCell(0).innerText = billNo;
    newRow.insertCell(1).innerText = refNo;
    newRow.insertCell(2).innerText = accountName;
    newRow.insertCell(3).innerText = unitNo;
    newRow.insertCell(4).innerText = basicCharge;
    newRow.insertCell(5).innerText = systemLossCharge;
    newRow.insertCell(6).innerText = waterMaintenanceFund;
    newRow.insertCell(7).innerText = cuM;
    newRow.insertCell(8).innerText = meterNo;
    newRow.insertCell(9).innerText = presentMeterReading;
    newRow.insertCell(10).innerText = previousMeterReading;
    newRow.insertCell(11).innerText = currentCharges;
    newRow.insertCell(12).innerText = previousUnpaidAccount;
    newRow.insertCell(13).innerText = otherCharges;
    newRow.insertCell(14).innerText = totalAmountDue;
    newRow.insertCell(15).innerText = crNumber;
    newRow.insertCell(16).innerText = remarks;

    // Reset the form
    document.getElementById('billing-form').reset();
}

function cancelEdits() {
    if (confirm("Are you sure you want to cancel the edits?")) {
        document.getElementById('billing-form').reset();
    }
}

function validateForm() {
    const inputs = document.querySelectorAll('#billing-form input');
    for (let input of inputs) {
        if (!input.value.trim()) {
            alert('All fields must be filled out.');
            return false;
        }
    }
    return true;
}


// add bill functions - cheska
let billingUserId = '';
let meterNum = '';

// Function to close the billing modal
function closeBillingModal() {
    const modal = document.getElementById('billingModal');
    modal.style.display = 'none';
}

document.querySelectorAll(".billing-button").forEach(button => {
    button.addEventListener("click", async function () {
        billingUserId = button.getAttribute("data-id");

        try {
            const response = await fetch(`/api/tenants/${userId}?format=json`);
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const userData = await response.json();
            
            meterNum = userData.meter_num;
        } catch (error) {
            console.error("Error fetching user data:", error.message);
        }
    });
});

// Function to generate next bill number
async function generateBillNo() {
    try {
        const response = await fetch('/api/billings/bill-no'); // Replace with your backend endpoint
        const data = await response.json();
        return data.nextBillNo;
    } catch (error) {
        console.error('Error fetching next bill number:', error);
        return null;
    }
}

document.getElementById('addBillingButton').addEventListener('click', async function() {
    try {
        // Generate the next bill number
        const billNo = await generateBillNo();
        console.log(billingUserId);
        console.log(meterNum);

        // Read form input values
        let refNo = document.getElementById('refNo').value;
        let serviceInvoiceNo = document.getElementById('serviceInvoiceNo').value;
        let billingPeriodStart = document.getElementById('billingPeriodStart').value;
        let billingPeriodEnd = document.getElementById('billingPeriodEnd').value;
        let prevReading = Number(document.getElementById('prevReading').value);
        let presentReading = Number(document.getElementById('presentReading').value);
        let consumption = Number(document.getElementById('cu-m').value); // Assuming this is a number
        let basicCharge = Number(document.getElementById('basic-charge').value); // Assuming this is a number
        let systemLossCharge = Number(document.getElementById('system-loss-charge').value);
        let waterMaintenanceFund = Number(document.getElementById('water-maintenance-fund').value);
        let water = Number(document.getElementById('water').value); // Assuming this is a number
        let monthlyDues = Number(document.getElementById('monthly-dues').value); // Assuming this is a number
        let stp = Number(document.getElementById('stp').value); // Assuming this is a number
        let prevUnpaidWater = Number(document.getElementById('prev-unpaid-water').value); // Assuming this is a number
        let prevUnpaidMonthly = Number(document.getElementById('prev-unpaid-monthly').value); // Assuming this is a number
        let prevUnpaidStp = Number(document.getElementById('prev-unpaid-stp').value); // Assuming this is a number
        let otherCharges = Number(document.getElementById('other-charges').value);
        let remarks = document.getElementById('remarks').value;
        let totalDue = Number(document.getElementById('totalDue').value); // Read totalDue from hidden field

        // Prepare data to send to server
        const billingData = {
            ref_no: Number(refNo), // Ensure ref_no is parsed as an integer if needed
            tenant_id: billingUserId, // Assuming billingUserId is set elsewhere
            meter_num: meterNum, // Replace with actual meter number if applicable
            bill_no: billNo,
            billing_period_start: new Date(billingPeriodStart),
            billing_period_end: new Date(billingPeriodEnd),
            prev_reading: prevReading,
            pres_reading: presentReading,
            consumption: consumption,
            water_basic_charge: basicCharge,
            water_sys_loss: systemLossCharge,
            water_maintenance: waterMaintenanceFund,
            water_total: water,
            monthly_fee: monthlyDues,
            stp: stp,
            prev_water: prevUnpaidWater,
            prev_monthly_fee: prevUnpaidMonthly,
            prev_stp: prevUnpaidStp,
            total_due: totalDue, // Calculate total_due based on your business logic
            other_charges: otherCharges,
            service_invoice: serviceInvoiceNo,
            payment_date: null, // Payment date initially null
            remarks: remarks
        };

        console.log(billingData);

        // Send data to server to create billing record
        const response = await fetch('/api/billings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(billingData)
        });

        if (!response.ok) {
            throw new Error('Failed to add billing');
        }

        const newBilling = await response.json();
        console.log('New Billing Added:', newBilling);
        // Optionally handle success response here

        closeBillingModal();

    } catch (error) {
        console.error('Error adding billing:', error);
        // Optionally handle error here
    }
})
