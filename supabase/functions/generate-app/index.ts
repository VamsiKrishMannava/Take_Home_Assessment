import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const appTemplates = {
  'resume builder': {
    name: 'Resume Builder',
    description: 'A professional resume builder with form inputs and live preview',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Builder</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            min-height: 600px;
        }
        .form-section {
            padding: 40px;
            background: #f8fafc;
            border-right: 1px solid #e2e8f0;
        }
        .preview-section {
            padding: 40px;
            background: white;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h3 {
            color: #4f46e5;
            margin-bottom: 15px;
            font-size: 1.2em;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 5px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
        }
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #4f46e5;
        }
        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }
        .resume-preview {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .resume-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4f46e5;
        }
        .resume-header h2 {
            font-size: 2em;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .resume-header p {
            color: #6b7280;
            font-size: 1.1em;
        }
        .resume-section {
            margin-bottom: 25px;
        }
        .resume-section h3 {
            color: #4f46e5;
            font-size: 1.3em;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .experience-item,
        .education-item {
            margin-bottom: 20px;
            padding-left: 20px;
            border-left: 3px solid #e2e8f0;
        }
        .experience-item h4,
        .education-item h4 {
            color: #1f2937;
            margin-bottom: 5px;
        }
        .experience-item .company,
        .education-item .school {
            color: #6b7280;
            font-style: italic;
            margin-bottom: 8px;
        }
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .skill-tag {
            background: #4f46e5;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        .download-btn {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 16px;
            border-radius: 10px;
            cursor: pointer;
            margin-top: 20px;
            transition: transform 0.2s ease;
        }
        .download-btn:hover {
            transform: translateY(-2px);
        }
        .empty-state {
            color: #9ca3af;
            font-style: italic;
            text-align: center;
            padding: 20px;
        }
        @media (max-width: 768px) {
            .content {
                grid-template-columns: 1fr;
            }
            .form-section {
                border-right: none;
                border-bottom: 1px solid #e2e8f0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Resume Builder</h1>
            <p>Create your professional resume in minutes</p>
        </div>
        
        <div class="content">
            <div class="form-section">
                <div class="section">
                    <h3>Personal Information</h3>
                    <div class="form-group">
                        <label for="fullName">Full Name</label>
                        <input type="text" id="fullName" placeholder="John Doe">
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" placeholder="john@example.com">
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone</label>
                        <input type="tel" id="phone" placeholder="+1 (555) 123-4567">
                    </div>
                    <div class="form-group">
                        <label for="location">Location</label>
                        <input type="text" id="location" placeholder="New York, NY">
                    </div>
                </div>

                <div class="section">
                    <h3>Professional Summary</h3>
                    <div class="form-group">
                        <label for="summary">Summary</label>
                        <textarea id="summary" placeholder="Brief professional summary..."></textarea>
                    </div>
                </div>

                <div class="section">
                    <h3>Work Experience</h3>
                    <div class="form-group">
                        <label for="jobTitle">Job Title</label>
                        <input type="text" id="jobTitle" placeholder="Software Engineer">
                    </div>
                    <div class="form-group">
                        <label for="company">Company</label>
                        <input type="text" id="company" placeholder="Tech Company Inc.">
                    </div>
                    <div class="form-group">
                        <label for="jobDescription">Job Description</label>
                        <textarea id="jobDescription" placeholder="Describe your responsibilities..."></textarea>
                    </div>
                </div>

                <div class="section">
                    <h3>Education</h3>
                    <div class="form-group">
                        <label for="degree">Degree</label>
                        <input type="text" id="degree" placeholder="Bachelor of Science">
                    </div>
                    <div class="form-group">
                        <label for="school">School</label>
                        <input type="text" id="school" placeholder="University Name">
                    </div>
                    <div class="form-group">
                        <label for="graduationYear">Graduation Year</label>
                        <input type="text" id="graduationYear" placeholder="2020">
                    </div>
                </div>

                <div class="section">
                    <h3>Skills</h3>
                    <div class="form-group">
                        <label for="skills">Skills (comma-separated)</label>
                        <input type="text" id="skills" placeholder="JavaScript, React, Node.js, Python">
                    </div>
                </div>

                <button class="download-btn" onclick="downloadResume()">Download Resume</button>
            </div>

            <div class="preview-section">
                <div class="resume-preview">
                    <div class="resume-header">
                        <h2 id="previewName">Your Name</h2>
                        <p id="previewContact">your.email@example.com | (555) 123-4567 | City, State</p>
                    </div>

                    <div class="resume-section">
                        <h3>Professional Summary</h3>
                        <p id="previewSummary" class="empty-state">Enter your professional summary...</p>
                    </div>

                    <div class="resume-section">
                        <h3>Work Experience</h3>
                        <div id="previewExperience" class="empty-state">Add your work experience...</div>
                    </div>

                    <div class="resume-section">
                        <h3>Education</h3>
                        <div id="previewEducation" class="empty-state">Add your education...</div>
                    </div>

                    <div class="resume-section">
                        <h3>Skills</h3>
                        <div id="previewSkills" class="empty-state">Add your skills...</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Real-time preview updates
        function updatePreview() {
            const fullName = document.getElementById('fullName').value || 'Your Name';
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const location = document.getElementById('location').value;
            const summary = document.getElementById('summary').value;
            const jobTitle = document.getElementById('jobTitle').value;
            const company = document.getElementById('company').value;
            const jobDescription = document.getElementById('jobDescription').value;
            const degree = document.getElementById('degree').value;
            const school = document.getElementById('school').value;
            const graduationYear = document.getElementById('graduationYear').value;
            const skills = document.getElementById('skills').value;

            // Update header
            document.getElementById('previewName').textContent = fullName;
            
            const contactInfo = [email, phone, location].filter(Boolean).join(' | ');
            document.getElementById('previewContact').textContent = contactInfo || 'your.email@example.com | (555) 123-4567 | City, State';

            // Update summary
            const summaryElement = document.getElementById('previewSummary');
            if (summary) {
                summaryElement.textContent = summary;
                summaryElement.classList.remove('empty-state');
            } else {
                summaryElement.textContent = 'Enter your professional summary...';
                summaryElement.classList.add('empty-state');
            }

            // Update experience
            const experienceElement = document.getElementById('previewExperience');
            if (jobTitle || company || jobDescription) {
                experienceElement.innerHTML = \`
                    <div class="experience-item">
                        <h4>\${jobTitle || 'Job Title'}</h4>
                        <div class="company">\${company || 'Company Name'}</div>
                        <p>\${jobDescription || 'Job description will appear here...'}</p>
                    </div>
                \`;
                experienceElement.classList.remove('empty-state');
            } else {
                experienceElement.textContent = 'Add your work experience...';
                experienceElement.classList.add('empty-state');
            }

            // Update education
            const educationElement = document.getElementById('previewEducation');
            if (degree || school || graduationYear) {
                educationElement.innerHTML = \`
                    <div class="education-item">
                        <h4>\${degree || 'Degree'}</h4>
                        <div class="school">\${school || 'School Name'} - \${graduationYear || 'Year'}</div>
                    </div>
                \`;
                educationElement.classList.remove('empty-state');
            } else {
                educationElement.textContent = 'Add your education...';
                educationElement.classList.add('empty-state');
            }

            // Update skills
            const skillsElement = document.getElementById('previewSkills');
            if (skills) {
                const skillsArray = skills.split(',').map(skill => skill.trim()).filter(Boolean);
                skillsElement.innerHTML = \`
                    <div class="skills-list">
                        \${skillsArray.map(skill => \`<span class="skill-tag">\${skill}</span>\`).join('')}
                    </div>
                \`;
                skillsElement.classList.remove('empty-state');
            } else {
                skillsElement.textContent = 'Add your skills...';
                skillsElement.classList.add('empty-state');
            }
        }

        // Add event listeners
        document.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updatePreview);
        });

        // Download functionality
        function downloadResume() {
            alert('Resume download functionality would be implemented here!');
        }

        // Initialize preview
        updatePreview();
    </script>
</body>
</html>`
    }
  },
  
  'todo app': {
    name: 'Todo App',
    description: 'A simple and elegant todo application with local storage',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .input-section {
            padding: 30px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }
        .input-group {
            display: flex;
            gap: 10px;
        }
        .input-group input {
            flex: 1;
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        .input-group input:focus {
            outline: none;
            border-color: #4f46e5;
        }
        .add-btn {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            border: none;
            padding: 15px 25px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.2s ease;
        }
        .add-btn:hover {
            transform: translateY(-2px);
        }
        .todo-list {
            padding: 20px;
        }
        .todo-item {
            display: flex;
            align-items: center;
            padding: 15px;
            margin-bottom: 10px;
            background: #f8fafc;
            border-radius: 10px;
            border-left: 4px solid #4f46e5;
            transition: all 0.3s ease;
        }
        .todo-item:hover {
            background: #e0e7ff;
            transform: translateX(5px);
        }
        .todo-item.completed {
            background: #f0f9ff;
            border-left-color: #10b981;
        }
        .todo-item.completed .todo-text {
            text-decoration: line-through;
            color: #6b7280;
        }
        .todo-checkbox {
            margin-right: 15px;
            width: 20px;
            height: 20px;
            cursor: pointer;
        }
        .todo-text {
            flex: 1;
            font-size: 16px;
            color: #374151;
        }
        .delete-btn {
            background: #ef4444;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s ease;
        }
        .delete-btn:hover {
            background: #dc2626;
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #6b7280;
        }
        .empty-state h3 {
            font-size: 1.5em;
            margin-bottom: 10px;
        }
        .stats {
            padding: 20px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            text-align: center;
        }
        .stats span {
            display: inline-block;
            margin: 0 15px;
            padding: 8px 16px;
            background: #e0e7ff;
            border-radius: 20px;
            font-size: 14px;
            color: #4f46e5;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Todo App</h1>
            <p>Stay organized and productive</p>
        </div>
        
        <div class="input-section">
            <div class="input-group">
                <input type="text" id="todoInput" placeholder="What needs to be done?">
                <button class="add-btn" onclick="addTodo()">Add Todo</button>
            </div>
        </div>
        
        <div class="todo-list" id="todoList">
            <!-- Todos will be rendered here -->
        </div>
        
        <div class="stats">
            <span id="totalTodos">Total: 0</span>
            <span id="completedTodos">Completed: 0</span>
            <span id="pendingTodos">Pending: 0</span>
        </div>
    </div>

    <script>
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        let nextId = parseInt(localStorage.getItem('nextId')) || 1;

        function saveTodos() {
            localStorage.setItem('todos', JSON.stringify(todos));
            localStorage.setItem('nextId', nextId.toString());
        }

        function addTodo() {
            const input = document.getElementById('todoInput');
            const text = input.value.trim();
            
            if (text === '') {
                alert('Please enter a todo!');
                return;
            }

            const todo = {
                id: nextId++,
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };

            todos.push(todo);
            input.value = '';
            saveTodos();
            renderTodos();
        }

        function toggleTodo(id) {
            todos = todos.map(todo => 
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            );
            saveTodos();
            renderTodos();
        }

        function deleteTodo(id) {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }

        function renderTodos() {
            const todoList = document.getElementById('todoList');
            
            if (todos.length === 0) {
                todoList.innerHTML = \`
                    <div class="empty-state">
                        <h3>No todos yet!</h3>
                        <p>Add your first todo above to get started.</p>
                    </div>
                \`;
            } else {
                todoList.innerHTML = todos.map(todo => \`
                    <div class="todo-item \${todo.completed ? 'completed' : ''}">
                        <input type="checkbox" class="todo-checkbox" 
                               \${todo.completed ? 'checked' : ''} 
                               onchange="toggleTodo(\${todo.id})">
                        <span class="todo-text">\${todo.text}</span>
                        <button class="delete-btn" onclick="deleteTodo(\${todo.id})">Delete</button>
                    </div>
                \`).join('');
            }
            
            updateStats();
        }

        function updateStats() {
            const total = todos.length;
            const completed = todos.filter(todo => todo.completed).length;
            const pending = total - completed;
            
            document.getElementById('totalTodos').textContent = \`Total: \${total}\`;
            document.getElementById('completedTodos').textContent = \`Completed: \${completed}\`;
            document.getElementById('pendingTodos').textContent = \`Pending: \${pending}\`;
        }

        // Allow Enter key to add todo
        document.getElementById('todoInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTodo();
            }
        });

        // Initialize the app
        renderTodos();
    </script>
</body>
</html>`
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, projectId } = await req.json();
    
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating app for prompt:', prompt);
    console.log('Project ID:', projectId);

    // Check if the prompt matches any predefined templates
    const lowerPrompt = prompt.toLowerCase();
    let appData = null;

    for (const [key, template] of Object.entries(appTemplates)) {
      if (lowerPrompt.includes(key)) {
        appData = template;
        break;
      }
    }

    if (!appData) {
      // If no template matches, generate a custom response using AI
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `Generate a complete HTML app for: "${prompt}". 
              
              Requirements:
              - Create a single HTML file with embedded CSS and JavaScript
              - Make it visually appealing with modern design
              - Include interactive functionality
              - Use a gradient background and modern styling
              - Make it responsive
              - Include proper semantic HTML
              
              Return ONLY the HTML code, no explanations or markdown.`
            }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedHtml = data.content[0].text;

      appData = {
        name: prompt.charAt(0).toUpperCase() + prompt.slice(1),
        description: `Custom ${prompt} application`,
        files: {
          'index.html': generatedHtml
        }
      };
    }

    const response = {
      success: true,
      appData: appData,
      assistantResponse: `I've created a ${appData.name} with the following features:
      
${appData.description}

The app includes:
- Modern, responsive design with gradient backgrounds
- Interactive user interface
- Real-time updates and feedback
- Professional styling and animations

You can see the live preview on the right, and the complete code is available in the Code tab. Would you like me to modify any specific features or add additional functionality?`
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-app function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});