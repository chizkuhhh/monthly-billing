// document.addEventListener("DOMContentLoaded", function() {
//     document.getElementById('loginForm').addEventListener('submit', async function(event) {
//         event.preventDefault();
        
//         const username = document.getElementById('username').value;
//         const password = document.getElementById('password').value;
        
//         try {
//             const response = await fetch('/accountDetails', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ username, password })
//             });
//             if (!response.ok) {
//                 throw new Error('Failed to load account details');
//             }
//             const data = await response.json();
//             console.log(data);
//         } catch (error) {
//             document.querySelector('.feedback-text').textContent = 'An error occurred. Please try again.';
//         }
//     });
// });

// this is already handled in routes - cheska
