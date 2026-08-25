// script.js

const PARTICLE_EFFECT_ENABLED = false;

// Get toggle button
const toggle = document.getElementById('dark-mode-toggle');

const stored = localStorage.getItem('theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = stored ? stored : (systemDark ? 'dark' : 'light');

document.documentElement.setAttribute('data-theme', initialTheme);

toggle.addEventListener('click', () => {
  const next =
    document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'light'
      : 'dark';

  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});


// ===========================
// PARTICLE SYSTEM — robotics node-network
// Adapts to: light/dark toggle, any screen size
// ===========================
(function () {
  if (!PARTICLE_EFFECT_ENABLED) return;

  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  let W, H, particles, connectDist, baseR;

  const HUB_RATIO = 0.12;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  // All geometry scales from the viewport's shorter side
  function computeScale() {
    const minDim = Math.min(W, H);
    connectDist = Math.max(80, Math.min(160, minDim * 0.20));
    baseR       = Math.max(0.7, Math.min(1.2, minDim / 700));
  }

  function particleCount() {
    // Fewer on small screens to stay light
    if (W <= 480)  return Math.min(35, Math.floor(W * H / 8000));
    if (W <= 768)  return Math.min(55, Math.floor(W * H / 9000));
    return Math.min(100, Math.floor(W * H / 9500));
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    computeScale();
  }

  class Particle {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      const speed = 0.16 + Math.random() * 0.32;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.hub = Math.random() < HUB_RATIO;
      // Radius scales with baseR so nodes stay proportional on mobile/desktop
      this.r = baseR * (this.hub ? (2.8 + Math.random() * 2) : (1 + Math.random() * 1.4));
      this.phase    = Math.random() * Math.PI * 2;
      this.pulseRate = 0.012 + Math.random() * 0.018;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.phase += this.pulseRate;
      if (this.x <= 0) { this.x = 0; this.vx =  Math.abs(this.vx); }
      if (this.x >= W) { this.x = W; this.vx = -Math.abs(this.vx); }
      if (this.y <= 0) { this.y = 0; this.vy =  Math.abs(this.vy); }
      if (this.y >= H) { this.y = H; this.vy = -Math.abs(this.vy); }
    }

    draw() {
      const dark  = isDark();
      const pulse = this.hub ? (1 + 0.28 * Math.sin(this.phase)) : 1;
      const r     = this.r * pulse;

      if (this.hub) {
        const glowR  = r * 4;
        const glow   = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR);
        if (dark) {
          glow.addColorStop(0, 'rgba(139, 180, 248, 0.22)');
          glow.addColorStop(1, 'rgba(139, 180, 248, 0)');
        } else {
          // Visible halo in light mode too — uses the indigo accent
          glow.addColorStop(0, 'rgba(37, 99, 235, 0.18)');
          glow.addColorStop(1, 'rgba(37, 99, 235, 0)');
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = dark
        ? (this.hub ? 'rgba(139, 180, 248, 0.92)' : 'rgba(99, 102, 241, 0.62)')
        : (this.hub ? 'rgba(30,  64,  175, 0.82)' : 'rgba(37,  99,  235, 0.55)');
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: particleCount() }, () => new Particle());
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    const dark = isDark();

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d >= connectDist) continue;
        const t     = 1 - d / connectDist;
        const alpha = t * (dark ? 0.30 : 0.32);   // light mode lines are equally prominent
        ctx.lineWidth   = (a.hub || b.hub) ? 1.5 : 0.8;
        ctx.strokeStyle = dark
          ? `rgba(139, 180, 248, ${alpha})`
          : `rgba(37,  99,  235, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(frame);
  }

  init();
  frame();

  // Debounced resize: rebuild particles only after user stops resizing
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150);
  });
})();



const publications = [
  {
    title: "Per-Finger Prosthetic Grasp Planning Using Object-Aligned Bounding Box Representation and VLM-Driven Object Selection",
    titleLink: "https://www.mdpi.com/2076-3417/16/12/5736",
    image: "static/papers/linker-vlm.png",
    authors: [
      { name: "Shifa Sulaiman", link: "https://scholar.google.com/citations?user=ck7Yia8AAAAJ&hl=en" },
      { name: "Akash Bachhar", link: null },
      { name: "Ming Shen", link: "https://scholar.google.com/citations?user=3m43L38AAAAJ&hl=en" },
      { name: "Simon Bøgh", link: "https://scholar.google.com/citations?user=l3u9RVgAAAAJ&hl=en" },
      { name: "Luigi Bibbo", link: "https://scholar.google.com/scholar?q=Luigi+Bibbo" }
    ],
    journal: "Applied Sciences 16 (12), 5736",
    description: "A Vision-Language Model identifies the target object and triggers grasping only on confident recognition, enabling intent-aware control. An object-aligned bounding box from the segmented point cloud supports accurate distance and collision queries, with per-finger contact poses planned independently and solved via Damped Least Squares inverse kinematics. Validated on the physical Linker Hand O7, achieving 93.2% segmentation accuracy (93.4% in simulation) with stable, real-time grasp execution."
  },
  {
    title: "Hierarchical Vision-Based and Sequential Deep Learning Architectures for Subject-Independent Locomotion Mode Detection, Speed, and Gait Phase Estimation",
    titleLink: "#",
    image: "static/papers/exo.png",
    authors: [
      { name: "Debadrata Sarkar", link: "https://scholar.google.com/citations?hl=en&user=a5w-W7UAAAAJ&view_op=list_works&sortby=pubdate" },
      { name: "Akash Bachhar", link: null },
      { name: "Aman Arora", link: "https://scholar.google.com/citations?user=eGNNHKwAAAAJ&hl=en" }
    ],
    journal: "Manuscript in Preparation",
    description: ""
  },
  {
    title: "Vision-Guided Grasp Planning for Prosthetic Hands with AABB-Based Object Representation",
    titleLink: "https://www.mdpi.com/2218-6581/15/1/22",
    image: "static/papers/linker-grasp.mp4",
    authors: [
      { name: "Shifa Sulaiman", link: "https://scholar.google.com/citations?user=ck7Yia8AAAAJ&hl=en" },
      { name: "Akash Bachhar", link: null },
      { name: "Ming Shen", link: "https://scholar.google.com/citations?user=3m43L38AAAAJ&hl=en" },
      { name: "Simon Bøgh", link: "https://scholar.google.com/citations?user=l3u9RVgAAAAJ&hl=en" }
    ],
    journal: "Robotics 15 (1), 22",
    description: "Introduces a vision-guided grasp planning framework for prosthetic hands in unstructured environments. A wrist-mounted camera and Bounding Volume Hierarchy (BVH) algorithm segment the target object and compute its bounding box, with grasp trajectories generated via RRT* and fingertip poses selected by minimum Euclidean distance to the object point cloud. Fingers are planned independently using Damped Least Squares inverse kinematics for adaptive, object-specific grasps. Validated via sim-to-real transfer on the physical Linker Hand O7."
  },
  {
    title: "Quantification and inhibition of corrosion on mild steel by the synthesized inhibitor through k-means clustering and electrochemical study: A dual approach",
    titleLink: "https://www.sciencedirect.com/science/article/pii/S1452398124002876",
    image: "static/papers/corrosion.jpg",
    authors: [
      { name: "Surya Sarkar", link: "https://www.researchgate.net/profile/Surya-Sarkar-2" },
      { name: "Akash Bachhar", link: null },
      { name: "Sukdeb Mandal ", link: "https://scholar.google.com/citations?user=IggIctgAAAAJ&hl=en" },
      { name: " Samik Dutta ", link: "https://scholar.google.co.in/citations?user=duW31DIAAAAJ&hl=en" },
      { name: "Priyabrata Banerjee", link: "https://www.priyabratabanerjee.in/" },
    ],
    journal: "International Journal of Electrochemical Science 19 (9), 100746",
    description: "Developed a k-means image segmentation method for rapid, accurate quantification of corrosion damage on mild steel surfaces, and evaluated the inhibition efficiency of four synthesized inhibitors via electrochemical experiments. Experimental results closely matched theoretical predictions, validating the image processing approach as a reliable tool for corrosion inhibition assessment.",
  },
];

// Render publications
const pubContainer = document.getElementById('pub-container');
publications.forEach(pub => {
  const authorsHTML = pub.authors.map(author =>
    author.link
      ? `<a href="${author.link}" target="_blank">${author.name}</a>`
      : `<strong>${author.name}</strong>`
  ).join(", ");

  pubContainer.innerHTML += `
      <div class="pub-item">
        <div class="pub-image">
  ${pub.image.endsWith('.mp4')
      ? `<video src="${pub.image}" autoplay loop muted playsinline></video>`
      : `<img src="${pub.image}" alt="publication" />`
    }
</div>
        <div class="pub-details">
          <h3>${pub.title}</h3>
          <p class="pub-authors">${authorsHTML}</p>
          <p class="pub-journal"><strong>${pub.journal}</strong></p>
          <p class="pub-description truncate-mobile">${pub.description}</p>
          ${pub.titleLink && pub.titleLink !== "#" ? `
          <a class="project-code-link" href="${pub.titleLink}" target="_blank">
            <span class="link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </span>
            <span>Paper</span>
          </a>` : ""}
        </div>
      </div>
    `;
});

const projects = [
  {
    title: "Force-Reflecting Hand Exoskeleton for Master-Slave Remote Handling (Final Year Thesis)",
    titleLink: "#",
    image: "static/projects/allegro.mp4",
    description: "Developed a DRDO-funded hand exoskeleton for master-slave remote manipulation, providing bidirectional kinesthetic force feedback via IMUs and potentiometers. Master-side movements are kinematically retargeted to an Allegro robotic hand, with grasping forces mirrored back in real time. Includes a head-mounted display and 3-axis servo gimbal camera for immersive remote operation."
  },
  {
    title: "MARCUS - Magnetic Adhesion Remote Controlled Utility Surface-Crawler",
    titleLink: "#",
    image: "static/projects/marcus.mp4",
    description: "Developed a flameproof, weather-resistant surface-crawling robot for LPG Horton sphere maintenance, using permanent magnetic adhesion optimized for curved surfaces and pneumatic drive motors. Wirelessly controlled via joystick, with a modular magnetic system ensuring grip across varying sphere geometries. Enables cleaning, painting, and NDT tasks, cutting manpower by 80% and operational time by 90% while eliminating height-related risks and scaffolding costs."
  },
  {
    title: "Quadruped Locomotion: Kinematics, Control, and Gait Generation in ROS 2 (Summer Internship)",
    titleLink: "#",
    image: "static/projects/anymal-ros.gif",
    codeLink: "https://github.com/akashbachhar/anymal-locomotion-ros2",
    description: "Built a full locomotion stack for the ANYmal quadruped in ROS 2 and Gazebo — closed-form kinematics, joint control, and gait generation. Derived analytical forward/inverse kinematics for all four legs directly from the URDF, replacing numerical solvers with exact closed-form expressions. Designed a PD-plus-gravity-feedforward joint controller and an IMU-driven PID stabilizer, tuned against measured tracking error and sensor-frame quirks. Generated static and dynamic gaits (walk, trot) from a shared duty-factor/phase-offset model, with a diagnostic tool to quantify gait quality from live telemetry."
  },
  {
    title: "Roll Cage Design and Manufacturing for BAJA SAE 2023",
    titleLink: "#",
    presentationLink: "https://docs.google.com/presentation/d/1fj9A4eBqIGFRc_wGlcEfiZo6jPkf8MzufQw0LQpxkcg/edit?usp=sharing",
    image: "static/projects/ndors.mp4",
    description: "Led the design and fabrication of a lightweight, high-strength roll cage as Roll Cage Head of Team NDORS, NIT Durgapur, for BAJA SAE India 2023. Optimized material and structural design per the rulebook, achieving 20% cost and 30% weight reduction over the previous year. Conducted static (impact, bump) and dynamic (rollover, collision) analyses, and validated manufacturing through weld strength and drop testing. The team placed 2nd in CAE Presentation and 3rd in All-Terrain Performance among IITs and NITs, ranking 16th and 19th nationally."
  },
  {
    title: "SpecsX – Gyroscopic Smart Glasses for Hands-Free Computer Control",
    titleLink: "#",
    codeLink: "https://github.com/akashbachhar/SpecsX",
    image: "static/projects/specsx.png",
    description: "Built a gyroscope-equipped eyewear system enabling specially-abled individuals to control a computer's mouse and keyboard through head movements, with clicks triggered by detecting eye blinks and their duration. SpecsX enables independent, confident digital access for education and communication."
  },

];

// Render projects
const projectContainer = document.getElementById('project-container');
projects.forEach(proj => {
  projectContainer.innerHTML += `
      <div class="project-item">
       <div class="project-image">
  ${proj.image.endsWith('.mp4')
      ? `<video src="${proj.image}" autoplay loop muted playsinline></video>`
      : `<img src="${proj.image}" alt="project" />`
    }
</div>

        <div class="project-details">
          <h3>${proj.title}</h3>
          <p class="project-description truncate-mobile">${proj.description}</p>
          ${(proj.codeLink || proj.presentationLink) ? `
          <div class="project-links-row">
            ${proj.codeLink ? `
            <a class="project-code-link" href="${proj.codeLink}" target="_blank">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z">
                  </path>
                </svg>
              </span>
              <span>Code</span>
            </a>` : ""}
            ${proj.presentationLink ? `
            <a class="project-code-link" href="${proj.presentationLink}" target="_blank">
              <span class="link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                  stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="13" rx="2"></rect>
                  <path d="M8 21h8M12 17v4"></path>
                </svg>
              </span>
              <span>Presentation</span>
            </a>` : ""}
          </div>` : ""}
        </div>
      </div>
    `;
});
const miniProjects = [
  {
    title: "Quadruped Locomotion with PPO-Based Reinforcement Learning",
    codeLink: "https://github.com/akashbachhar/anymal-ppo-locomotion",
    image: "static/mini-projects/anymal-ppo.gif"
  },
  {
    title: "ArmX – Precision Pick-and-Place with UR5e Robot using MoveIt",
    codeLink: "https://github.com/akashbachhar/grasp-and-geometry-detection-ros",
    image: "static/mini-projects/ur5e.mp4",
    mediaFit: "contain"
  },
  {
    title: "Five-Bar Mechanism for Producing Reciprocal Rectilinear High-Deflection Motion for Pumping Bag-Valve-Mask (BVM)",
    image: "static/papers/5bar.mp4"
  },

  {
    title: "Design, Simulation, and Fabrication of High-Performance Solid Rocket Nozzle",
    image: "static/mini-projects/nozzle.mp4"
  },
  {
    title: "HandX – Robotic Hand Control via Image Processing-based Hand Posture Detection",
    image: "static/mini-projects/handx.mp4"
  },
  {
    title: "SpeedX – Immersive Gyroscope-Controlled Racing Game for Medical Rehabilitation",
    codeLink: "https://github.com/akashbachhar/SpeedX",
    image: "static/mini-projects/speedx.png"
  }


];

// Render mini hobby projects
const miniProjectsGrid = document.getElementById('mini-projects-grid');

miniProjects.forEach(mini => {
  const fitClass = mini.mediaFit === "contain" ? " media-contain" : "";
  miniProjectsGrid.innerHTML += `
    <div class="mini-project-item${fitClass}">
      ${
        mini.image.endsWith('.mp4')
          ? `<video
               src="${mini.image}"
               autoplay
               loop
               muted
               playsinline
               preload="metadata"
             ></video>`
          : `<img src="${mini.image}" alt="${mini.title}">`
      }
      <h4>${mini.title}</h4>
      ${mini.codeLink ? `
      <a class="project-code-link mini-code-link" href="${mini.codeLink}" target="_blank">
        <span class="link-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z">
            </path>
          </svg>
        </span>
        <span>Code</span>
      </a>` : ""}
    </div>
  `;
});

function applyReadMore() {
  if (window.innerWidth > 768) return;

  const WORD_LIMIT = 30;

  document.querySelectorAll('.truncate-mobile').forEach(el => {
    if (el.dataset.initialized === 'true') return;

    const fullHTML = el.innerHTML.trim();
    const words = el.textContent.trim().split(/\s+/);

    if (words.length <= WORD_LIMIT) return;

    const shortText = words.slice(0, WORD_LIMIT).join(' ') + '…';

    const toggle = document.createElement('span');
    toggle.textContent = ' Read more';
    toggle.style.color = 'var(--link)';
    toggle.style.cursor = 'pointer';
    toggle.style.fontWeight = '500';
    toggle.style.whiteSpace = 'nowrap';

    let expanded = false;

    toggle.addEventListener('click', () => {
      expanded = !expanded;
      el.innerHTML = expanded ? fullHTML : shortText;
      toggle.textContent = expanded ? ' Read less' : ' Read more';
      el.appendChild(toggle);
    });

    el.innerHTML = shortText;
    el.appendChild(toggle);
    el.dataset.initialized = 'true';
  });
}


function applyHeroReadMore() {
  if (window.innerWidth > 768) return;

  const heroText = document.querySelector('.hero-text');
  const toggle = document.querySelector('.hero-readmore');

  if (!heroText || !toggle) return;

  let expanded = false;

  toggle.addEventListener('click', () => {
    expanded = !expanded;
    heroText.classList.toggle('is-expanded', expanded);
    toggle.textContent = expanded ? 'Read less' : 'Read more';
  });
}


applyReadMore();
applyHeroReadMore();
