document.addEventListener('DOMContentLoaded', () => {
    const buildings = [
        'Building 1',
        'Building 2',
        'Building 3',
        'Building 4',
        'Building 5',
        'Building 6',
        'Building 7',
        'Building 8',
        'Building 10',
        'Building 12'
    ];

    const container = document.getElementById('buildings-container');

    buildings.forEach((building, index) => {
        const a = document.createElement('a');
        a.href = `/api/building-leader/billings-cons/${index + 1}`;
        
        const button = document.createElement('button');
        button.innerHTML = `<i class="fa-regular fa-building"></i><p>${building}</p>`;
        
        a.appendChild(button);
        container.appendChild(a);
    });
});