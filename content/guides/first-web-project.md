---
title: "Creating Your First Web Page: A Simple HTML and CSS Project"
date: 2025-03-02
slug: "creating-your-first-web-page-html-css-project"
description: "A hands-on tutorial that guides beginners through building their first web page from scratch using HTML and CSS, with a practical personal profile page project."
keywords:
 - first web page
 - HTML project
 - CSS project
 - web development
 - beginner coding
 - personal profile page
 - coding tutorial
status: publish
thumbnail: "/images/first-web-project.jpg"
---

# Creating Your First Web Page: A Simple HTML and CSS Project

There's nothing quite like the satisfaction of creating your first web page. In this hands-on tutorial, we'll walk through building a personal profile page from scratch using HTML and CSS. By the end, you'll have a functional web page that you can proudly share with friends and family, plus the foundational skills to continue your web development journey.

## What We're Building

We'll create a clean, professional personal profile page that includes:
- A header with your name and navigation
- An about section with your photo and brief biography
- A skills section highlighting your abilities
- A projects or experience section
- A contact section with links to your social media or email

The design will be responsive, meaning it will look good on both desktop and mobile devices.

## Setting Up Your Development Environment

Before writing any code, let's set up a basic development environment:

### 1. Create Your Project Folder

Create a new folder on your computer named `my-profile` (or any name you prefer). Inside that folder, create:
- A file named `index.html`
- A folder named `css`
- A folder named `images`

Inside the `css` folder, create a file named `styles.css`.

### 2. Gather Your Assets

Prepare the following:
- A professional headshot or avatar for your profile (place it in the `images` folder)
- Any other images you might want to include (like project screenshots)
- The text content for your biography, skills, and experience

### 3. Select Your Tools

You'll need:
- A text editor (VS Code, Sublime Text, Atom, or even Notepad)
- A web browser (Chrome, Firefox, Safari, or Edge)

## Step 1: Creating Your HTML Structure

Open your `index.html` file in your text editor. Let's create the basic HTML structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Name | Personal Profile</title>
    <link rel="stylesheet" href="css/styles.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header Section -->
    <header>
        <div class="container">
            <h1>Your Name</h1>
            <nav>
                <ul>
                    <li><a href="#about">About</a></li>
                    <li><a href="#skills">Skills</a></li>
                    <li><a href="#projects">Projects</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main>
        <!-- About Section -->
        <section id="about" class="about">
            <div class="container">
                <h2>About Me</h2>
                <div class="about-content">
                    <img src="images/your-photo.jpg" alt="Your Name" class="profile-image">
                    <div class="bio">
                        <p>Welcome to my personal website! I'm a [your profession/study] based in [your location]. I'm passionate about [your interests] and dedicated to [your goal].</p>
                        <p>This is the second paragraph of your bio. Share more about your background, interests, or aspirations here.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Skills Section -->
        <section id="skills" class="skills">
            <div class="container">
                <h2>My Skills</h2>
                <div class="skills-content">
                    <div class="skill">
                        <h3>Skill Category 1</h3>
                        <ul>
                            <li>Skill 1</li>
                            <li>Skill 2</li>
                            <li>Skill 3</li>
                        </ul>
                    </div>
                    <div class="skill">
                        <h3>Skill Category 2</h3>
                        <ul>
                            <li>Skill 4</li>
                            <li>Skill 5</li>
                            <li>Skill 6</li>
                        </ul>
                    </div>
                    <div class="skill">
                        <h3>Skill Category 3</h3>
                        <ul>
                            <li>Skill 7</li>
                            <li>Skill 8</li>
                            <li>Skill 9</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Projects Section -->
        <section id="projects" class="projects">
            <div class="container">
                <h2>My Projects</h2>
                <div class="projects-content">
                    <div class="project">
                        <h3>Project/Experience 1</h3>
                        <p>Description of your project or professional experience. What was your role? What technologies did you use? What did you achieve?</p>
                    </div>
                    <div class="project">
                        <h3>Project/Experience 2</h3>
                        <p>Description of your project or professional experience. What was your role? What technologies did you use? What did you achieve?</p>
                    </div>
                    <div class="project">
                        <h3>Project/Experience 3</h3>
                        <p>Description of your project or professional experience. What was your role? What technologies did you use? What did you achieve?</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="contact">
            <div class="container">
                <h2>Get In Touch</h2>
                <div class="contact-content">
                    <p>I'm always open to new opportunities and connections. Feel free to reach out!</p>
                    <div class="contact-links">
                        <a href="mailto:youremail@example.com" class="contact-link">Email</a>
                        <a href="https://linkedin.com/in/yourprofile" class="contact-link">LinkedIn</a>
                        <a href="https://github.com/yourusername" class="contact-link">GitHub</a>
                        <a href="https://twitter.com/yourusername" class="contact-link">Twitter</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer>
        <div class="container">
            <p>&copy; 2025 Your Name. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
```

Now, open your `index.html` file in a web browser. You should see all your content, but it won't look very appealing yet. That's where CSS comes in!

## Step 2: Styling Your Page with CSS

Open your `css/styles.css` file and add the following CSS to style your page:

```css
/* Basic Reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Global Styles */
body {
    font-family: 'Roboto', sans-serif;
    line-height: 1.6;
    color: #333;
}

.container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

h1, h2, h3 {
    margin-bottom: 20px;
}

section {
    padding: 60px 0;
}

section:nth-child(even) {
    background-color: #f9f9f9;
}

/* Header Styles */
header {
    background-color: #2c3e50;
    color: white;
    padding: 20px 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

header h1 {
    margin-bottom: 0;
    font-size: 28px;
}

nav ul {
    display: flex;
    list-style: none;
}

nav ul li {
    margin-left: 20px;
}

nav a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;
}

nav a:hover {
    color: #3498db;
}

/* About Section */
.about-content {
    display: flex;
    align-items: center;
    gap: 40px;
}

.profile-image {
    width: 250px;
    height: 250px;
    object-fit: cover;
    border-radius: 50%;
    border: 5px solid white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.bio p {
    margin-bottom: 15px;
}

/* Skills Section */
.skills-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.skill {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.skill h3 {
    color: #2c3e50;
    margin-bottom: 15px;
}

.skill ul {
    list-style-position: inside;
}

.skill li {
    margin-bottom: 8px;
}

/* Projects Section */
.projects-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.project {
    background-color: white;
    padding: 25px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.project h3 {
    color: #2c3e50;
}

/* Contact Section */
.contact-content {
    text-align: center;
    max-width: 700px;
    margin: 0 auto;
}

.contact-links {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 30px;
    gap: 20px;
}

.contact-link {
    display: inline-block;
    background-color: #3498db;
    color: white;
    text-decoration: none;
    padding: 12px 25px;
    border-radius: 5px;
    font-weight: 500;
    transition: background-color 0.3s;
}

.contact-link:hover {
    background-color: #2980b9;
}

/* Footer */
footer {
    background-color: #2c3e50;
    color: white;
    text-align: center;
    padding: 20px 0;
}

/* Responsive Design */
@media (max-width: 768px) {
    header .container {
        flex-direction: column;
        text-align: center;
    }
    
    nav ul {
        margin-top: 15px;
    }
    
    nav ul li {
        margin: 0 10px;
    }
    
    .about-content {
        flex-direction: column;
        text-align: center;
    }
    
    .profile-image {
        margin-bottom: 20px;
    }
    
    section {
        padding: 40px 0;
    }
}

@media (max-width: 480px) {
    nav ul {
        flex-direction: column;
        gap: 10px;
    }
    
    nav ul li {
        margin: 0;
    }
    
    .projects-content, 
    .skills-content {
        grid-template-columns: 1fr;
    }
}
