import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// 1. Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Link Lenis to ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// 2. Navbar Scroll Animation (Stable Two-State Toggle)
const nav = document.querySelector('.navbar');
ScrollTrigger.create({
  trigger: 'body',
  start: 'top -50',
  onToggle: (self) => {
    if (self.isActive) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
});

// 3. Hero Animations (Entrance)
const heroTl = gsap.timeline();
heroTl.from('.hero-badge', { opacity: 0, y: -20, duration: 0.8, ease: 'power3.out' })
      .from('.hero-content h1', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' }, "-=0.6")
      .from('.hero-content p', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' }, "-=0.8")
      .from('.hero-btns', { opacity: 0, y: 20, duration: 1, ease: 'power3.out' }, "-=0.8")
      .from('.hero-main-img', { opacity: 0, scale: 0.9, duration: 1.2, ease: 'power4.out' }, "-=1.2")
      .from('.floating-ui', { opacity: 0, scale: 0.5, stagger: 0.3, duration: 1, ease: 'back.out(1.7)' }, "-=1");

// 4. Parallax Hero Visuals
gsap.to('.hero-main-img', {
  yPercent: 15,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

gsap.to('.deco-blob', {
  yPercent: -30,
  rotation: 15,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

// Floating Decorations Parallax (Stronger & Varied)
gsap.utils.toArray('.deco-element').forEach((deco, i) => {
  const isIcon = deco.classList.contains('deco-icon');
  const speed = isIcon ? (i % 2 === 0 ? 200 : 150) : 100;
  
  gsap.to(deco, {
    y: speed,
    rotation: isIcon ? (i % 2 === 0 ? 45 : -45) : 0,
    ease: 'none',
    scrollTrigger: {
      trigger: deco.parentElement,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
      invalidateOnRefresh: true
    }
  });
});

// 5. Interactive Card Effects (Tilt)
const interactElements = gsap.utils.toArray('.bento-item, .testimonial-card');
interactElements.forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    gsap.to(el, {
      rotateX: rotateX,
      rotateY: rotateY,
      scale: 1.02,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 1000
    });
  });

  el.addEventListener('mouseleave', () => {
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
});

// 6. Scroll Reveal Logic (STABLE FIX)
// We trigger the parent sections directly and use individual item staggers
// This is much more reliable than triggering the grid itself

// Background Bento Reveal
const bentoTrigger = document.querySelector('#background');
if (bentoTrigger) {
  gsap.from('.bento-item', {
    scrollTrigger: {
      trigger: bentoTrigger,
      start: "top bottom-=50", // Mulai saat sedikit muncul dari bawah
      end: "top 20%",         // Sudah 100% muncul saat section baru naik sedikit (20% dari atas layar)
      scrub: 1,
      invalidateOnRefresh: true,
    },
    opacity: 0,
    y: 60,
    stagger: 0.1,
    ease: "none"
  });
}

// Framework & Classes Reveal
gsap.utils.toArray('.testimonial-grid').forEach(grid => {
  gsap.from(grid.querySelectorAll('.testimonial-card'), {
    scrollTrigger: {
      trigger: grid,
      start: "top bottom-=50",
      end: "top 20%",
      scrub: 1,
      invalidateOnRefresh: true,
    },
    opacity: 0,
    y: 50,
    stagger: 0.1,
    ease: "none"
  });
});

// 7. Button Magnetic Effect
const btns = gsap.utils.toArray('.btn');
btns.forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
  });
});

// Smooth Scroll for Nav Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target, { offset: -80 });
    }
  });
});

// Final Fix for all miscalculations
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

// Also refresh when Lenis says scroll height changed
lenis.on('scroll', () => {
  // Optional: debounced refresh if needed
});
