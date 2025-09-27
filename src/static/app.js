document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("sign      const response = await fetch('/st      const response = await fetch('/students/' + encodeURIComponent(email), {dents/' + encodeURIComponent(email), {p-form");
  const messageDiv = document.getElementById("message");
  const studentForm = document.getElementById("student-form");
  const studentMessageDiv = document.getElementById("student-message");
  const studentsTable = document.getElementById("students-table");
  const updateStudentButton = document.getElementById("update-student");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Student management functions
  async function fetchStudents() {
    try {
      const response = await fetch("/students/");
      const students = await response.json();

      studentsTable.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Grade</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(student => `
              <tr>
                <td>${student.full_name}</td>
                <td>${student.email}</td>
                <td>${student.grade}</td>
                <td class="student-actions">
                  <button class="edit-student" data-email="${student.email}">Edit</button>
                  <button class="delete-student" data-email="${student.email}">Delete</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;

      // Add event listeners to student action buttons
      document.querySelectorAll(".edit-student").forEach(button => {
        button.addEventListener("click", () => editStudent(button.dataset.email));
      });

      document.querySelectorAll(".delete-student").forEach(button => {
        button.addEventListener("click", () => deleteStudent(button.dataset.email));
      });
    } catch (error) {
      studentsTable.innerHTML = "<p>Failed to load students. Please try again later.</p>";
      console.error("Error fetching students:", error);
    }
  }

  async function editStudent(email) {
    try {
      const response = await fetch("/students/" + encodeURIComponent(email));
      const student = await response.json();

      // Populate form with student data
      document.getElementById("student-email").value = student.email;
      document.getElementById("student-name").value = student.full_name;
      document.getElementById("student-grade").value = student.grade;
      document.getElementById("student-phone").value = student.contact_phone || "";
      document.getElementById("guardian-email").value = student.guardian_email || "";
      document.getElementById("health-notes").value = student.health_notes || "";

      // Show update button and hide submit button
      studentForm.querySelector("button[type='submit']").style.display = "none";
      updateStudentButton.style.display = "block";
      
      // Disable email field during edit
      document.getElementById("student-email").disabled = true;
    } catch (error) {
      showStudentMessage("Failed to load student details", "error");
    }
  }

  async function deleteStudent(email) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(\`/students/\${encodeURIComponent(email)}\`, {
        method: "DELETE"
      });

      if (response.ok) {
        showStudentMessage("Student deleted successfully", "success");
        fetchStudents();
      } else {
        const error = await response.json();
        showStudentMessage(error.detail || "Failed to delete student", "error");
      }
    } catch (error) {
      showStudentMessage("Failed to delete student", "error");
    }
  }

  function showStudentMessage(message, type) {
    studentMessageDiv.textContent = message;
    studentMessageDiv.className = type;
    studentMessageDiv.classList.remove("hidden");
    setTimeout(() => {
      studentMessageDiv.classList.add("hidden");
    }, 5000);
  }

  // Handle student form submission
  studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const studentData = {
      email: document.getElementById("student-email").value,
      full_name: document.getElementById("student-name").value,
      grade: parseInt(document.getElementById("student-grade").value),
      contact_phone: document.getElementById("student-phone").value,
      guardian_email: document.getElementById("guardian-email").value,
      health_notes: document.getElementById("health-notes").value
    };

    try {
      const response = await fetch("/students/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(studentData)
      });

      const result = await response.json();

      if (response.ok) {
        showStudentMessage("Student added successfully", "success");
        studentForm.reset();
        fetchStudents();
      } else {
        showStudentMessage(result.detail || "Failed to add student", "error");
      }
    } catch (error) {
      showStudentMessage("Failed to add student", "error");
    }
  });

  // Handle student update
  updateStudentButton.addEventListener("click", async () => {
    const email = document.getElementById("student-email").value;
    const studentData = {
      email: email,
      full_name: document.getElementById("student-name").value,
      grade: parseInt(document.getElementById("student-grade").value),
      contact_phone: document.getElementById("student-phone").value,
      guardian_email: document.getElementById("guardian-email").value,
      health_notes: document.getElementById("health-notes").value
    };

    try {
      const response = await fetch(\`/students/\${encodeURIComponent(email)}\`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(studentData)
      });

      const result = await response.json();

      if (response.ok) {
        showStudentMessage("Student updated successfully", "success");
        studentForm.reset();
        // Reset form to add mode
        document.getElementById("student-email").disabled = false;
        updateStudentButton.style.display = "none";
        studentForm.querySelector("button[type='submit']").style.display = "block";
        fetchStudents();
      } else {
        showStudentMessage(result.detail || "Failed to update student", "error");
      }
    } catch (error) {
      showStudentMessage("Failed to update student", "error");
    }
  });

  // Initialize app
  fetchActivities();
  fetchStudents();
});
