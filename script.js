// Tab switch logic
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
  
      const selectedTabId = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
      document.getElementById(selectedTabId).classList.add("active");
    });
  });
  
  // Add Manual Task
  function addManualTask() {
    const input = document.getElementById("manual-input");
    const taskText = input.value.trim();
  
    if (taskText === "") {
      alert("Please enter a task!");
      return;
    }
  
    const task = createTaskElement(taskText);
    document.getElementById("manual-tasks").appendChild(task);
    input.value = "";
  }
  
  async function getTasksFromGroq() {
    const promptBox = document.getElementById("ai-prompt");
    const prompt = promptBox.value.trim();
    const aiTasksContainer = document.getElementById("ai-tasks");
  
    if (!prompt) {
      alert("Please describe what you want to accomplish!");
      return;
    }
  
    aiTasksContainer.innerHTML = "<p>Generating tasks...</p>";
  
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant who returns only a JSON object with a 'tasks' key containing an array of 5 strings based on user input. Do not add any explanation or extra text."
            },
            {
              role: "user",
              content: `Generate 5 actionable tasks based on this goal: ${prompt}`
            }
          ],
          temperature: 0.7
        })
      });
  
      const data = await response.json();
      const message = data.choices[0].message.content;
  
      let tasks = [];
      try {
        const parsed = JSON.parse(message);
        tasks = parsed.tasks;
      } catch (e) {
        console.error("Failed to parse JSON from model:", e);
        aiTasksContainer.innerHTML = "<p>Failed to understand the AI response. Please try again.</p>";
        return;
      }
  
      aiTasksContainer.innerHTML = ""; // Clear previous
  
      tasks.forEach(text => {
        const task = createTaskElement(text);
        aiTasksContainer.appendChild(task);
      });
  
    } catch (error) {
      console.error("Groq API error:", error);
      aiTasksContainer.innerHTML = "<p>Something went wrong. Please try again.</p>";
    }
  }
    
  
  // Common task element generator
  function createTaskElement(text) {
    const template = document.getElementById("task-template");
    const taskElement = template.content.cloneNode(true);
  
    const span = taskElement.querySelector(".task-text");
    span.textContent = text;
  
    const checkbox = taskElement.querySelector(".task-checkbox");
    checkbox.addEventListener("change", () => {
      span.style.textDecoration = checkbox.checked ? "line-through" : "none";
    });
  
    const editBtn = taskElement.querySelector(".btn-edit");
    editBtn.addEventListener("click", () => {
      const newText = prompt("Edit task:", span.textContent);
      if (newText) span.textContent = newText.trim();
    });
  
    const deleteBtn = taskElement.querySelector(".btn-delete");
    deleteBtn.addEventListener("click", () => {
      deleteBtn.closest(".task-item").remove();
    });
  
    return taskElement;
  }
  