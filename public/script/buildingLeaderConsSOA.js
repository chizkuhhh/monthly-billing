// for tabs
const consView = document.querySelector('.cons');
const soaView = document.querySelector('.soa');

const consButton = document.getElementById('cons-button');
const soaButton = document.getElementById('soa-button');

consView.style.display = 'block';
consButton.classList.add('active');

soaView.style.display = 'none';

// consButton show consView and hide soaView
consButton.addEventListener("click", () => {
    document.querySelector('.soa').style.display = 'none';
    document.querySelector('.cons').style.display = 'block';

    if (!consButton.classList.contains('active')) {
        consButton.classList.add('active');
    }

    if (soaButton.classList.contains('active')) {
        soaButton.classList.remove('active');
    }
})

// soaButton hide consView and show soaView
soaButton.addEventListener("click", () => {
    document.querySelector('.soa').style.display = 'block';
    document.querySelector('.cons').style.display = 'none';

    if (consButton.classList.contains('active')) {
        consButton.classList.remove('active');
    }

    if (!soaButton.classList.contains('active')) {
        soaButton.classList.add('active');
    }
})

// searching and filtering using datatables plugin
$(document).ready(function() {
    // for cons table, what if i start pagination, will the grand totals be affected??
    // determine which table is showing rn
    const buildingNum = window.thisBldg;

    // datatables config for user table
    function confirmConsInputs() {
        var motherMeter1 = $('#mother-meter1').val();
        $('#mother-meter1').closest('td').html(motherMeter1);

        var motherMeter2 = $('#mother-meter2').val();
        $('#mother-meter2').closest('td').html(motherMeter2);

        var motherMeter3 = $('#mother-meter3').val();
        $('#mother-meter3').closest('td').html(motherMeter3);

        var motherMeter4 = $('#mother-meter4').val();
        $('#mother-meter4').closest('td').html(motherMeter4);

        var motherConsumption = motherMeter2 - motherMeter4;
        $('#mother-consumption').html(motherConsumption);

        var motherExcess= $('#mother-excess').val();
        $('#mother-excess').closest('td').html(motherExcess);

        var reconFee = $('#recon-fee').val();
        $('#recon-fee').closest('td').html(reconFee);

        var prepCons = $('#prepared-by-cons').val();
        $('#prepared-by-cons').closest('td').html(prepCons);
    }
    var consTable = $('#cons-table').DataTable({
        layout: {
            topStart: {
                buttons: [
                    { 
                        extend: 'excel', 
                        text: 'Export to Excel', 
                        title: `Cons-Bldg${buildingNum}`,
                        action: function (e, dt, node, config, cb) {
                            confirmConsInputs(); 
                            DataTable.ext.buttons.excelHtml5.action.call(
                                this,
                                e,
                                dt,
                                node,
                                config,
                                cb
                            );

                            if (confirm('Do you want to reload this page to input new values?')) {
                                location.reload();
                            }
                        }
                    }
                ]
            }
        },

        lengthMenu: [5, 10, 25, 50],
        pageLength: 5,
        ordering: false,
        autoWidth: false,
        scrollX: true,
        initComplete: function () {
            var column = this.api().column(2); // Change to the correct column index
            var select = $('<select><option value=""></option></select>')
                .on('change', function () {
                    var val = $.fn.dataTable.util.escapeRegex(
                        $(this).val()
                    );

                    column
                        .search(val ? '^' + val + '$' : '', true, false)
                        .draw();
                });

            column.data().unique().each(function (d, j) {
                select.append('<option value="' + d + '">' + d + '</option>')
            });

            // Preselect the first option
            select.find('option:eq(1)').prop('selected', true).trigger('change');

            // Append the dropdown to the left class div
            $('.cons .header .left').append(select);
        },
        footerCallback: function(row, data, start, end, display) {
            var api = this.api(), data;

            // Helper function to calculate column sum
            var intVal = function(i) {
                return typeof i === 'string' ?
                    i.replace(/[\₱,]/g, '') * 1 :
                    typeof i === 'number' ?
                        i : 0;
            };

            // Calculate total for each column
            var columns = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 27];
            columns.forEach(function(column) {
                var total = api
                    .column(column, {search: 'applied'})
                    .data()
                    .reduce(function(a, b) {
                        return intVal(a) + intVal(b);
                    }, 0);

                $(api.column(column).footer()).html(total);
            });
        }
    });
    
    function getPrepared() {
        var preparedByVal = $('#prepared-by').val();
        return preparedByVal;
    }

    var buttonCommon = {
        exportOptions: {
            format: {
                body: function (data, row, column, node) {
                    // Check if the data is an input element
                    var input = $('input', node);
                    return input.length ? input.val() : data;
                }
            }
        }
    };

    $('#soa-table').DataTable({
        layout: {
            topStart: {
                buttons: [
                    $.extend(true, {}, buttonCommon, {
                        extend: 'excelHtml5',
                        text: 'Export to Excel',
                        title: `SOA-Bldg${buildingNum}`,
                        customize: function (xlsx) {
                            // Find the row that contains the "Prepared By" input and update its value
                            var preparedByVal = getPrepared(); // Assuming you have a function to retrieve the prepared-by value
                            var sheet = xlsx.xl.worksheets['sheet1.xml'];
                            var lastRow = $('row:last', sheet);

                            // Prepare the new cell content for column M
                            var cellContent = `
                                <c r="N${lastRow.attr('r')}" t="inlineStr">
                                    <is><t>${preparedByVal}</t></is>
                                </c>
                            `;

                            // Append the new cell to the last row in column M
                            lastRow.append(cellContent);
                        }
                    })
                ]
            }
        },
        lengthMenu: [5, 10, 25, 50],
        pageLength: 5,
        ordering: false,
        autoWidth: false,
        initComplete: function () {
            var column = this.api().column(2); // Change to the correct column index
            var select = $('<select><option value=""></option></select>')
                .on('change', function () {
                    var val = $.fn.dataTable.util.escapeRegex(
                        $(this).val()
                    );

                    column
                        .search(val ? '^' + val + '$' : '', true, false)
                        .draw();
                });

            column.data().unique().each(function (d, j) {
                select.append('<option value="' + d + '">' + d + '</option>')
            });

            // Preselect the first option
            select.find('option:eq(1)').prop('selected', true).trigger('change');

            // Append the dropdown to the left class div
            $('.soa .header .left').append(select);
        },
        footerCallback: function(row, data, start, end, display) {
            var api = this.api(), data;

            // Helper function to calculate column sum
            var intVal = function(i) {
                return typeof i === 'string' ?
                    i.replace(/[\₱,]/g, '') * 1 :
                    typeof i === 'number' ?
                        i : 0;
            };

            // Calculate total for each column
            var columns = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            columns.forEach(function(column) {
                var total = api
                    .column(column, {page: 'current'})
                    .data()
                    .reduce(function(a, b) {
                        return intVal(a) + intVal(b);
                    }, 0);

                $(api.column(column).footer()).html(total);
            });
        }
    });
});

// JavaScript for showing and closing the edit billing modal
// hide modal first
document.getElementById('editBillingModal').style.display = 'none';

// Function to show the edit billing modal
function showEditBillingModal() {
    var modal = document.getElementById('editBillingModal');
    modal.style.display = 'block';
}

// Function to close the edit billing modal
function closeEditBillingModal() {
    var modal = document.getElementById('editBillingModal');
    modal.style.display = 'none';
}

// Event listener to close the modal if the user clicks outside of it
window.onclick = function(event) {
    var modal = document.getElementById('editBillingModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Function to call when clicking the edit button to open the modal (example of usage)
document.addEventListener('DOMContentLoaded', function() {
    // Function to format date as YYYY-MM-DD for input[type="date"]
    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    var editButtons = document.getElementsByClassName('edit-button');
    Array.from(editButtons).forEach(function(button) {
        button.addEventListener('click', async function() {
            // get the bill data to edit first
            const billId = button.getAttribute("data-id");
            try {
                const response = await fetch(`/api/billings/get-bill/${billId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Bill not found");
                    } else {
                        throw new Error("Failed to fetch bill data");
                    }
                }

                const billData = await response.json();

                console.log(billData);


                document.getElementById('billId').value = billId;

                document.getElementById('serviceInvoiceEdit').value = billData.service_invoice;
                document.getElementById('billingPeriodStartEdit').value = formatDate(billData.billing_period_start);
                document.getElementById('billingPeriodEndEdit').value = formatDate(billData.billing_period_end);
                document.getElementById('dueDateEdit').value = formatDate(billData.due_date);
                document.getElementById('prevReadingEdit').value = billData.prev_reading;
                document.getElementById('presentReadingEdit').value = billData.pres_reading;
                document.getElementById('cu-mEdit').value = billData.consumption;
                document.getElementById('basic-chargeEdit').value = billData.water_basic_charge;
                document.getElementById('system-loss-chargeEdit').value = billData.water_sys_loss;
                document.getElementById('water-maintenance-fundEdit').value = billData.water_maintenance;
                document.getElementById('waterEdit').value = billData.water_total;
                document.getElementById('monthly-duesEdit').value = billData.monthly_fee;
                document.getElementById('stpEdit').value = billData.stp;
                document.getElementById('prev-unpaid-waterEdit').value = billData.prev_water;
                document.getElementById('prev-unpaid-monthlyEdit').value = billData.prev_monthly_fee;
                document.getElementById('prev-unpaid-stpEdit').value = billData.prev_stp;
                document.getElementById('other-chargesEdit').value = billData.other_charges;
                document.getElementById('paymentEdit').value = billData.payment_date;
                document.getElementById('amountEdit').value = billData.payment_amount;
                document.getElementById('totalDueEdit').value = billData.total_due;

                showEditBillingModal();
            } catch (error) {
                console.error("Error fetching bill data:", error.message);
            }
        });
    });
});

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

function calculateEditCharge() {
    // Retrieve input values from the edit form
    const prevReadingEdit = parseFloat(document.getElementById('prevReadingEdit').value);
    const presentReadingEdit = parseFloat(document.getElementById('presentReadingEdit').value);
    const systemLossChargeEdit = parseFloat(document.getElementById('system-loss-chargeEdit').value);
    const waterMaintenanceFundEdit = parseFloat(document.getElementById('water-maintenance-fundEdit').value);
    const monthlyDuesEdit = parseFloat(document.getElementById('monthly-duesEdit').value);
    const stpEdit = parseFloat(document.getElementById('stpEdit').value);
    const prevUnpaidWaterEdit = parseFloat(document.getElementById('prev-unpaid-waterEdit').value);
    const prevUnpaidMonthlyEdit = parseFloat(document.getElementById('prev-unpaid-monthlyEdit').value);
    const prevUnpaidStpEdit = parseFloat(document.getElementById('prev-unpaid-stpEdit').value);
    const otherChargesEdit = parseFloat(document.getElementById('other-chargesEdit').value);

    // Calculate total consumption for the edit form
    const consumptionEdit = presentReadingEdit - prevReadingEdit;

    let remainingConsumption = consumptionEdit;
    let totalChargeEdit = 0;

    // Calculate the charge based on the tiered structure (if applicable)
    for (let i = 0; i < rates.length; i++) {
        if (remainingConsumption <= 0) break;
        const tier = rates[i];
        const units = Math.min(remainingConsumption, tier.limit);
        totalChargeEdit += units * tier.rate;
        remainingConsumption -= units;
    }

    // Calculate water current charge for the edit form
    let waterCurrentEdit = totalChargeEdit + systemLossChargeEdit + waterMaintenanceFundEdit;

    // Calculate total due for the edit form
    let totalDueEdit = waterCurrentEdit + monthlyDuesEdit + stpEdit + prevUnpaidWaterEdit + prevUnpaidMonthlyEdit + prevUnpaidStpEdit + otherChargesEdit;

    // Update relevant fields in the edit form with calculated values
    document.getElementById('cu-mEdit').value = consumptionEdit.toFixed(2);
    document.getElementById('basic-chargeEdit').value = totalChargeEdit.toFixed(2);
    document.getElementById('waterEdit').value = waterCurrentEdit.toFixed(2);
    document.getElementById('editResult').innerText = `Total Due: Php ${totalDueEdit.toFixed(2)}`;
    document.getElementById('totalDueEdit').value = totalDueEdit.toFixed(2);
}

document.getElementById("editBillingForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Gather form data
    const service_invoice = document.getElementById("serviceInvoiceEdit").value;
    const billing_period_start = document.getElementById("billingPeriodStartEdit").value;
    const billing_period_end = document.getElementById("billingPeriodEndEdit").value;
    const due_date = document.getElementById("dueDateEdit").value;
    const prev_reading = parseFloat(document.getElementById("prevReadingEdit").value);
    const pres_reading = parseFloat(document.getElementById("presentReadingEdit").value);
    const water_sys_loss = parseFloat(document.getElementById("system-loss-chargeEdit").value);
    const water_maintenance = parseFloat(document.getElementById("water-maintenance-fundEdit").value);
    const monthly_fee = parseFloat(document.getElementById("monthly-duesEdit").value);
    const stp = parseFloat(document.getElementById("stpEdit").value);
    const prev_water = parseFloat(document.getElementById("prev-unpaid-waterEdit").value);
    const prev_monthly_fee = parseFloat(document.getElementById("prev-unpaid-monthlyEdit").value);
    const prev_stp = parseFloat(document.getElementById("prev-unpaid-stpEdit").value);
    const other_charges = parseFloat(document.getElementById("other-chargesEdit").value);
    const payment_date = document.getElementById('paymentEdit').value
    const payment_amount = document.getElementById('amountEdit').value
    const total_due = parseFloat(document.getElementById("totalDueEdit").value);

    // Get billId from hidden field
    const billId = document.getElementById("billId").value;

    // Construct request data
    const requestData = {
        service_invoice,
        billing_period_start,
        billing_period_end,
        due_date,
        prev_reading,
        pres_reading,
        water_sys_loss,
        water_maintenance,
        monthly_fee,
        stp,
        prev_water,
        prev_monthly_fee,
        prev_stp,
        other_charges,
        payment_date,
        payment_amount,
        total_due
    };

    try {
        const response = await fetch(`/api/billings/edit-bill/${billId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            throw new Error("Failed to update billing");
        }

        const updatedBilling = await response.json();
        console.log("Billing updated:", updatedBilling);

        // Close modal or show success message
        const editBillingModal = document.getElementById("editBillingModal");
        editBillingModal.style.display = "none";

        showSuccessModal(`Successfully updated billing for service invoice: ${updatedBilling.service_invoice}`);
    } catch (error) {
        console.error("Error updating billing:", error.message);
    }
});

const deleteButtons = document.querySelectorAll(".delete-button");
deleteButtons.forEach(button => {
  button.addEventListener("click", async function () {
      const billId = button.getAttribute("data-id");

      console.log(billId);

      // confirmation
      if (confirm("Are you sure you want to delete this bill?")) {
          try {
              const response = await fetch(`/api/billings/${billId}`, {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json"
                }
              });

              if (!response.ok) {
                  throw new Error("Failed to delete bill");
              }

              const result = await response.json();
              console.log(result.message);

            showSuccessModal(`Successfully deleted bill: ${billId}`);
          } catch (error) {
              console.error("Error deleting bill:", error.message);
          }
      }
  });
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

