document.addEventListener('DOMContentLoaded', () => {
    let currentIndex = 0;

    const fetchBillingData = (index) => {
        fetch(`/api/billings/admin/view-billings?index=${index}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }

                const billing = data.billing;

                const buildingHeader = document.getElementById('building-header');
                buildingHeader.innerText = `Summary of Territorial Account for Building ${billing.tenant_info.building_num}`;

                const billingPeriod = document.getElementById('billing-period');
                billingPeriod.innerText = `from ${formatDate(billing.billing_period_start)} to ${formatDate(billing.billing_period_end)}`;

                const buildingRepresentative = document.getElementById('building-representative');
                buildingRepresentative.innerText = `Building Representative: ${billing.building_leader.firstname} ${billing.building_leader.lastname}`;

                const tbody = document.querySelector('table tbody');
                tbody.innerHTML = '';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${billing.ref_no}</td>
                    <td>${billing.bill_no}</td>
                    <td>${billing.tenant_name}</td>
                    <td>${billing.consumption}</td>
                    <td>${billing.water_basic_charge}</td>
                    <td>${billing.water_sys_loss}</td>
                    <td>${billing.water_maintenance}</td>
                    <td>${billing.water_basic_charge}</td>
                    <td>${billing.monthly_fee}</td>
                    <td>${billing.stp}</td>
                    <td>${billing.prev_water}</td>
                    <td>${billing.prev_monthly_fee}</td>
                    <td>${billing.prev_stp}</td>
                    <td>${billing.other_charges}</td>
                    <td>${billing.total_due}</td>
                    <td>${billing.service_invoice}</td>
                    <td>${billing.remarks}</td>
                    <td>
                        <button class="edit-btn" data-id="${billing._id}">Edit</button>
                        <button class="delete-btn" data-id="${billing._id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);

                document.getElementById('prev-btn').disabled = !data.hasPrevious;
                document.getElementById('next-btn').disabled = !data.hasNext;

                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        openEditModal(billing.bill_no);
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        openDeleteModal(event.target.dataset.id); 
                    });
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            fetchBillingData(currentIndex);
        }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        currentIndex++;
        fetchBillingData(currentIndex);
    });

    fetchBillingData(currentIndex);

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Delete modal logic
    const deleteModal = document.getElementById('confirmDeleteModal');
    const deleteModalClose = document.getElementById('cancelDelete');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    let deleteId = null;

    window.openDeleteModal = (id) => {
        deleteId = id;
        deleteModal.style.display = 'block';
    };

    window.closeDeleteModal = () => {
        deleteModal.style.display = 'none';
        deleteId = null;
    };

    deleteModalClose.addEventListener('click', closeDeleteModal);

    confirmDeleteButton.addEventListener('click', () => {
        if (deleteId) {
            fetch(`/api/billings/${deleteId}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                if (data.success || response.ok) {
                    closeDeleteModal();
                    fetchBillingData(currentIndex);
                } else {
                    console.error('Error deleting billing:', data.error || 'Unknown error');
                }
            })
            .catch(error => {
                console.error('Error deleting billing:', error);
            })
            .finally(() => {
                closeDeleteModal();
                currentIndex--;
                fetchBillingData(currentIndex);
            });
        }
    });

    //edit modal
    const editModal = document.getElementById('editBillModal');
    const editModalClose = document.querySelector('.close');
    const confirmEdit = document.getElementById('confirmEdits');

    function openEditModal(billNo) {
        fetch(`/api/billings/num/${billNo}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }

                const billing = data.billing;
                document.getElementById('editRefNo').textContent = billing.ref_no;
                document.getElementById('editBillNo').textContent = billing.bill_no;
                document.getElementById('editAccountName').textContent = billing.tenant_name;
                document.getElementById('editConsumption').textContent = billing.consumption;
                document.getElementById('editBasicCharge').textContent = billing.water_basic_charge;
                document.getElementById('editSystemLossCharge').textContent = billing.water_sys_loss;
                document.getElementById('editWaterMaintenanceFund').textContent = billing.water_maintenance;
                document.getElementById('editCurrentChargesWater').textContent = billing.water_basic_charge;
                document.getElementById('editCurrentChargesMonthlyAssessmentFee').textContent = billing.monthly_fee;
                document.getElementById('editCurrentChargesSTP').textContent = billing.stp;
                document.getElementById('editPreviousUnpaidWater').textContent = billing.prev_water;
                document.getElementById('editPreviousUnpaidMonthlyAssessmentFee').textContent = billing.prev_monthly_fee;
                document.getElementById('editPreviousUnpaidSTP').textContent = billing.prev_stp;
                document.getElementById('editOtherCharges').textContent = billing.other_charges;
                document.getElementById('editTotalAmountDue').textContent = billing.total_due;
                document.getElementById('editServiceInvoice').textContent = billing.service_invoice;
                document.getElementById('editRemarks').textContent = billing.remarks;

                editModal.style.display = 'block';
            })
            .catch(error => console.error('Error fetching billing details:', error));
    }

    function closeModal() {
        editModal.style.display = 'none';
    }

    editModalClose.addEventListener('click', closeModal);


    confirmEdit.addEventListener('click', async () => {
        const updatedData = {
            tenant_name: document.getElementById('editAccountName').textContent,
            consumption: parseFloat(document.getElementById('editConsumption').textContent),
            meter_reading: {
                consumption: document.getElementById('editConsumption').textContent
            },
            water_basic_charge: parseFloat(document.getElementById('editBasicCharge').textContent),
            water_sys_loss: parseFloat(document.getElementById('editSystemLossCharge').textContent),
            water_maintenance: parseFloat(document.getElementById('editWaterMaintenanceFund').textContent),
            monthly_fee: parseFloat(document.getElementById('editCurrentChargesMonthlyAssessmentFee').textContent),
            stp: parseFloat(document.getElementById('editCurrentChargesSTP').textContent),
            prev_water: parseFloat(document.getElementById('editPreviousUnpaidWater').textContent),
            prev_monthly_fee: parseFloat(document.getElementById('editPreviousUnpaidMonthlyAssessmentFee').textContent),
            prev_stp: parseFloat(document.getElementById('editPreviousUnpaidSTP').textContent),
            other_charges: parseFloat(document.getElementById('editOtherCharges').textContent),
            total_due: parseFloat(document.getElementById('editTotalAmountDue').textContent),
            service_invoice: document.getElementById('editServiceInvoice').textContent,
            remarks: document.getElementById('editRemarks').textContent
        };

        const billNo = document.getElementById('editBillNo').textContent;

        try {
            const response = await fetch(`/api/billings/num/${billNo}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                fetchBillingData(currentIndex);
                editModal.style.display = 'none';
            } else {
                const data = await response.json();
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error updating billing:', error);
        }
    });

    window.onclick = (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    };
});




/* document.addEventListener('DOMContentLoaded', () => {
    let currentIndex = 0;

    const fetchBillingData = (index) => {
        fetch(`/api/billings/admin/view-billings?index=${index}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }

                const billing = data.billing;

                const buildingHeader = document.getElementById('building-header');
                buildingHeader.innerText = `Summary of Territorial Account for Building ${billing.tenant_info.building_num}`;

                const billingPeriod = document.getElementById('billing-period');
                billingPeriod.innerText = `from ${formatDate(billing.billing_period_start)} to ${formatDate(billing.billing_period_end)}`;

                const buildingRepresentative = document.getElementById('building-representative');
                buildingRepresentative.innerText = `Building Representative: ${billing.building_leader.firstname} ${billing.building_leader.lastname}`;

                const tbody = document.querySelector('table tbody');
                tbody.innerHTML = '';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${billing.ref_no}</td>
                    <td>${billing.bill_no}</td>
                    <td>${billing.tenant_name}</td>
                    <td>${billing.consumption}</td>
                    <td>${billing.water_basic_charge}</td>
                    <td>${billing.water_sys_loss}</td>
                    <td>${billing.water_maintenance}</td>
                    <td>${billing.water_basic_charge}</td>
                    <td>${billing.monthly_fee}</td>
                    <td>${billing.stp}</td>
                    <td>${billing.prev_water}</td>
                    <td>${billing.prev_monthly_fee}</td>
                    <td>${billing.prev_stp}</td>
                    <td>${billing.other_charges}</td>
                    <td>${billing.total_due}</td>
                    <td>${billing.service_invoice}</td>
                    <td>${billing.remarks}</td>
                    <td>
                        <button class="edit-btn" data-id="${billing._id}">Edit</button>
                        <button class="delete-btn" data-id="${billing._id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);

                document.getElementById('prev-btn').disabled = !data.hasPrevious;
                document.getElementById('next-btn').disabled = !data.hasNext;

                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        openEditModal(billing.ref_no);
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        openDeleteModal(billing._id); 
                    });
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            fetchBillingData(currentIndex);
        }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        currentIndex++;
        fetchBillingData(currentIndex);
    });

    fetchBillingData(currentIndex);

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    //delete modal
    const deleteModal = document.getElementById('confirmDeleteModal');
    const deleteModalClose = document.getElementById('cancelDelete');

    function openDeleteModal(billingId) {
        deleteModal.style.display = 'block';

        document.getElementById('confirmDelete').addEventListener('click', async () => {
            try {
                const response = await fetch(`/api/billings/${billingId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    fetchBillingData(currentIndex);
                    deleteModal.style.display = 'none';
                } else {
                    const data = await response.json();
                    console.error(data.error);
                }
            } catch (error) {
                console.error('Error deleting billing:', error);
            }
        });
    }

    deleteModalClose.addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });

    window.onclick = (event) => {
        if (event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    };

    //edit modal
    const editModal = document.getElementById('editBillModal');
    const editModalClose = document.getElementById('cancelEdits');
    const confirmEdit = document.getElementById('confirmEdits');

    function openEditModal(refNo) {
        fetch(`/api/billings/num/${refNo}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }

                const billing = data.billing;
                document.getElementById('editRefNo').textContent = billing.ref_no;
                document.getElementById('editAccountName').textContent = billing.tenant_name;
                document.getElementById('editConsumption').textContent = billing.meter_reading.consumption;
                document.getElementById('editBasicCharge').textContent = billing.water_basic_charge;
                document.getElementById('editSystemLossCharge').textContent = billing.water_sys_loss;
                document.getElementById('editWaterMaintenanceFund').textContent = billing.water_maintenance;
                document.getElementById('editCurrentChargesWater').textContent = billing.water_basic_charge;
                document.getElementById('editCurrentChargesMonthlyAssessmentFee').textContent = billing.monthly_fee;
                document.getElementById('editCurrentChargesSTP').textContent = billing.sewage_plan;
                document.getElementById('editPreviousUnpaidWater').textContent = billing.prev_water;
                document.getElementById('editPreviousUnpaidMonthlyAssessmentFee').textContent = billing.prev_monthly_fee;
                document.getElementById('editPreviousUnpaidSTP').textContent = billing.prev_stp;
                document.getElementById('editOtherCharges').textContent = billing.other_charges;
                document.getElementById('editTotalAmountDue').textContent = billing.total_due;
                document.getElementById('editRemarks').textContent = billing.bill_date;

                editModal.style.display = 'block';
            })
            .catch(error => console.error('Error fetching billing details:', error));
    }

    editModalClose.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    confirmEdit.addEventListener('click', async () => {
        const updatedData = {
            tenant_name: document.getElementById('editAccountName').textContent,
            meter_reading: {
                consumption: document.getElementById('editConsumption').textContent
            },
            water_basic_charge: parseFloat(document.getElementById('editBasicCharge').textContent),
            water_sys_loss: parseFloat(document.getElementById('editSystemLossCharge').textContent),
            water_maintenance: parseFloat(document.getElementById('editWaterMaintenanceFund').textContent),
            monthly_fee: parseFloat(document.getElementById('editCurrentChargesMonthlyAssessmentFee').textContent),
            sewage_plan: parseFloat(document.getElementById('editCurrentChargesSTP').textContent),
            prev_water: parseFloat(document.getElementById('editPreviousUnpaidWater').textContent),
            prev_monthly_fee: parseFloat(document.getElementById('editPreviousUnpaidMonthlyAssessmentFee').textContent),
            prev_stp: parseFloat(document.getElementById('editPreviousUnpaidSTP').textContent),
            other_charges: parseFloat(document.getElementById('editOtherCharges').textContent),
            total_due: parseFloat(document.getElementById('editTotalAmountDue').textContent),
            bill_date: document.getElementById('editRemarks').textContent
        };

        const refNo = document.getElementById('editRefNo').textContent;

        try {
            const response = await fetch(`/api/billings/num/${refNo}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                fetchBillingData(currentIndex);
                editModal.style.display = 'none';
            } else {
                const data = await response.json();
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error updating billing:', error);
        }
    });

    window.onclick = (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    };
});
 */