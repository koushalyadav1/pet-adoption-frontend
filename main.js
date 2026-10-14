
const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = '/style.css';
document.head.appendChild(stylesheet);

document.body.innerHTML = `
  <header class="navbar">
    <a class="brand" href="#home">Paw<span>fect</span></a>
    <nav>
      <a href="#home">Home</a>
      <a href="#pets">Available Pets</a>
      <a href="#about">About</a>
      <button id="loginBtn">Login</button>
    </nav>
  </header>

  <main>
    <section class="hero" id="home">
      <div class="hero-content">
        <p class="eyebrow">FIND YOUR NEW BEST FRIEND</p>
        <h1>Give a pet a home.<br>Get a friend for life.</h1>
        <p>Every pet deserves love, care, and a family.
           Find your perfect companion today.</p>
        <a class="primary-btn" href="#pets">Meet Our Pets</a>
      </div>
    </section>

    <section class="pets-section" id="pets">
      <p class="eyebrow">MAKE A DIFFERENCE</p>
      <h2>Meet Our Lovely Pets</h2>
      <p class="section-description">
        Your new best friend might be waiting right here.
      </p>
      <p id="loadingMessage">Loading available pets...</p>
      <div class="pet-grid" id="petGrid"></div>
    </section>

    <section class="about" id="about">
      <h2>Adopt Love, Change a Life</h2>
      <p>Give a deserving pet a safe and loving forever home.</p>
    </section>
  </main>

  <footer>
    <p>© 2026 Pawfect Pet Adoption Portal</p>
  </footer>
`;

const API_URL = 'http://localhost:8080/api/pets';
let currentUser = null;

const petGrid = document.querySelector('#petGrid');
const loadingMessage = document.querySelector('#loadingMessage');


function renderPets(pets) {
  petGrid.innerHTML = '';

  if (pets.length === 0) {
    loadingMessage.textContent = 'No pets are currently available.';
    return;
  }

  loadingMessage.textContent = '';

  pets.forEach(pet => {
    const card = document.createElement('article');
    card.className = 'pet-card';

    const image = document.createElement('img');
    image.src = pet.imageUrl
      ? new URL(pet.imageUrl, 'http://localhost:8080').href
      : '';
    image.alt = pet.name;

    image.onerror = () => {
      image.style.display = 'none';
    };

    const details = document.createElement('div');
    details.className = 'pet-details';

    const name = document.createElement('h3');
    name.textContent = pet.name;

    const info = document.createElement('p');
    info.textContent =
      `${pet.breed || 'Unknown breed'} · ${pet.age} year(s) old · ${pet.species}`;

    const description = document.createElement('p');
    description.textContent = pet.description || '';

    const status = document.createElement('p');
    status.textContent = `Status: ${pet.status}`;

    const adoptButton = document.createElement('button');
    adoptButton.className = 'adopt-btn';
    adoptButton.textContent = 'Adopt Me';
    adoptButton.disabled = pet.status !== 'Available';

    adoptButton.addEventListener('click', () => {
      showAdoptionForm(pet);
    });

    details.append(name, info, description, status, adoptButton);

   
    const isAdmin =
      currentUser &&
      String(currentUser.role || '').replace(/^ROLE_/, '') === 'ADMIN';

    const isOwner =
      currentUser &&
      pet.ownerId != null &&
      Number(pet.ownerId) === Number(currentUser.id);

    if (isAdmin || isOwner) {
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete Pet';
      deleteButton.className = 'delete-pet-btn';

      deleteButton.addEventListener('click', async () => {
        const confirmed = confirm(
          `Are you sure you want to delete ${pet.name}?`
        );

        if (!confirmed) return;

        deleteButton.disabled = true;

        try {
          const response = await fetch(`${API_URL}/${pet.id}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          const responseText = await response.text();
          let result = {};

          try {
            result = responseText ? JSON.parse(responseText) : {};
          } catch {
            result = { message: responseText };
          }

          if (!response.ok) {
            throw new Error(
              result.message || `Could not delete pet (HTTP ${response.status}).`
            );
          }

          alert(result.message || 'Pet deleted successfully.');
          await loadPets();
        } catch (error) {
          alert(error.message || 'Could not delete pet.');
          deleteButton.disabled = false;
        }
      });

      details.append(deleteButton);
    }


    card.append(image, details);
    petGrid.append(card);
  });
}


function showAdoptionForm(pet) {
  const existingModal = document.querySelector('#adoptionModal');

  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'adoptionModal';
  modal.className = 'adoption-modal';

  const panel = document.createElement('div');
  panel.className = 'adoption-form';

  const title = document.createElement('h2');
  title.textContent = `Adopt ${pet.name}`;

  const intro = document.createElement('p');
  intro.textContent = 'Enter your details to submit an adoption request.';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'close-modal';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Close form');
  closeButton.addEventListener('click', () => modal.remove());

  const form = document.createElement('form');

  function addField(labelText, name, type) {
    const label = document.createElement('label');
    label.textContent = labelText;
    label.htmlFor = `adopt-${name}`;

    const input = document.createElement(
      name === 'message' ? 'textarea' : 'input'
    );

    input.id = `adopt-${name}`;
    input.name = name;
    input.required = name !== 'message';

    if (name !== 'message') input.type = type;
    if (name === 'message') input.rows = 4;

    input.maxLength = name === 'message' ? 1000 : 254;

    form.append(label, input);
  }

  addField('Your name', 'applicantName', 'text');
  addField('Email address', 'applicantEmail', 'email');
  addField('Why would you like to adopt?', 'message', 'text');

  const feedback = document.createElement('p');
  feedback.setAttribute('role', 'status');

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary-btn';
  submit.textContent = 'Submit Adoption Request';

  form.append(feedback, submit);
  panel.append(closeButton, title, intro, form);
  modal.append(panel);
  document.body.append(modal);

  form.addEventListener('submit', async event => {
    event.preventDefault();

    submit.disabled = true;
    feedback.textContent = 'Submitting request...';

    try {
      const response = await fetch(
        'http://localhost:8080/api/adoption-requests',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pet: { id: pet.id },
            applicantName: form.elements.applicantName.value.trim(),
            applicantEmail: form.elements.applicantEmail.value.trim(),
            message: form.elements.message.value.trim()
          })
        }
      );

      const responseText = await response.text();

let result = {};
try {
  result = responseText ? JSON.parse(responseText) : {};
} catch {
  result = { message: responseText };
}

if (!response.ok) {
  console.error('Adoption API error:', response.status, result);
  throw new Error(
    `HTTP ${response.status}: ${
      result.message || responseText || 'Request failed'
    }`
  );
}

      feedback.textContent =
        `Request submitted successfully! Request ID: ${result.requestId}. Status: ${result.status}.`;

      submit.textContent = 'Submitted';
      modal.remove();
    } catch (error) {
      feedback.textContent =
        error.message || 'Could not connect to the Java backend.';
      submit.disabled = false;
    }
  });
}



async function loadPets() {
  try {
    const response = await fetch(API_URL, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const pets = await response.json();
    renderPets(pets);
    console.log('Pets loaded from Java backend:', pets);
  } catch (error) {
    console.error('Could not load pets:', error);
    loadingMessage.textContent =
      'Unable to load pets. Make sure the Java backend is running.';
  }
}


async function loadCurrentUser() {
  try {
    const response = await fetch(
      'http://localhost:8080/api/auth/me',
      { credentials: 'include' }
    );

    if (!response.ok) {
      currentUser = null;
      return;
    }

    currentUser = await response.json();
  } catch (error) {
    console.error('Could not check login session:', error);
    currentUser = null;
  }
}



document.querySelector('#loginBtn').addEventListener('click', () => {
    const oldPanel = document.querySelector('#authPanel');

    if (oldPanel) {
        oldPanel.remove();
        return;
    }

    const panel = document.createElement('section');
    panel.id = 'authPanel';
    panel.style.maxWidth = '400px';
    panel.style.margin = '24px auto';
    panel.style.padding = '24px';
    panel.style.border = '1px solid #ddd';
    panel.style.borderRadius = '12px';
    panel.style.background = '#fff';

    let isRegister = false;

    const title = document.createElement('h2');
    const message = document.createElement('p');
    const form = document.createElement('form');
    const nameInput = document.createElement('input');
    const emailInput = document.createElement('input');
    const passwordInput = document.createElement('input');
    const submitButton = document.createElement('button');
    const switchButton = document.createElement('button');
    const closeButton = document.createElement('button');

    nameInput.placeholder = 'Full name';
    nameInput.autocomplete = 'name';
    nameInput.required = true;

    emailInput.type = 'email';
    emailInput.placeholder = 'Email address';
    emailInput.autocomplete = 'email';
    emailInput.required = true;

    passwordInput.type = 'password';
    passwordInput.placeholder = 'Password (minimum 8 characters)';
    passwordInput.minLength = 8;
    passwordInput.required = true;

    submitButton.type = 'submit';
    switchButton.type = 'button';
    closeButton.type = 'button';
    closeButton.textContent = 'Close';

    [nameInput, emailInput, passwordInput].forEach(input => {
        input.style.display = 'block';
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        input.style.marginBottom = '12px';
        input.style.padding = '12px';
    });

    function renderForm() {
        title.textContent = isRegister ? 'Create Account' : 'Login';
        submitButton.textContent = isRegister ? 'Register' : 'Login';
        switchButton.textContent = isRegister
            ? 'Already registered? Login'
            : 'Create an account';
        nameInput.hidden = !isRegister;
        nameInput.required = isRegister;
        passwordInput.autocomplete = isRegister
            ? 'new-password'
            : 'current-password';
        message.textContent = '';
    }

    message.setAttribute('role', 'status');

    form.append(nameInput, emailInput, passwordInput, submitButton);
    panel.append(title, message, form, switchButton, closeButton);
    (document.querySelector('main') || document.body).prepend(panel);

    switchButton.addEventListener('click', () => {
        isRegister = !isRegister;
        renderForm();
    });

    closeButton.addEventListener('click', () => panel.remove());

    form.addEventListener('submit', async event => {
        event.preventDefault();
        submitButton.disabled = true;
        message.textContent = 'Please wait...';

        const payload = {
            email: emailInput.value.trim(),
            password: passwordInput.value
        };

        if (isRegister) {
            payload.name = nameInput.value.trim();
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/auth/${isRegister ? 'register' : 'login'}`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Request failed.');
            }

            if (isRegister) {
                isRegister = false;
                passwordInput.value = '';
                renderForm();
                message.textContent =
                    'Registration successful. Please log in.';
            
} else {
  panel.remove();

  await loadCurrentUser();
  await loadPets();

  const loginButton = document.querySelector('#loginBtn');
  if (loginButton) loginButton.textContent = 'Logged In';

  window.dispatchEvent(new Event('userLoggedIn'));
  alert('Login successful!');
}

        } catch (error) {
            message.textContent = error.message ||
                'Could not connect to the backend.';
        } finally {
            submitButton.disabled = false;
        }
    });

    renderForm();
});



(async function initializeApp() {
  await loadCurrentUser();
  await loadPets();
})();


// Temporary local testing shortcut
window.showAdminDashboard = showAdminDashboard;


/* ================= ADMIN DASHBOARD ================= */

async function showAdminDashboard() {
    const app = document.querySelector("main") || document.body;

    app.innerHTML = `
        <section class="admin-dashboard">
            <div class="admin-header">
                <div>
                    <h1>🐾 Admin Dashboard</h1>
                    <p>Manage pet adoption requests</p>
                </div>
                <button id="admin-refresh">Refresh Requests</button>
            </div>

            <div class="admin-stats">
                <div class="admin-stat">
                    <span>Total Requests</span>
                    <strong id="admin-total">0</strong>
                </div>
                <div class="admin-stat">
                    <span>Pending</span>
                    <strong id="admin-pending">0</strong>
                </div>
                <div class="admin-stat">
                    <span>Approved</span>
                    <strong id="admin-approved">0</strong>
                </div>
                <div class="admin-stat">
                    <span>Rejected</span>
                    <strong id="admin-rejected">0</strong>
                </div>
            </div>

            <div id="admin-message" role="status"></div>
            <div id="admin-requests" class="admin-requests">
                Loading requests...
            </div>
        </section>
    `;

    document.getElementById("admin-refresh")
        .addEventListener("click", loadAdminRequests);

    await loadAdminRequests();
}

async function loadAdminRequests() {
    const container = document.getElementById("admin-requests");
    const message = document.getElementById("admin-message");

    if (!container) return;

    container.textContent = "Loading requests...";
    message.textContent = "";

    try {
        const response = await fetch(
            "http://localhost:8080/api/admin/requests"
        );

        if (!response.ok) {
            throw new Error("Unable to load adoption requests.");
        }

        const requests = await response.json();

        document.getElementById("admin-total").textContent =
            requests.length;

        document.getElementById("admin-pending").textContent =
            requests.filter(r => r.status === "Pending").length;

        document.getElementById("admin-approved").textContent =
            requests.filter(r => r.status === "Approved").length;

        document.getElementById("admin-rejected").textContent =
            requests.filter(r => r.status === "Rejected").length;

        container.replaceChildren();

        if (requests.length === 0) {
            container.textContent = "No adoption requests yet.";
            return;
        }

        requests.forEach(request => {
            const card = document.createElement("article");
            card.className = "admin-request-card";

            const title = document.createElement("h3");
            title.textContent =
                `${request.applicantName} — ${request.pet?.name || "Pet"}`;

            const details = document.createElement("p");
            details.textContent = `Email: ${request.applicantEmail}`;

            const date = document.createElement("p");
            date.textContent =
                `Requested: ${new Date(request.requestedAt).toLocaleString()}`;

            const note = document.createElement("p");
            note.textContent = `Message: ${request.message || "No message"}`;

            const status = document.createElement("p");
            status.className = "admin-status";
            status.textContent = `Status: ${request.status}`;

            card.append(title, details, date, note, status);

            if (request.status === "Pending") {
                const actions = document.createElement("div");
                actions.className = "admin-actions";

                const approve = document.createElement("button");
                approve.textContent = "Approve";
                approve.className = "admin-approve";
                approve.addEventListener("click", () =>
                    updateAdoptionStatus(request.id, "Approved")
                );

                const reject = document.createElement("button");
                reject.textContent = "Reject";
                reject.className = "admin-reject";
                reject.addEventListener("click", () =>
                    updateAdoptionStatus(request.id, "Rejected")
                );

                actions.append(approve, reject);
                card.append(actions);
            }

            container.append(card);
        });
    } catch (error) {
        container.textContent = error.message;
    }
}

async function updateAdoptionStatus(id, status) {
    const confirmed = window.confirm(
        `Are you sure you want to ${status.toLowerCase()} request #${id}?`
    );

    if (!confirmed) return;

    const message = document.getElementById("admin-message");

    try {
        const response = await fetch(
            `http://localhost:8080/api/admin/requests/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not update request.");
        }

        message.textContent = `Request #${id} updated to ${status}.`;
        await loadAdminRequests();
    } catch (error) {
        message.textContent = error.message;
    }
}


/* ========== UPLOAD A PET ========== */

function showUploadPetForm() {
    const oldForm = document.getElementById("upload-pet-section");
    if (oldForm) {
        oldForm.scrollIntoView({ behavior: "smooth" });
        return;
    }

    const section = document.createElement("section");
    section.id = "upload-pet-section";
    section.className = "upload-pet-section";

    const heading = document.createElement("h2");
    heading.textContent = "Upload a Pet";

    const intro = document.createElement("p");
    intro.textContent =
        "Share a pet who needs a loving home.";

    const form = document.createElement("form");
    form.id = "upload-pet-form";
    form.enctype = "multipart/form-data";

    form.innerHTML = `
        <label for="upload-name">Pet name</label>
        <input id="upload-name" name="name" required maxlength="100">

        <label for="upload-species">Animal type</label>
        <select id="upload-species" name="species" required>
            <option value="">Choose animal type</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Bird">Bird</option>
            <option value="Other">Other</option>
        </select>

        <label for="upload-breed">Breed</label>
        <input id="upload-breed" name="breed" maxlength="100">

        <label for="upload-age">Age in years</label>
        <input id="upload-age" name="age" type="number"
               min="0" max="100" value="0" required>

        <label for="upload-description">Description</label>
        <textarea id="upload-description" name="description"
                  maxlength="1000" rows="4"></textarea>

        <label for="upload-photo">Pet photo (JPG, PNG or WEBP, max 5 MB)</label>
        <input id="upload-photo" name="photo" type="file"
               accept="image/jpeg,image/png,image/webp" required>

        <img id="upload-photo-preview" alt="Pet photo preview"
             hidden style="max-width:220px;max-height:220px;object-fit:cover">

        <button type="submit">Publish Pet</button>
        <p id="upload-pet-message" role="status"></p>
    `;

    section.append(heading, intro, form);

    const main = document.querySelector("main") || document.body;
    main.appendChild(section);

    const photoInput = form.querySelector("#upload-photo");
    const preview = form.querySelector("#upload-photo-preview");

    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];

        if (!file) {
            preview.hidden = true;
            preview.removeAttribute("src");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            photoInput.value = "";
            preview.hidden = true;
            document.getElementById("upload-pet-message").textContent =
                "Please select a photo smaller than 5 MB.";
            return;
        }

        preview.src = URL.createObjectURL(file);
        preview.hidden = false;
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const message = document.getElementById("upload-pet-message");
        const file = photoInput.files[0];

        if (!file) {
            message.textContent = "Please choose a pet photo.";
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            message.textContent = "Please choose a JPG, PNG or WEBP photo.";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            message.textContent = "Photo must be 5 MB or smaller.";
            return;
        }

        const data = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        message.textContent = "Uploading pet...";

        try {
            
const response = await fetch("http://localhost:8080/api/pets", {
  method: "POST",
  body: data,
  credentials: "include"
});


            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Upload failed.");
            }

            message.textContent =
                `Success! ${result.name} has been published.`;

            form.reset();
            preview.hidden = true;
            preview.removeAttribute("src");

            if (typeof loadPets === "function") {
                await loadPets();
            }
        } catch (error) {
            message.textContent = error.message;
        } finally {
            submitButton.disabled = false;
        }
    });

    section.scrollIntoView({ behavior: "smooth" });
}

window.showUploadPetForm = showUploadPetForm;


/* Home page upload button */

function addHomeUploadButton() {
    if (document.getElementById("home-upload-pet-button")) {
        return;
    }

    const button = document.createElement("button");
    button.id = "home-upload-pet-button";
    button.textContent = "+ Upload a Pet";
    button.type = "button";

    button.addEventListener("click", () => {
        showUploadPetForm();
    });

    const header = document.querySelector("header");
    const main = document.querySelector("main");

    if (header) {
        header.appendChild(button);
    } else if (main) {
        main.prepend(button);
    } else {
        document.body.prepend(button);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addHomeUploadButton);
} else {
    addHomeUploadButton();
}
