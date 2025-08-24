const app = document.getElementById('app');

if (app) {
  // Create a heading
  const heading = document.createElement('h1');
  heading.textContent = 'Welcome to the MVP';

  // Create a button
  const button = document.createElement('button');
  button.textContent = 'Click Me';
  button.onclick = () => alert('Button clicked!');

  // Append elements to the app container
  app.appendChild(heading);
  app.appendChild(button);
}