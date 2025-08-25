// For a GET request
fetch('http://localhost:8080/api/users')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json(); // or response.text() if not JSON
  })
  .then(data => {
    console.log('Response data:', data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
