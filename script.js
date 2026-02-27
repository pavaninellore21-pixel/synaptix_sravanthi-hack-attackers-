<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skill-Based Internship & Project Matching</title>
    <style>
        /* Background */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(120deg, #ffc1cc, #ffe0e6);
            min-height: 100vh;
        }

        h1, h2 { text-align: center; color: #333; }

        .container {
            max-width: 900px;
            margin: auto;
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0,0,0,0.2);
        }

        label {
            display: block;
            margin-top: 12px;
            font-weight: bold;
        }

        input[type=text] {
            width: 100%;
            padding: 8px;
            margin-top: 4px;
            border-radius: 4px;
            border: 1px solid #ccc;
        }

        button {
            margin-top: 20px;
            padding: 12px 25px;
            border: none;
            border-radius: 5px;
            background-color: #ff6f91;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
        }

        button:hover { background-color: #ff3f70; }

        .results { margin-top: 25px; }

        .candidate {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 15px;
            background-color: #fff0f5;
        }

        .reasoning {
            font-size: 0.9em;
            color: #555;
            margin-top: 6px;
        }

        /* Match score colors */
        .match-score.score-high { color: green; font-weight: bold; }
        .match-score.score-medium { color: orange; font-weight: bold; }
        .match-score.score-low { color: red; font-weight: bold; }

        /* Skill bars */
        .skill-bar-container {
            width: 100%;
            background-color: #eee;
            border-radius: 5px;
            margin-bottom: 6px;
        }

        .skill-bar {
            height: 12px;
            background-color: #ff6f91;
            border-radius: 5px;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Skill-Based Internship & Project Matching</h1>

    <h2>Add Candidate</h2>
    <label for="candidateName">Candidate Name:</label>
    <input type="text" id="candidateName" placeholder="John Doe">

    <label for="skills">Skills (comma-separated, level 1-5, e.g., Python:4, SQL:3):</label>
    <input type="text" id="skills" placeholder="Python:4, SQL:3, Machine Learning:5">

    <label for="experience">Experience in Years for Each Skill (optional, e.g., Python:2, SQL:1):</label>
    <input type="text" id="experience" placeholder="Python:2, SQL:1">

    <button onclick="addCandidate()">Add Candidate</button>

    <h2>Define Project Requirements</h2>
    <label for="projectName">Project Name:</label>
    <input type="text" id="projectName" placeholder="AI Research Project">

    <label for="projectSkills">Required Skills (weight 1-5, e.g., Python:5, SQL:4):</label>
    <input type="text" id="projectSkills" placeholder="Python:5, SQL:4, Machine Learning:5">

    <label for="optionalSkills">Optional Skills (weight 1-5, e.g., Java:3, R:2):</label>
    <input type="text" id="optionalSkills" placeholder="Java:3, R:2">

    <button onclick="matchCandidates()">Match Candidates</button>

    <div class="results" id="results"></div>
</div>

<script>
let candidates = [];

// Parse skill string into object
function parseSkills(skillStr){
    const skills = {};
    if(!skillStr) return skills;
    skillStr.split(',').forEach(item => {
        const [skill, value] = item.split(':').map(s => s.trim());
        if(skill && value) skills[skill.toLowerCase()] = parseFloat(value);
    });
    return skills;
}

// Add candidate
function addCandidate(){
    const name = document.getElementById('candidateName').value.trim();
    const skills = parseSkills(document.getElementById('skills').value);
    const experience = parseSkills(document.getElementById('experience').value);

    if(!name || Object.keys(skills).length === 0){
        alert('Please enter candidate name and skills.');
        return;
    }

    candidates.push({name, skills, experience});
    alert(`Candidate ${name} added!`);

    document.getElementById('candidateName').value = '';
    document.getElementById('skills').value = '';
    document.getElementById('experience').value = '';
}

// Match candidates to project
function matchCandidates(){
    const projectName = document.getElementById('projectName').value.trim();
    const requiredSkills = parseSkills(document.getElementById('projectSkills').value);
    const optionalSkills = parseSkills(document.getElementById('optionalSkills').value);

    if(!projectName || Object.keys(requiredSkills).length === 0){
        alert('Please enter project name and required skills.');
        return;
    }

    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<h2>Matching Results for ${projectName}</h2>`;

    let matches = candidates.map(candidate => {
        let score = 0, totalWeight = 0;
        let reasoning = [];

        // Required skills
        for(let skill in requiredSkills){
            const weight = requiredSkills[skill];
            totalWeight += weight;
            const level = candidate.skills[skill] || 0;
            const years = candidate.experience[skill] || 0;
            const skillScore = level + 0.2*years;
            score += skillScore * weight;
            reasoning.push(`${skill}: level ${level}, experience ${years}, weight ${weight}`);
        }

        // Optional skills
        for(let skill in optionalSkills){
            const weight = optionalSkills[skill];
            const level = candidate.skills[skill] || 0;
            score += level * weight * 0.5;
            if(level>0) reasoning.push(`${skill} (optional): level ${level}, weight ${weight*0.5}`);
        }

        // Max possible score
        const maxPossible = Object.values(requiredSkills).reduce((a,b)=>a+b,0) * 6; // 5+experience
        let matchScore = ((score / maxPossible) * 100).toFixed(2);

        // Missing required skills penalty
        const missing = Object.keys(requiredSkills).filter(s => !(s in candidate.skills));
        if(missing.length>0){
            matchScore = (matchScore - missing.length*5).toFixed(2);
            reasoning.push(`Missing skills penalty: ${missing.join(', ')}`);
        }

        return {
            name: candidate.name,
            matchScore: Math.max(matchScore,0),
            reasoning,
            skills: candidate.skills
        };
    });

    // Sort descending
    matches.sort((a,b) => b.matchScore - a.matchScore);

    // Display
    matches.forEach(match => {
        const div = document.createElement('div');
        div.className = 'candidate';
        let colorClass = match.matchScore>=75 ? 'score-high' : (match.matchScore>=50 ? 'score-medium' : 'score-low');

        // Skill bars
        let skillBars = '';
        for(let skill in match.skills){
            const width = Math.min(match.skills[skill]*20,100);
            skillBars += `<div>${skill}</div><div class="skill-bar-container"><div class="skill-bar" style="width:${width}%"></div></div>`;
        }

        div.innerHTML = `<strong>${match.name}</strong> - <span class="match-score ${colorClass}">${match.matchScore}%</span>
                         <div class="reasoning">Reasoning:<br>${match.reasoning.join('<br>')}</div>
                         ${skillBars}`;
        resultsDiv.appendChild(div);
    });
}
</script>

</body>
</html>