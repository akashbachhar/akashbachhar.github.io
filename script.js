// script.js

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
    title: "A Comparative Study of Hierarchical Vision-Based and Sequential Deep Learning Architectures for Multi-Subject Locomotion Mode Detection, Speed, and Gait Phase Estimation",
    titleLink: "#",
    image: "static/papers/exo.mp4",
    authors: [
      { name: "Debadrata Sarkar", link: "https://scholar.google.com/citations?hl=en&user=a5w-W7UAAAAJ&view_op=list_works&sortby=pubdate" },
      { name: "Akash Bachhar", link: null },
      { name: "Aman Arora", link: "https://scholar.google.com/citations?user=eGNNHKwAAAAJ&hl=en" }
    ],
    journal: "Manuscript in Preparation, 2026",
    description: ""
  },
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
    description: "A Vision–Language Model identifies the target object and triggers grasping only on confident recognition, enabling intent-aware control. An object-aligned bounding box from the segmented point cloud supports accurate distance and collision queries, after which per-finger contact poses are planned independently and solved via Damped Least Squares inverse kinematics. Validated on the physical Linker Hand O7, achieving 93.2% segmentation accuracy (93.4% in simulation) with stable, real-time grasp execution across representative objects."
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
    description: "This paper presents a vision-guided grasp planning framework for prosthetic hands in unstructured environments. A wrist-mounted camera captures the scene, and a Bounding Volume Hierarchy (BVH) algorithm segments the target object and computes its bounding box. Grasp trajectories are generated via Rapidly-exploring Random Tree Star (RRT*), with each fingertip pose selected by minimum Euclidean distance to the object point cloud. Fingers are planned independently for adaptive, object-specific grasps, with Damped Least Squares inverse kinematics resolving joint angles. Validated via sim-to-real transfer on the physical Linker Hand O7."
  },
  {
    title: "Single-Actuator Driven Symmetric Five-Bar Mechanism for Producing Reciprocal Rectilinear High-Deflection Motion for Pumping Bag-Valve-Mask (BVM)",
    titleLink: "#",
    image: "static/papers/5bar.mp4",
    authors: [
      { name: "Nilanjan Chattaraj", link: "https://scholar.google.com/citations?user=WxgLo6kAAAAJ&hl=en" },
      { name: "Akash Bachhar", link: null }
    ],
    journal: "Journal of Vibration Engineering & Technologies (Accepted, 2025)",
    description: "This work presents a novel single-actuator driven symmetric five-bar mechanism capable of generating high-deflection reciprocal rectilinear motion, specifically designed for automated Bag-Valve-Mask (BVM) pumping applications. The mechanism achieves precise motion control with reduced mechanical complexity, offering a compact, reliable, and cost-effective solution for emergency respiratory support systems."
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
    description: "A new method using k-means image segmentation has been developed to accurately and quickly measure corrosion damage on mild steel surfaces. The study also tested the corrosion inhibition efficiency of four different inhibitors via electrochemical experiments. The experimental findings closely matched theoretical predictions, confirming that this image processing approach provides a reliable and practical means for evaluating corrosion inhibition.",
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
          <h3><a href="${pub.titleLink}" target="_blank">${pub.title}</a></h3>
          <p class="pub-authors">${authorsHTML}</p>
          <p class="pub-journal"><strong>${pub.journal}</strong></p>
          <p class="pub-description truncate-mobile">${pub.description}</p>
        </div>
      </div>
    `;
});

const projects = [
  {
    title: "Force-Reflecting Hand Exoskeleton for Master-Slave Remote Handling",
    titleLink: "#",
    image: "static/projects/allegro.mp4",
    description: "Designed and developed an indigenous, DRDO-funded remote manipulation system tailored for defense applications. The system features a custom-built hand exoskeleton providing precise, bidirectional kinesthetic force feedback, enhanced by integrated IMUs and potentiometers to accurately track and transmit joint angles. These master-side movements are kinematically retargeted to an Allegro robotic hand at the remote (slave) end, enabling dexterous manipulation. Grasping forces from the remote site are mirrored back to the user in real-time through the exoskeleton. Additionally, the setup incorporates a head-mounted display paired with a remotely operated 3-axis servo gimbal and 3D camera, delivering an immersive visual experience of the remote environment."
  },
  {
    title: "MARCUS - Magnetic Adhesion Remote Controlled Utility Surface-Crawler",
    titleLink: "#",
    image: "static/projects/marcus.mp4",
    description: "A flameproof, weather-resistant, remotely operated surface-crawling robot tailored for efficient LPG Horton sphere maintenance. Featuring permanent magnetic adhesion optimized specifically for curved surfaces and powered by pneumatic drive motors, the robot is wirelessly controlled via joystick from the ground. Its modular and adjustable magnetic system ensures optimal grip across varying sphere geometries. Capable of tasks such as cleaning, painting, and non-destructive testing (NDT), MARCUS significantly reduces manpower by up to 80%, operational time by 90%, and entirely eliminates risks associated with working at heights, including costly scaffolding requirements."
  },
  {
    title: "Quadruped Robot Gait Simulation using ROS and Gazebo",
    titleLink: "#",
    image: "static/projects/quadruped.jpeg",
    description: "Conducted simulations of quadruped robot locomotion in Gazebo, integrating ROS Control to analyze and enhance motion dynamics. Fine-tuned PID motor controllers to optimize robot stability and responsiveness. Developed precise forward and inverse kinematics algorithms for accurate limb manipulation. Additionally, implemented versatile static and dynamic gaits (trot and walk), enabling the quadruped to adeptly navigate inclined wedge terrains"
  },
  {
    title: "Roll Cage Design and Manufacturing for BAJA SAE 2023",
    titleLink: "#",
    image: "static/projects/ndors.mp4",
    description: "As Roll Cage Head of Team NDORS, NIT Durgapur, led the design and fabrication of a lightweight, high-strength roll cage for an all-terrain vehicle competing in BAJA SAE India 2023. Optimized material selection and structural design according to the rulebook, achieving a 20% cost reduction and 30% weight reduction over the previous year. Performed extensive 2D and 3D static (frontal, rear, side impacts, bump tests) and dynamic analyses (rollover, head-on collisions), continuously refining the design for maximum safety and performance. Ensured ergonomic integration of the driver and vehicle subsystems for real-world usability. Supervised manufacturing validation through weld strength testing (UTM), drop tests, and other quality checks. The team secured 2nd place in CAE Presentation, 3rd in All-Terrain Performance among IITs and NITs, and achieved an overall rank of 16th and 19th nationally."
  },
  {
    title: "SpecsX – Gyroscopic Smart Glasses for Hands-Free Computer Control",
    titleLink: "https://github.com/akashbachhar/SpecsX",
    image: "static/projects/specsx.png",
    description: "Built a lightweight, gyroscope-equipped eyewear system that allows specially-abled individuals to control a computer's mouse and keyboard purely through head movements. Mouse clicks, including left-click, right-click, and double-click, are triggered intelligently by detecting eye blinks and their durations. SpecsX opens up enormous opportunities in education, communication, and digital access for specially-abled individuals, helping them interact with technology independently and confidently."
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
          <h3><a href="${proj.titleLink}" target="_blank">${proj.title}</a></h3>
          <p class="project-description truncate-mobile">${proj.description}</p>
        </div>
      </div>
    `;
});
const miniProjects = [
  {
    title: "HandX – Robotic Hand Control via Image Processing-based Hand Posture Detection",
    titleLink: "#",
    image: "static/mini-projects/handx.mp4"
  },
  {
    title: "ArmX – Precision Pick-and-Place with UR5e Robot using MoveIt",
    titleLink: "https://github.com/akashbachhar/grasp-and-geometry-detection-ros",
    image: "static/mini-projects/ur5e.mp4"
  },
  {
    title: "Third Eye – Real-Time Driver Drowsiness Detection and Alert System",
    titleLink: "https://github.com/akashbachhar/third-eye",
    image: "static/mini-projects/third-eye.mp4"
  },

  {
    title: "Design, Simulation, and Fabrication of High-Performance Solid Rocket Nozzle",
    titleLink: "#",
    image: "static/mini-projects/nozzle.mp4"
  },
  {
    title: "SpeedX – Immersive Gyroscope-Controlled Racing Game for Medical Rehabilitation",
    titleLink: "https://github.com/akashbachhar/SpeedX",
    image: "static/mini-projects/speedx.png"
  },
  {
    title: "SolarSteps – Sunshine Availability Visualization App (NASA Space Apps Challenge)",
    titleLink: "https://github.com/akashbachhar/SolarSteps",
    image: "static/mini-projects/solarsteps.png"
  }


];

// Render mini hobby projects
const miniProjectsGrid = document.getElementById('mini-projects-grid');

miniProjects.forEach(mini => {
  miniProjectsGrid.innerHTML += `
    <div class="mini-project-item">
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
      <h4>
        <a href="${mini.titleLink}" target="_blank">
          ${mini.title}
        </a>
      </h4>
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
