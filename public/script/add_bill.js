// add bill functions - cheska
let billingUserId = '';
let meterNum = '';
let prevReading = 0;

// Function to close the billing modal
function closeBillingModal() {
    const modal = document.getElementById('billingModal');
    modal.style.display = 'none';

    // Reset the form inside the modal
    const form = document.getElementById('billingForm');
    if (form) {
        form.reset();
    }
}

document.querySelectorAll(".billing-button").forEach(button => {
    button.addEventListener("click", async function () {
        billingUserId = button.getAttribute("data-id");

        // get previous meter reading as well if there's a previous bill

        try {
            const prevBill = await fetch(`/api/billings/prev-bill/${billingUserId}`);
            
            if (prevBill.ok) {
                const prevBillData = await prevBill.json();
                prevReading = prevBillData.previousBilling.pres_reading;
                console.log(prevBillData);
            } else {
                console.log("No previous billing data found, proceeding with default prevReading");
            }

            document.getElementById('prevReading').value = prevReading;

            const response = await fetch(`/api/tenants/${billingUserId}?format=json`);
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const userData = await response.json();
            
            meterNum = userData.meter_num;

            const modal = document.getElementById('billingModal');
            modal.style.display = 'block';
        } catch (error) {
            console.error("Error fetching billing data:", error.message);
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

document.getElementById('billingForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    try {
        // Generate the next bill number
        const billNo = await generateBillNo();
        console.log(billingUserId);
        console.log(meterNum);

        // Read form input values
        let serviceInvoiceNo = document.getElementById('serviceInvoiceNo').value;
        let billingPeriodStart = document.getElementById('billingPeriodStart').value;
        let dueDate = document.getElementById('dueDate').value;
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
        let otherCharges = Number(document.getElementById('other-charges').value);
        let remarks = document.getElementById('remarks').value;
        let totalDue = Number(document.getElementById('totalDue').value); // Read totalDue from hidden field

        // Prepare data to send to server
        const billingData = {
            tenant_id: billingUserId, // Assuming billingUserId is set elsewhere
            meter_num: meterNum, // Replace with actual meter number if applicable
            bill_no: billNo,
            billing_period_start: new Date(billingPeriodStart),
            billing_period_end: new Date(billingPeriodEnd),
            due_date: new Date(dueDate),
            prev_reading: prevReading,
            pres_reading: presentReading,
            consumption: consumption,
            water_basic_charge: basicCharge,
            water_sys_loss: systemLossCharge,
            water_maintenance: waterMaintenanceFund,
            water_total: water,
            monthly_fee: monthlyDues,
            stp: stp,
            prev_water: 0,
            prev_monthly_fee: 0,
            prev_stp: 0,
            total_due: totalDue, // Calculate total_due based on your business logic
            other_charges: otherCharges,
            service_invoice: serviceInvoiceNo,
            payment_date: null, // Payment date initially null
            payment_amount: 0, // Payment amount initially 0
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
        console.log('New Billing Added:', newBilling.newBilling);
        // Optionally handle success response here
        
        closeBillingModal();

        showSuccessModal(`Billing successfully generated for user: ${newBilling.tenant.firstname} ${newBilling.tenant.lastname}`);

    } catch (error) {
        console.error('Error adding billing:', error);
        // Optionally handle error here
    }
})

// success modal/pop-up
function showSuccessModal(message) {
    document.getElementById('successMessage').innerText = message;
    document.getElementById('successModal').style.display = 'block';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    location.reload();
}